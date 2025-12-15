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
  },
});

export const {
  setIsSiderbarOpen,
  setSelectedAgent,
  setSelectedTemplate,
  setSelectedTask,
} = superAgentSlice.actions;
export default superAgentSlice.reducer;
