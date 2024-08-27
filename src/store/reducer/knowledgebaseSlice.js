import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  knowledgebase: [],
};

const knowledgebaseSlice = createSlice({
  name: "knowledgebase",
  initialState,
  reducers: {
    addKnowledgebase: (state, action) => {
      state.knowledgebase = action.payload;
    },
  },
});

export const { addKnowledgebase } = knowledgebaseSlice.actions;
export default knowledgebaseSlice.reducer;
