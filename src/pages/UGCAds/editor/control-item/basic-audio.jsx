import { ScrollArea } from "../../components/ui/scroll-area";
import Volume from "./common/volume";
import Speed from "./common/speed";
import { useState } from "react";
import { EDIT_OBJECT, dispatch } from "@designcombo/events";

const BasicAudio = ({ trackItem }) => {
  const [properties, setProperties] = useState(trackItem);

  const handleChangeVolume = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            volume: v
          }
        }
      }
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          volume: v
        }
      };
    });
  };

  const handleChangeSpeed = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          playbackRate: v
        }
      }
    });

    setProperties((prev) => {
      return {
        ...prev,
        playbackRate: v
      };
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-sm text-text-primary font-medium h-12  flex items-center px-4 flex-none">
        Audio
      </div>
      <ScrollArea className="h-full">
        <div className="px-4 flex flex-col gap-2">
          <Volume
            onChange={(v) => handleChangeVolume(v)}
            value={properties.details.volume}
          />
          <Speed
            value={properties.playbackRate}
            onChange={handleChangeSpeed}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicAudio;
