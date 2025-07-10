import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDialogOpen: false,
};

const instructorApplicationSlice = createSlice({
  name: "instructorApplication",
  initialState,
  reducers: {
    openDialog: (state) => {
      state.isDialogOpen = true;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
    },
  },
});

export const { openDialog, closeDialog } = instructorApplicationSlice.actions;
export default instructorApplicationSlice.reducer;