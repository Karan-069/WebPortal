import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false, // Whether sidebar is currently expanded (visual state)
  sidebarPinned: false, // Whether sidebar is locked open by the user
  pageContext: { title: "Dashboard", actions: [] },
  isPageLoading: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    pinSidebar: (state) => {
      state.sidebarPinned = !state.sidebarPinned;
      // When pinning, ensure sidebar is open; when unpinning, it stays open until mouse leaves
      if (state.sidebarPinned) {
        state.sidebarOpen = true;
      }
    },
    setPageContext: (state, action) => {
      state.pageContext = action.payload;
    },
    setLoading: (state, action) => {
      state.isPageLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  pinSidebar,
  setPageContext,
  setLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
