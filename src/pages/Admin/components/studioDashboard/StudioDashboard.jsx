import React, { useEffect, useState } from "react";
import api from "../../../../api";
import { useSelector } from "react-redux";

const StudioDashboard = ({ studioData }) => {
  const totalStudio = useSelector((state) => state.admin.totalStudio);
  const data = [
    {
      id: "1",
      name: "studios",
      show: studioData?.studio_type?.includes("studio_manager") ? true : false,
    },
    {
      id: "2",
      name: "users",
      show: true,
    },
    {
      id: "3",
      name: "games",
      show: !studioData?.studio_type?.includes("studio_manager") ? true : false,
    },
    {
      id: "4",
      name: "reviews",
      show: !studioData?.studio_type?.includes("studio_manager") ? true : false,
    },
  ];
  const [overview, setOverview] = useState({});
  const getStudiosOverview = async () => {
    try {
      const res = await api.get(`/v1/game-studios/overviw/${studioData.slug}`);
      setOverview(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (studioData?.id) {
      getStudiosOverview();
    }
  }, [studioData?.id]);
  return (
    <div className="grid grid-cols-12 gap-10 mt-10">
      {data.map((item) => (
        <React.Fragment key={item.id}>
          {item.show && (
            <div className="col-span-3">
              <div className="rounded-3xl bg-white p-4 shadow border border-[#000] border-b-4 min-h-40 items-center flex flex-col justify-center transition-transform duration-300 hover:scale-105 hover:bg-[#f3f3f3]">
                <p className="text-5xl">
                  {item.name === "studios"
                    ? totalStudio - 1
                    : overview[item.name]}
                </p>
                <p className="text-xl text-gray-700 capitalize">
                  Total {item.name}
                </p>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StudioDashboard;
