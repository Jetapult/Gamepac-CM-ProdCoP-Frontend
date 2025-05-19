import { useSelector } from "react-redux";
import UserInput from "./components/UserInput";
import { useState } from "react";
import Feed from "./components/Feed";

const UAIntelligence = () => {
  const user = useSelector((state) => state.user.user);
  const [ads, setAds] = useState([]);
  const [isGameAnalyzed, setIsGameAnalyzed] = useState(false);
  return (
    <div>
      {isGameAnalyzed ? (
        <Feed />
      ) : (
        <UserInput
          user={user}
          setAds={setAds}
          setIsGameAnalyzed={setIsGameAnalyzed}
        />
      )}
    </div>
  );
};

export default UAIntelligence;
