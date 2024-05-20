import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducer/userSlice";
import adminReducer from "./reducer/adminSlice";
import onboardReducer from "./reducer/onboardingSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    admin: adminReducer,
    onboard: onboardReducer
  },
});
