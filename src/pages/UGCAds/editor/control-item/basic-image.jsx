import { ScrollArea } from "../../components/ui/scroll-area";
import Outline from "./common/outline";
import Shadow from "./common/shadow";
import Opacity from "./common/opacity";
import Rounded from "./common/radius";
import AspectRatio from "./common/aspect-ratio";
import { Button } from "../../components/ui/button";
import { Crop } from "lucide-react";
import { useEffect, useState } from "react";
import { EDIT_OBJECT, dispatch } from "@designcombo/events";
import Blur from "./common/blur";
import Brightness from "./common/brightness";
import Flip from "./common/flip";

const BasicImage = ({ trackItem }) => {
  const [properties, setProperties] = useState(trackItem);
  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

  const onChangeBorderWidth = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderWidth: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderWidth: v
        }
      };
    });
  };

  const onChangeBorderColor = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderColor: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderColor: v
        }
      };
    });
  };

  const handleChangeOpacity = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            opacity: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          opacity: v
        }
      };
    });
  };

  const onChangeBlur = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            blur: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          blur: v
        }
      };
    });
  };
  const onChangeBrightness = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            brightness: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          brightness: v
        }
      };
    });
  };

  const onChangeBorderRadius = (v) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderRadius: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderRadius: v
        }
      };
    });
  };

  const onChangeBoxShadow = (boxShadow) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            boxShadow: boxShadow
          }
        }
      }
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          boxShadow
        }
      };
    });
  };
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-sm text-text-primary font-medium h-12  flex items-center px-4 flex-none">
        Image
      </div>
      <ScrollArea className="h-full">
        <div className="px-4 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <Button variant={"secondary"} size={"icon"}>
              <Crop size={18} />
            </Button>
          </div>
          <AspectRatio />
          <Flip trackItem={trackItem} />
          <Rounded
            onChange={(v) => onChangeBorderRadius(v)}
            value={properties.details.borderRadius}
          />
          <Outline
            label="Outline"
            onChageBorderWidth={(v) => onChangeBorderWidth(v)}
            onChangeBorderColor={(v) => onChangeBorderColor(v)}
            valueBorderWidth={properties.details.borderWidth}
            valueBorderColor={properties.details.borderColor}
          />
          <Shadow
            label="Shadow"
            onChange={(v) => onChangeBoxShadow(v)}
            value={properties.details.boxShadow}
          />
          <Opacity
            onChange={(v) => handleChangeOpacity(v)}
            value={properties.details.opacity}
          />
          <Blur
            onChange={(v) => onChangeBlur(v)}
            value={properties.details.blur}
          />
          <Brightness
            onChange={(v) => onChangeBrightness(v)}
            value={properties.details.brightness}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicImage;
