import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ToastMessage from "../../components/ToastMessage";
import StudioUsers from "./components/studiousers/StudioUsers";
import StudioGames from "./components/studiogames/StudioGames";
import api from "../../api";

const tabs = [
  {
    id: "1",
    label: "Users",
    value: "users",
  },
  {
    id: "2",
    label: "Games",
    value: "games",
  },
];

const StudioDetails = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedTab, setSelectedTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const params = useParams();

  const getUsersBystudioId = async () => {
    try {
      const users_response = await api.get(
        `/v1/users/studio/${params.studio_id}?current_page=${currentPage}&limit=10${searchTerm ? "&searchTerm=" + searchTerm : ""}`
      );
      setUsers(users_response.data.data);
      setTotalUsers(users_response.data.totalUsers);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getUsersBystudioId();
  }, [currentPage]);

//   useEffect(() => {
//     const getSearchData = setTimeout(() => {
//       if(searchTerm.length > 0){
//         getUsersBystudioId();
//       }
//     }, 2000)
//     return () => clearTimeout(getSearchData)
// }, [searchTerm])

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
          <div className="flex border-b-[0.5px] border-b-[#e5e5e5] my-3 pl-3">
            {tabs.map((tab) => (
              <p
                className={`mr-6 cursor-pointer text-lg ${
                  selectedTab === tab.value
                    ? "text-black border-b-[2px] border-black"
                    : "text-[#808080]"
                }`}
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.value);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </p>
            ))}
          </div>
          {selectedTab === "users" && (
            <StudioUsers
              studio_id={params.studio_id}
              setToastMessage={setToastMessage}
              users={users}
              setUsers={setUsers}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalUsers={totalUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          {selectedTab === "games" && (
            <StudioGames
              studio_id={params.studio_id}
              setToastMessage={setToastMessage}
              users={users}
            />
          )}
        </div>
      </div>

      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default StudioDetails;
