import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import whatsappReducer from "./whatsappSlice";
import assistantReducer from "./assistantSlice";

export const store = configureStore({
  reducer: {
    whatsapp: whatsappReducer,
    assistant: assistantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
