import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import whatsappReducer from "./whatsappSlice";
import authReducer from "./authSlice";
import scheduleReducer from "./scheduleSlice";
import clientsReducer from "./clientsSlice";
import projectsReducer from "./projectsSlice";
import profileReducer from "./profileSlice";
import vendorDashboardReducer from "./vendorDashboardSlice";

export const store = configureStore({
  reducer: {
    whatsapp: whatsappReducer,
    auth: authReducer,
    schedule: scheduleReducer,
    clients: clientsReducer,
    projects: projectsReducer,
    profile: profileReducer,
    vendorDashboard: vendorDashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
