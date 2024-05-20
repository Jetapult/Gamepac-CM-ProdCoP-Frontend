import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  NavbarRun: false,
};

const onboardingSlice = createSlice({
  name: "onboard",
  initialState,
  reducers: {
    onboardingProcess: (state, action) => {
      state.NavbarRun = action.payload;
    },
  },
});

export const { onboardingProcess } = onboardingSlice.actions;
export default onboardingSlice.reducer;
