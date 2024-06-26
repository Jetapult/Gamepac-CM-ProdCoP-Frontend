import React, { Fragment, useEffect, useState } from "react";
import api from "../api";
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { classNames } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import CreateStudioPopup from "../pages/Admin/components/popups/CreateStudioPopup";
import ToastMessage from "./ToastMessage";
import { useNavigate, useParams } from "react-router-dom";
import {
  addStudioData,
  addStudios,
  addTotalStudio,
} from "../store/reducer/adminSlice";

const AdminLayout = ({ children }) => {
  const userData = useSelector((state) => state.user.user);
  const studioList = useSelector((state) => state.admin.studios);
  const [studios, setStudios] = useState([]);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [showCreateStudioPopup, setShowCreateStudioPopup] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  // for Studio Details
  const onStudioChange = (studio) => {
    dispatch(addStudioData(studio));
  };

  const onDashboardSwitch = (studio) => {
    setSelectedStudio(studio);
    dispatch(addStudioData(studio));
    localStorage.setItem("selectedStudio", studio.slug);
    navigate(`/${studio.slug}/dashboard`);
    // if (parseInt(studio.id) !== parseInt(userData.studio_id)) {
    //   window.location.reload();
    // }
  };

  useEffect(() => {
    if(studioList.length){
      setStudios(studioList);
    }
  }, [studioList.length]);
  
  useEffect(() => {
    if (studios?.length) {
      const selectedStudio_slug = localStorage.getItem("selectedStudio");
      const studio = studios.find(
        (studio) => studio.slug === (selectedStudio_slug || params.studio_slug)
      );
      dispatch(addStudioData(studio));
      dispatch(addTotalStudio(studios.length));
      setSelectedStudio(studio);
    }
  }, [studios]);
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2 admin-sidebar bg-white border-r-[0.5px] border-[#e5e5e5]">
        <div className="p-4">
          <Menu as="div" className="relative mb-2">
            <div>
              <Menu.Button className="inline-flex w-full text-l font-bold">
                <p>
                  {selectedStudio?.studio_name}{" "}
                  <ChevronDownIcon className="w-5 h-5 inline" />
                </p>
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active, close }) => (
                      <div className="flex items-center justify-between py-1 pl-4 pr-2 border-b-[0.5px]">
                        <p className="text-sm font-bold text-gray-700">
                          Switch dashboard
                        </p>
                        <XMarkIcon
                          className="w-5 h-5 inline text-gray-700 cursor-pointer"
                          onClick={() => {
                            close();
                          }}
                        />
                      </div>
                    )}
                  </Menu.Item>
                  {studios.map((studio) => (
                    <Menu.Item key={studio.id} className="cursor-pointer">
                      {({ active }) => (
                        <a
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                          onClick={() => onDashboardSwitch(studio)}
                        >
                          {parseInt(studio.id) ===
                          parseInt(selectedStudio?.id) ? (
                            <CheckIcon className="w-5 h-5 inline mr-2" />
                          ) : (
                            <CheckIcon className="w-5 h-5 inline mr-2 opacity-0" />
                          )}
                          {studio?.studio_name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm cursor-pointer"
                        )}
                        onClick={() => setShowCreateStudioPopup(true)}
                      >
                        <PlusIcon className="h-5 w-5 inline mr-1" /> Create
                        Studio
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      <div className="col-span-10">
        <div className="bg-white p-4 content-hld">{children}</div>
      </div>
      {showCreateStudioPopup && (
        <CreateStudioPopup
          setShowModal={setShowCreateStudioPopup}
          setToastMessage={setToastMessage}
          setStudios={setStudios}
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

export default AdminLayout;
