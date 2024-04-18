import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStudio: {},
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    addStudioData: (state, action) => {
      state.selectedStudio = action.payload;
    },
  },
});

export const { addStudioData } = adminSlice.actions;
export default adminSlice.reducer;
