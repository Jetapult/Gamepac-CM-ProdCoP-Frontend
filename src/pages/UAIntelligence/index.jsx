import { useSelector } from "react-redux";
import Feed from "./components/Feed";

const UAIntelligence = () => {
  const user = useSelector((state) => state.user.user);
  return <Feed user={user} />;
};

export default UAIntelligence;
