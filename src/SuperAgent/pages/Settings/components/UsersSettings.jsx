import React, { useState, useEffect, Fragment, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  AltArrowDown,
  CheckSquare,
  MenuDots,
  MinusSquare,
  Stop,
  TrashBinMinimalistic,
  Pen,
} from "@solar-icons/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../../../../api";
import AddUserPopup from "../../../components/shared/AddUserPopup";
import BulkUploadUsersPopup from "../../../components/shared/BulkUploadUsersPopup";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import ToastMessage from "../../../../components/ToastMessage";
import FileIcon from "../../../../assets/super-agents/file-icon.svg";

// Checkbox component
const Checkbox = ({ checked, onChange, indeterminate }) => {
  if (indeterminate && !checked) {
    return (
      <div onClick={onChange} className="cursor-pointer">
        <MinusSquare weight="Bold" size={22} color="#1f6744" />
      </div>
    );
  }

  if (checked) {
    return (
      <div onClick={onChange} className="cursor-pointer">
        <CheckSquare weight="Bold" size={22} color="#1f6744" />
      </div>
    );
  }

  return (
    <div onClick={onChange} className="cursor-pointer">
      <Stop weight="Linear" size={22} color="#6d6d6d" />
    </div>
  );
};

const UsersSettings = ({ studioData }) => {
  const userData = useSelector((state) => state.user.user);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [inviteLoader, setInviteLoader] = useState("");
  const addUserDropdownRef = useRef(null);

  // Popup states
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showBulkUploadPopup, setShowBulkUploadPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Dropdown state
  const [showAddUserDropdown, setShowAddUserDropdown] = useState(false);

  const limit = 20;

  const getUsersByStudioId = async (page = 1, append = false) => {
    if (!studioData?.slug) return;

    setIsLoading(true);

    try {
      const response = await api.get(
        `/v1/users/studio/${studioData.slug}?current_page=${page}&limit=${limit}`
      );
      const newUsers = response.data.data || [];
      const total = response.data.totalUsers || 0;

      if (append) {
        setUsers((prev) => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
      setTotalUsers(total);
      setHasMore(page * limit < total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (!append) {
        setUsers([]);
        setTotalUsers(0);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and reset when studio changes
  useEffect(() => {
    setCurrentPage(1);
    setUsers([]);
    setHasMore(true);
    getUsersByStudioId(1, false);
    setSelectedUsers([]);
  }, [studioData?.slug]);

  // Load more users for infinite scroll
  const loadMoreUsers = () => {
    if (!isLoading && hasMore) {
      getUsersByStudioId(currentPage + 1, true);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addUserDropdownRef.current &&
        !addUserDropdownRef.current.contains(event.target)
      ) {
        setShowAddUserDropdown(false);
      }
    };
    if (showAddUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddUserDropdown]);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      // Don't allow selecting current user
      setSelectedUsers(
        users.filter((u) => u.id !== userData?.id).map((user) => user.id)
      );
    }
  };

  const handleSelectUser = (userId) => {
    // Don't allow selecting current user
    if (userId === userData?.id) return;

    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await api.delete(
        `/v1/users/${studioData?.id}/${selectedUser.id}`
      );
      if (response.data.data) {
        setToastMessage({
          show: true,
          message: "User deleted successfully",
          type: "success",
        });
        setShowDeleteConfirmation(false);
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
        setSelectedUser(null);
        setSelectedUsers((prev) => prev.filter((id) => id !== selectedUser.id));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to delete user",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await api.delete(`/v1/users/bulk-delete/${studioData?.id}`, {
        data: { user_ids: selectedUsers },
      });

      const { deleted, failed } = response.data.data || {};
      const deletedCount = deleted?.length || 0;
      const failedCount = failed?.length || 0;

      // Remove successfully deleted users from the list
      if (deletedCount > 0) {
        // Get IDs of deleted users by matching emails
        const deletedUserIds = users
          .filter((user) => deleted?.includes(user.email))
          .map((user) => user.id);

        setUsers((prev) =>
          prev.filter((user) => !deletedUserIds.includes(user.id))
        );
        setSelectedUsers((prev) =>
          prev.filter((id) => !deletedUserIds.includes(id))
        );
      }

      // Show appropriate toast message
      if (failedCount > 0 && deletedCount > 0) {
        const failedReasons = failed.map((f) => f.reason).join(", ");
        setToastMessage({
          show: true,
          message: `${deletedCount} user(s) deleted. ${failedCount} failed: ${failedReasons}`,
          type: "warning",
        });
      } else if (failedCount > 0) {
        const failedReasons = failed.map((f) => f.reason).join(", ");
        setToastMessage({
          show: true,
          message: `Failed to delete users: ${failedReasons}`,
          type: "error",
        });
      } else {
        setToastMessage({
          show: true,
          message: response.data.message || `${deletedCount} user(s) deleted successfully`,
          type: "success",
        });
      }

      setShowDeleteConfirmation(false);
    } catch (err) {
      console.error("Failed to delete users:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to delete users",
        type: "error",
      });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowAddUserPopup(true);
  };

  const handleInviteUser = async (user) => {
    try {
      setInviteLoader(user.id);
      const response = await api.post(`v1/auth/${studioData?.id}/send-invite`, {
        email: user.email,
      });
      setInviteLoader("");
      if (response.status === 201) {
        setToastMessage({
          show: true,
          message: "Invite email sent successfully",
          type: "success",
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, invite_status: "invited" } : u
          )
        );
      }
    } catch (err) {
      setInviteLoader("");
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to send invite",
        type: "error",
      });
    }
  };

  const isAllSelected =
    users.length > 0 &&
    selectedUsers.length === users.filter((u) => u.id !== userData?.id).length;
  const isIndeterminate =
    selectedUsers.length > 0 &&
    selectedUsers.length < users.filter((u) => u.id !== userData?.id).length;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between pb-5 shrink-0">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Users
        </h3>
        <div className="relative" ref={addUserDropdownRef}>
          <button
            onClick={() => setShowAddUserDropdown(!showAddUserDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f6744] text-white font-urbanist font-medium text-[14px] rounded-lg hover:bg-[#1a5a3a] transition-colors"
          >
            <Plus size={18} color="#ffffff" />
            Add user
            <AltArrowDown weight={"Linear"} size={16} color="#fff" />
          </button>
          {showAddUserDropdown && (
            <div className="absolute right-0 top-full mt-1 w-[175px] bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-20 p-1">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowAddUserPopup(true);
                  setShowAddUserDropdown(false);
                }}
                className="w-full inline-flex items-center gap-1 text-left px-4 py-2 font-urbanist text-[14px] text-[#141414] hover:bg-[#f6f6f6] rounded-t-lg border-b border-[#f1f1f1] cursor-pointer"
              >
                <Plus size={25} strokeWidth={1} />
                Add New User
              </button>
              <button
                onClick={() => {
                  setShowBulkUploadPopup(true);
                  setShowAddUserDropdown(false);
                }}
                className="w-full inline-flex items-center gap-2 text-left px-4 py-2 font-urbanist text-[14px] text-[#141414] hover:bg-[#f6f6f6] rounded-b-lg cursor-pointer"
              >
                <img src={FileIcon} alt="File" className="size-5" />
                Add via CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container - Flex grow with overflow */}
      <div className="flex-1 flex flex-col border border-[#f6f6f6] rounded-lg overflow-hidden min-h-0">
        {/* Table Header - Fixed */}
        <div className="shrink-0 bg-white">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-[#f6f6f6]">
                <th className="w-[48px] px-4 py-3 text-left">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[200px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Name
                  </span>
                </th>
                <th className="w-[250px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Email
                  </span>
                </th>
                <th className="w-[220px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Roles
                  </span>
                </th>
                <th className="w-[120px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Invite status
                  </span>
                </th>
                <th className="w-[100px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body - Scrollable with infinite scroll */}
        <div id="usersScrollableDiv" className="flex-1 overflow-y-auto">
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1F6744]"></div>
                <span className="font-urbanist text-[14px] text-[#6d6d6d]">
                  Loading...
                </span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="font-urbanist text-[14px] text-[#6d6d6d]">
                No users found
              </span>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={users.length}
              next={loadMoreUsers}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center items-center py-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F6744]"></div>
                    <span className="font-urbanist text-sm text-[#6d6d6d]">
                      Loading more users...
                    </span>
                  </div>
                </div>
              }
              endMessage={
                <div className="flex justify-center items-center py-4">
                  <span className="font-urbanist text-[12px] text-[#b0b0b0]">
                    {users.length > 0
                      ? `You've seen all ${totalUsers} users`
                      : ""}
                  </span>
                </div>
              }
              scrollableTarget="usersScrollableDiv"
            >
              <table className="w-full table-fixed">
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-[#f6f6f6] hover:bg-[#fafafa] transition-colors ${
                        selectedUsers.includes(user.id) ? "bg-[#f1fcf6]" : ""
                      }`}
                    >
                      <td className="w-[48px] px-4 py-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td className="w-[200px] px-3 py-3">
                        <div className="flex items-center gap-3">
                          {user.profile_pic ? (
                            <img
                              src={user.profile_pic}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#f6f6f6] shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1F6744] flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-medium">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <span className="font-urbanist font-medium text-sm text-[#141414] truncate">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="w-[250px] px-3 py-3">
                        <span className="font-urbanist font-medium text-sm text-[#141414] truncate block">
                          {user.email}
                        </span>
                      </td>
                      <td className="w-[220px] px-3 py-3">
                        <div className="flex items-center gap-4 flex-wrap">
                          {user.roles?.map((role, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center text-xs font-medium capitalize text-[#1976D2] bg-[#edfbfe] rounded-full px-2 py-1.5"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="w-[120px] px-3 py-3">
                        <span className="font-urbanist font-medium text-sm text-[#141414] capitalize">
                          {user.invite_status}
                        </span>
                      </td>
                      <td className="w-[100px] px-3 py-3">
                        <div className="flex items-center justify-end gap-3">
                          {user.invite_status !== "accepted" && (
                            <button
                              onClick={() => handleInviteUser(user)}
                              disabled={inviteLoader === user.id}
                              className="font-urbanist font-medium text-sm text-[#1F6744] hover:underline disabled:opacity-50"
                            >
                              {inviteLoader === user.id
                                ? "Sending..."
                                : "Invite"}
                            </button>
                          )}
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-1 hover:bg-[#f6f6f6] rounded transition-colors">
                              <MenuDots
                                weight="Bold"
                                size={16}
                                color="#6D6D6D"
                              />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-20 mt-1 w-32 bg-white border border-[#f6f6f6] rounded-lg shadow-lg">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className={`w-full inline-flex items-center gap-2 text-left px-3 py-2 font-urbanist text-[14px] ${
                                        active ? "bg-[#f6f6f6]" : ""
                                      }`}
                                    >
                                      <Pen
                                        weight="Linear"
                                        size={14}
                                        color="#6D6D6D"
                                      />
                                      Edit
                                    </button>
                                  )}
                                </Menu.Item>
                                {userData?.id !== user.id && (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setShowDeleteConfirmation(true);
                                        }}
                                        className={`w-full inline-flex items-center gap-2 text-left px-3 py-2 font-urbanist text-[14px] text-[#f25a5a] ${
                                          active ? "bg-[#f6f6f6]" : ""
                                        }`}
                                      >
                                        <TrashBinMinimalistic
                                          weight="Linear"
                                          size={14}
                                          color="#f25a5a"
                                        />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                )}
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InfiniteScroll>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-30">
          <span className="font-urbanist font-medium text-[14px] text-[#141414]">
            {selectedUsers.length} selected
          </span>
          <div className="w-px h-6 bg-[#f6f6f6]" />
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="flex items-center gap-1 font-urbanist font-medium text-[14px] text-[#f25a5a] hover:opacity-80"
          >
            <TrashBinMinimalistic weight="Linear" size={16} color="#f25a5a" />
            Delete
          </button>
        </div>
      )}

      {/* Popups */}
      {showAddUserPopup && (
        <AddUserPopup
          setShowModal={setShowAddUserPopup}
          setToastMessage={setToastMessage}
          setUsers={setUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          studio_id={studioData?.id}
          userData={userData}
        />
      )}

      {showBulkUploadPopup && (
        <BulkUploadUsersPopup
          setShowBulkUploadPopup={setShowBulkUploadPopup}
          studio_id={studioData?.id}
          onUploadSuccess={(data) => {
            setToastMessage({
              show: true,
              message:
                data?.message ||
                `${data?.userAddedCount || 0} users uploaded successfully`,
              type: "success",
            });
            // Refresh users list
            getUsersByStudioId(1, false);
            setShowBulkUploadPopup(false);
          }}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationPopup
          heading="Remove user?"
          subHeading={
            selectedUsers.length > 1
              ? `Removing ${selectedUsers.length} users will revoke their access to GamePac. Are you sure?`
              : `Removing a user will revoke their access to GamePac. Are you sure?`
          }
          onCancel={() => {
            setShowDeleteConfirmation(false);
            if (!selectedUsers.length) setSelectedUser(null);
          }}
          onConfirm={
            selectedUsers.length > 1 ? handleBulkDelete : handleDeleteUser
          }
        />
      )}

      {/* Toast Message */}
      {toastMessage?.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default UsersSettings;
