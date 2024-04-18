import { useEffect, useState } from "react";
import api from "../../../../api";

const data = [
  // {
  //   id: "1",
  //   name: "studios",
  // },
  {
    id: "2",
    name: "users",
  },
  {
    id: "3",
    name: "games",
  },
  {
    id: "4",
    name: "reviews",
  },
];
const StudioDashboard = ({ studioData }) => {
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
    if (studioData.id) {
      getStudiosOverview();
    }
  }, [studioData.id]);
  return (
    <div className="grid grid-cols-12 gap-10 mt-10">
      {data.map((item) => (
        <div className="col-span-3" key={item.id}>
          <div className="rounded-md bg-white p-4 shadow border-[0.5px] border-[#f6f6f7]">
            <p className="text-5xl">{overview[item.name]}</p>
            <p className="text-xl text-gray-700 capitalize">
              Total {item.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudioDashboard;
