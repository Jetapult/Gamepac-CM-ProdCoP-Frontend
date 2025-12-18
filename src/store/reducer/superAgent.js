import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSiderbarOpen: false,
  selectedAgent: {
    id: "1",
    name: "CommPac",
    slug: "commpac",
  },
  selectedTemplate: {},
  selectedTask: {},
  selectedGame: null,
  studio: null,
  games: [],
};

const superAgentSlice = createSlice({
  name: "superAgent",
  initialState,
  reducers: {
    setIsSiderbarOpen: (state, action) => {
      state.isSiderbarOpen = action.payload;
    },
    setSelectedAgent: (state, action) => {
      state.selectedAgent = action.payload;
    },
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setSelectedGame: (state, action) => {
      state.selectedGame = action.payload;
    },
    setStudio: (state, action) => {
      state.studio = action.payload;
    },
    setGames: (state, action) => {
      state.games = action.payload;
    },
  },
});

export const {
  setIsSiderbarOpen,
  setSelectedAgent,
  setSelectedTemplate,
  setSelectedTask,
  setSelectedGame,
  setStudio,
  setGames,
} = superAgentSlice.actions;
export default superAgentSlice.reducer;
