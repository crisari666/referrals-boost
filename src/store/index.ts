import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import whatsappReducer from "./whatsappSlice";
import authReducer from "./authSlice";
import scheduleReducer from "@/features/schedule/store/scheduleSlice";
import scheduleAssigneesReducer from "@/features/schedule/store/schedule-assignees-slice";
import clientsReducer from "./clientsSlice";
import downPaymentsReducer from "@/features/Clients/store/down-payments-slice";
import projectsReducer from "./projectsSlice";
import profileReducer from "./profileSlice";
import vendorDashboardReducer from "./vendorDashboardSlice";
import crmPresenceReducer from "./crmPresenceSlice";
import twilioVoiceReducer from "./twilioVoiceSlice";
import signupCampaignReducer from "./signupCampaignSlice";
import trainingSessionsReducer from "@/features/training-sessions/store/training-sessions-slice";
import lotStockReducer from "@/features/lot-stock/store/lot-stock-slice";

export const store = configureStore({
  reducer: {
    whatsapp: whatsappReducer,
    auth: authReducer,
    schedule: scheduleReducer,
    scheduleAssignees: scheduleAssigneesReducer,
    clients: clientsReducer,
    downPayments: downPaymentsReducer,
    projects: projectsReducer,
    profile: profileReducer,
    vendorDashboard: vendorDashboardReducer,
    crmPresence: crmPresenceReducer,
    twilioVoice: twilioVoiceReducer,
    signupCampaign: signupCampaignReducer,
    trainingSessions: trainingSessionsReducer,
    lotStock: lotStockReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
