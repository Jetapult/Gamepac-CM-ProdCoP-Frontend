import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducer/userSlice";
import adminReducer from "./reducer/adminSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    admin: adminReducer
  },
});
