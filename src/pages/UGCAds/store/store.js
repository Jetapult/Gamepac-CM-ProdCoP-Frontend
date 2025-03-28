import { create } from "zustand";

const useStore = create((set) => ({
  timeline: null,
  duration: 5000,
  fps: 30,
  scale: {
    // 1x distance (second 0 to second 5, 5 segments).
    unit: 300,
    zoom: 1 / 240,
    segments: 5
  },
  scroll: {
    left: 0,
    top: 0
  },
  playerRef: null,
  trackItemDetailsMap: {},
  activeIds: [],
  targetIds: [],
  tracks: [],
  trackItemIds: [],
  transitionIds: [],
  transitionsMap: {},
  trackItemsMap: {},

  setTimeline: (timeline) =>
    set(() => ({
      timeline: timeline
    })),
  setScale: (scale) =>
    set(() => ({
      scale: scale
    })),
  setScroll: (scroll) =>
    set(() => ({
      scroll: scroll
    })),
  setState: async (state) => {
    return set({ ...state });
  },
  setPlayerRef: (playerRef) => set({ playerRef })
}));

export default useStore;
