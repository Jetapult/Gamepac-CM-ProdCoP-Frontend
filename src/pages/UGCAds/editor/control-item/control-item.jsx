import React from "react";
import useLayoutStore from "../../store/use-layout-store";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";
import Presets from "./presets";
import Animations from "./animations";
import Smart from "./smart";
import BasicText from "./basic-text";
import BasicImage from "./basic-image";
import BasicVideo from "./basic-video";
import BasicAudio from "./basic-audio";
import useStore from "../../store/store";

const Container = ({ children }) => {
  const { activeToolboxItem, setActiveToolboxItem } = useLayoutStore();
  const { activeIds, trackItemsMap, trackItemDetailsMap } = useStore();
  const [trackItem, setTrackItem] = useState(null);
  const [displayToolbox, setDisplayToolbox] = useState(false);

  useEffect(() => {
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const trackItemDetails = trackItemDetailsMap[id];
      const trackItem = {
        ...trackItemsMap[id],
        details: trackItemDetails?.details || {}
      };
      setTrackItem(trackItem);
    } else {
      setTrackItem(null);
      setDisplayToolbox(false);
    }
  }, [activeIds, trackItemsMap]);

  useEffect(() => {
    if (activeToolboxItem) {
      setDisplayToolbox(true);
    } else {
      setDisplayToolbox(false);
    }
  }, [activeToolboxItem]);

  if (!trackItem) {
    return null;
  }

  return (
    <div
      style={{
        right: activeToolboxItem && displayToolbox ? "0" : "-100%",
        transition: "right 0.25s ease-in-out",
        zIndex: 200
      }}
      className="w-[340px] h-[calc(100%-32px-64px)] mt-6 absolute top-1/2 -translate-y-1/2 rounded-lg shadow-lg flex"
    >
      <div className="w-[266px] h-full relative bg-background/80 backdrop-filter backdrop-blur-lg flex">
        <Button
          variant="ghost"
          className="absolute top-2 right-2 w-8 h-8 text-muted-foreground"
          size="icon"
        >
          <X
            width={16}
            onClick={() => {
              setDisplayToolbox(false);
              setActiveToolboxItem(null);
            }}
          />
        </Button>
        {React.cloneElement(children, {
          trackItem,
          activeToolboxItem
        })}
      </div>
      <div className="w-[74px]"></div>
    </div>
  );
};

const ActiveControlItem = ({
  trackItem,
  activeToolboxItem
}) => {
  if (!trackItem || !activeToolboxItem) {
    return null;
  }
  return (
    <>
      {
        {
          "basic-text": (
            <BasicText trackItem={trackItem} />
          ),
          "basic-image": (
            <BasicImage trackItem={trackItem} />
          ),
          "basic-video": (
            <BasicVideo trackItem={trackItem} />
          ),
          "basic-audio": (
            <BasicAudio trackItem={trackItem} />
          ),
          "preset-text": <Presets />,
          animation: <Animations />,
          smart: <Smart />
        }[activeToolboxItem]
      }
    </>
  );
};

export const ControlItem = () => {
  return (
    <Container>
      <ActiveControlItem />
    </Container>
  );
};
