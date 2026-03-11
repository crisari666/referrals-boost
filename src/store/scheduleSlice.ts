import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ScheduledVisit, VisitStatus } from "@/types/schedule";

interface ScheduleState {
  visits: ScheduledVisit[];
}

const mockVisits: ScheduledVisit[] = [
  {
    id: "v1",
    clientId: "c1",
    clientName: "María García López",
    projectId: "p1",
    projectName: "Residencial Las Palmas",
    date: "2026-03-14",
    time: "10:00",
    type: "oficina",
    status: "programada",
    notes: "Llevar planos del lote A-22",
    createdBy: "1",
    createdAt: "2026-03-10",
  },
  {
    id: "v2",
    clientId: "c3",
    clientName: "Ana Martínez Ruiz",
    projectId: "p3",
    projectName: "Jardines del Valle",
    date: "2026-03-12",
    time: "16:00",
    type: "terreno",
    status: "programada",
    createdBy: "1",
    createdAt: "2026-03-08",
  },
  {
    id: "v3",
    clientId: "c2",
    clientName: "Roberto Sánchez",
    projectId: "p2",
    projectName: "Costa Esmeralda",
    date: "2026-03-10",
    time: "11:30",
    type: "virtual",
    status: "completada",
    notes: "Mostró interés en lotes frente a la marina",
    createdBy: "1",
    createdAt: "2026-03-05",
  },
];

const initialState: ScheduleState = {
  visits: mockVisits,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    addVisit(state, action: PayloadAction<ScheduledVisit>) {
      state.visits.push(action.payload);
    },
    updateVisitStatus(state, action: PayloadAction<{ id: string; status: VisitStatus }>) {
      const visit = state.visits.find((v) => v.id === action.payload.id);
      if (visit) visit.status = action.payload.status;
    },
    removeVisit(state, action: PayloadAction<string>) {
      state.visits = state.visits.filter((v) => v.id !== action.payload);
    },
  },
});

export const { addVisit, updateVisitStatus, removeVisit } = scheduleSlice.actions;
export default scheduleSlice.reducer;
