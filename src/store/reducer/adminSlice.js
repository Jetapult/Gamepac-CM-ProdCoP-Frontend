import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStudio: {},
  totalStudio: 0,
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
  },
});

export const { addStudioData, addTotalStudio } = adminSlice.actions;
export default adminSlice.reducer;
