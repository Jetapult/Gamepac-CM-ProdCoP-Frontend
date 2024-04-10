import { Fragment, useState } from "react";
import api from "../../../../api";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import Pagination from "../../../../components/Pagination";
import CreateUserPopup from "../popups/CreateUserPopup";
import { classNames } from "../../../../utils";

const StudioUsers = ({
  studio_id,
  setToastMessage,
  users,
  setUsers,
  currentPage,
  setCurrentPage,
  totalUsers,
  searchTerm,
  setSearchTerm,
}) => {
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const limit = 10;

  const InviteUser = async (user) => {
    try {
      const send_invite_response = await api.post(`v1/auth/send-invite`, {
        email: user.email,
      });
      if (send_invite_response.status === 201) {
        setToastMessage({
          show: true,
          message: "Invite email sent successfully",
          type: "success",
        });
      }
    } catch (err) {
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
  };

  const onEditUser = (user) => {
    setShowAddUserPopup(!showAddUserPopup);
    setSelectedUser(user);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl my-2"></h1>
        {/* <input
          type="text"
          placeholder="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        /> */}
        <button
          className="bg-[#f58174] text-white px-4 py-2 rounded-md"
          onClick={() => setShowAddUserPopup(!showAddUserPopup)}
        >
          <PlusIcon className="h-5 w-5 inline mr-1" /> New
        </button>
      </div>

      <div className="grid grid-cols-12 border-y-[0.5px] border-[#e5e5e5] py-3 items-center bg-[#f5e7e6] px-3 mt-4">
        <div className="col-span-1">
          <p>No.</p>
        </div>
        <div className="col-span-2">
          <p>Name</p>
        </div>
        <div className="col-span-3">
          <p>Email</p>
        </div>
        <div className="col-span-2">
          <p>Roles</p>
        </div>
        <div className="col-span-2">
          <p>Invite Status</p>
        </div>
        <div className="col-span-1">
          <p>Actions</p>
        </div>
        <div className="col-span-1">
          <p></p>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-334px)]">
        {users.map((user) => (
          <div
            className="grid grid-cols-12 px-3 py-3 border-b-[0.5px] border-[#e5e5e5] cursor-pointer"
            key={user.id}
          >
            <p className="col-span-1">{user.id}</p>
            <p className="col-span-2">{user.name}</p>
            <p className="col-span-3">{user.email}</p>
            <p className="col-span-2">{user.roles?.join(", ")}</p>
            <p className="col-span-2">{user.invite_status}</p>
            <p className="col-span-1">
              {user.invite_status !== "accepted" && (
                <button
                  className="bg-[#f58174] text-white px-4 py-1 rounded-md"
                  onClick={() => InviteUser(user)}
                >
                  Invite
                </button>
              )}
            </p>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex w-full justify-end gap-x-1.5 text-sm font-semibold"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                          onClick={(event) => onEditUser(user)}
                        >
                          Edit
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Delete
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        ))}
      </div>
      {totalUsers > 0 && (
        <Pagination
          totalReviews={totalUsers}
          currentPage={currentPage}
          limit={limit}
          setCurrentPage={setCurrentPage}
        />
      )}
      {showAddUserPopup && (
        <CreateUserPopup
          setShowModal={setShowAddUserPopup}
          setToastMessage={setToastMessage}
          setUsers={setUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          studio_id={studio_id}
        />
      )}
    </div>
  );
};
export default StudioUsers;
