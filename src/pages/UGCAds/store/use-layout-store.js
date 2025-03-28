import { create } from "zustand";

const useLayoutStore = create((set) => ({
  activeMenuItem: null,
  showMenuItem: false,
  cropTarget: null,
  showControlItem: false,
  showToolboxItem: false,
  activeToolboxItem: null,
  gptScriptWriterPopup: false,
  setGptScriptWriterPopup: (gptScriptWriterPopup) => set({ gptScriptWriterPopup }),
  setCropTarget: (cropTarget) => set({ cropTarget }),
  setActiveMenuItem: (showMenu) => set({ activeMenuItem: showMenu }),
  setShowMenuItem: (showMenuItem) => set({ showMenuItem }),
  setShowControlItem: (showControlItem) => set({ showControlItem }),
  setShowToolboxItem: (showToolboxItem) => set({ showToolboxItem }),
  setActiveToolboxItem: (activeToolboxItem) => set({ activeToolboxItem })
}));

export default useLayoutStore;
