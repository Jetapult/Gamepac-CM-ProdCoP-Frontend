import { useEffect, useRef } from "react";
import Composition from "./composition";
import { Player as RemotionPlayer } from "@remotion/player";
import useStore from "../../store/store";

const Player = () => {
  const playerRef = useRef(null);
  const { setPlayerRef, duration, fps } = useStore();

  useEffect(() => {
    setPlayerRef(playerRef);
  }, []);

  const calculatedDurationInFrames = Math.round((duration / 1000) * fps);
  const safeDurationInFrames = Math.max(1, calculatedDurationInFrames);

  return (
    <RemotionPlayer
      ref={playerRef}
      component={Composition}
      durationInFrames={safeDurationInFrames}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{ width: "100%", height: "100%" }}
      inputProps={{}}
      fps={30}
    />
  );
};
export default Player;
