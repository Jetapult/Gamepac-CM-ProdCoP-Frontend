import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUserData: (state, action) => {
      state.user = action.payload;
    },
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { addUserData, updateUserData } = userSlice.actions;
export default userSlice.reducer;
