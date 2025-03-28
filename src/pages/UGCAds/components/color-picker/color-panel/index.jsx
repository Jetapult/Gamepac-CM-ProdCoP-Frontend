import { FC, useState, useRef, useEffect, MutableRefObject } from "react";
import Board from "./board";
import Ribbon from "./ribbon";
import Alpha from "./alpha";

import TinyColor from "../utils/color";

const Panel = ({ alpha, hex, colorBoardHeight, onChange }) => {
  const node = useRef();

  const colorConvert = new TinyColor(hex);
  colorConvert.alpha = alpha;
  const [state, setState] = useState({
    color: colorConvert,
    alpha
  });
  const [change, setChange] = useState(false);

  useEffect(() => {
    if (!change) {
      setState({
        color: colorConvert,
        alpha
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex, alpha]);

  const handleAlphaChange = (alpha) => {
    setChange(true);
    const { color } = state;
    color.alpha = alpha;

    setState({
      color,
      alpha
    });
    onChange({
      hex: color.toHexString(),
      alpha
    });
  };

  const handleChange = (color) => {
    setChange(true);
    const { alpha } = state;
    color.alpha = alpha;

    setState({ ...state, color, alpha: color.alpha });
    onChange({
      hex: color.toHexString(),
      alpha: color.alpha
    });
  };

  return (
    <div ref={node} tabIndex={0}>
      <div className="relative">
        <Board
          rootPrefixCls="color-picker-panel"
          color={state.color}
          colorBoardHeight={colorBoardHeight}
          onChange={handleChange}
          setChange={setChange}
        />
        <div className="flex flex-col gap-4">
          <div className="h-2.5">
            <Ribbon
              rootPrefixCls="color-picker-panel"
              color={state.color}
              onChange={handleChange}
              setChange={setChange}
            />
          </div>
          <div className="h-2.5">
            <Alpha
              alpha={state.alpha}
              color={state.color}
              onChange={handleAlphaChange}
              setChange={setChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;
