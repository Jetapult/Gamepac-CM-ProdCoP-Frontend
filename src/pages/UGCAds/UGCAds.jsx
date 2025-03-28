import React, { useEffect } from "react";
import Editor from "./editor/editor";
import {getCompactFontData} from "./editor/utils/fonts"
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import "./ugcads.css"; 

const UGCAds = () => {
  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);
  return <div className="ugc-ads-root">
    <Editor />
  </div>;
};

export default UGCAds;
