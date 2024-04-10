import { Fragment, useEffect, useState } from "react";
import api from "../../api";
import "./admin.css";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/20/solid";
import CreateStudioPopup from "./components/popups/CreateStudioPopup";
import ToastMessage from "../../components/ToastMessage";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { classNames } from "../../utils";

const Studios = () => {
  const [studios, setStudios] = useState([]);
  const [showCreateStudioPopup, setShowCreateStudioPopup] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [selectedStudio, setSelectedStudio] = useState({});
  const navigate = useNavigate();

  const onEditStudio = (event, studio) => {
    event.stopPropagation();
    setShowCreateStudioPopup(!showCreateStudioPopup);
    setSelectedStudio(studio);
  };
  const getStudios = async () => {
    try {
      const res = await api.get("/v1/game-studios");
      setStudios(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getStudios();
  }, []);
  return (
    <div className="grid grid-cols-12 pr-4">
      <div className="col-span-2 admin-sidebar bg-white mr-4">
        <div className="p-2 ">
          <p className="">Admin Panel</p>
          <div className="pl-2">
            <a className="py-4" href="/admin/studios">
              Studios
            </a>
          </div>
        </div>
      </div>
      <div className="col-span-10">
        <div className="bg-white p-2 mt-6 rounded-t-lg content-hld">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl my-2">Studios</h1>
            <button
              className="bg-[#f58174] text-white px-4 py-2 rounded-md"
              onClick={() => setShowCreateStudioPopup(!showCreateStudioPopup)}
            >
              <PlusIcon className="h-5 w-5 inline mr-1" /> Add Studio
            </button>
          </div>

          <div className="grid grid-cols-12 border-y-[0.5px] border-[#e5e5e5] py-3 items-center bg-[#f5e7e6] px-3">
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
              <p>Phone</p>
            </div>
            <div className="col-span-3">
              <p>Domains</p>
            </div>
            <div className="col-span-3">
              <p></p>
            </div>
          </div>
          {studios.map((studio) => (
            <div
              className="grid grid-cols-12 px-3 py-3 border-b-[0.5px] border-[#e5e5e5] cursor-pointer"
              key={studio.id}
              onClick={() => navigate(`/admin/studios/${studio.id}`)}
            >
              <p className="col-span-1">{studio.id}</p>
              <p className="col-span-2">{studio.studio_name}</p>
              <p className="col-span-3">{studio.contact_email}</p>
              <p className="col-span-2">{studio.phone}</p>
              <p className="col-span-3">{studio.domains?.join(", ")}</p>
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
                            onClick={(event) => onEditStudio(event, studio)}
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
      </div>
      {showCreateStudioPopup && (
        <CreateStudioPopup
          setShowModal={setShowCreateStudioPopup}
          setToastMessage={setToastMessage}
          setStudios={setStudios}
          selectedStudio={selectedStudio}
          setSelectedStudio={setSelectedStudio}
        />
      )}
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default Studios;
