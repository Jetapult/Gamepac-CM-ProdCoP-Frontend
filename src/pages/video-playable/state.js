export const initialSpriteState = {
  id: Date.now(),
  file: null,
  imageUrl: "",
  position: { x: 0.5, y: 0.5 },
  scale: 0.5,
  rotation: 0,
  anchor: { x: 0.5, y: 0.5 },
  transparency: 1,
  animation: {
    position: {
      enabled: false,
      destination: { x: 0.5, y: 0.5 },
      duration: 500,
      repeat: -1,
      easing: 'linear',
      yoyo: true
    },
    scale: {
      enabled: false,
      destination: { w: 1.2, h: 1.2 },
      duration: 500,
      repeat: -1,
      easing: 'linear',
      yoyo: true
    },
    transparency: {
      enabled: false,
      destination: 0.5,
      duration: 500,
      repeat: -1,
      easing: 'linear',
      yoyo: true
    }
  }
};

export const initialState = {
  general: {
    adName: "",
    videoSource: null,
    iosUrl: "",
    playstoreUrl: "",
  },
  modifications: []  // This will contain all overlays, breaks, and end screens
};

export const ModificationType = {
  OVERLAY: 'overlay',
  BREAK: 'break',
  END_SCREEN: 'end_screen'
};

// Base modification state that all types share
export const baseModificationState = {
  id: Date.now(),
  type: '',
  time: 0,
  background: false,
  backgroundColor: "#000000",
  transparency: 0.7,
  backgroundMusic: {
    file: null,
    volume: 1,
    repeat: 0,
  },
  sprites: [],
  relativeToScreenSize: true,
};

// Specific states for each type
export const overlayModificationState = {
  ...baseModificationState,
  type: ModificationType.OVERLAY,
  startTime: 0,
  endTime: 0,
  stopOnVideoResume: false,
};

export const breakModificationState = {
  ...baseModificationState,
  type: ModificationType.BREAK,
  stopOnVideoResume: true,
  background: true,
};

export const endScreenModificationState = {
  ...baseModificationState,
  type: ModificationType.END_SCREEN,
  stopOnVideoResume: true,
};
