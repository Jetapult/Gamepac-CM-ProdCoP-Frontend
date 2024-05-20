import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStudio: {},
  totalStudio: 0,
  studios: []
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    addStudioData: (state, action) => {
      state.selectedStudio = action.payload;
    },
    addTotalStudio: (state, action) => {
      state.totalStudio = action.payload;
    },
    addStudios: (state, action) => {
      state.studios = action.payload;
    }
  },
});

export const { addStudioData, addTotalStudio, addStudios } = adminSlice.actions;
export default adminSlice.reducer;
