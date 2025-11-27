import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSiderbarOpen: false,
};

const superAgentSlice = createSlice({
  name: "superAgent",
  initialState,
  reducers: {
    setIsSiderbarOpen: (state, action) => {
      state.isSiderbarOpen = action.payload;
    },
  },
});

export const { setIsSiderbarOpen } = superAgentSlice.actions;
export default superAgentSlice.reducer;
