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
  },
});

export const { addUserData } = userSlice.actions;
export default userSlice.reducer;
