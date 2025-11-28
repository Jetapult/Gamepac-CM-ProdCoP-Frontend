import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducer/userSlice";
import adminReducer from "./reducer/adminSlice";
import knowledgebaseReducer from "./reducer/knowledgebaseSlice";
import superAgentReducer from "./reducer/superAgent";

export const store = configureStore({
  reducer: {
    user: userReducer,
    admin: adminReducer,
    knowledgebase: knowledgebaseReducer,
    superAgent: superAgentReducer
  },
});
