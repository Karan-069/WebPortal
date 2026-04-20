import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice.js";
import uiReducer from "./features/uiSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore functional actions in pageContext
        ignoredPaths: ["ui.pageContext.actions"],
        ignoredActionPaths: ["payload.actions"],
      },
    }),
});
