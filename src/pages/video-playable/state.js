export const initialSpriteState = {
  id: Date.now(),
  file: null,
  imageUrl: '',
  position: { x: 0.5, y: 0.5 },
  scale: 0.5,
  rotation: 0,
  anchor: { x: 0.5, y: 0.5 },
  transparency: 1,
  animations: {}
};

export const initialState = {
  general: {
    adName: '',
    videoSource: null,
    iosUrl: '',
    playstoreUrl: ''
  },
  overlays: [],
  breaks: [],
  endScreens: []
};

export const initialBreakState = {
  time: 0,
  background: false,
  backgroundColor: "#000000",
  backgroundMusic: {
    file: null,
    volume: 1,
    repeat: 1
  },
  stopOnVideoResume: false,
  sprites: [],
  relativeToScreenSize: true
};
