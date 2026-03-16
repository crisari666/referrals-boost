import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clients as initialClients, type Client, type ClientStatus } from "@/data/mockData";

interface ClientsState {
  list: Client[];
  search: string;
}

const initialState: ClientsState = {
  list: initialClients,
  search: "",
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    addClient(state, action: PayloadAction<Client>) {
      state.list.unshift(action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeClient(state, action: PayloadAction<string>) {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    updateClientStatus(state, action: PayloadAction<{ id: string; status: ClientStatus }>) {
      const client = state.list.find((c) => c.id === action.payload.id);
      if (client) client.status = action.payload.status;
    },
    addClientNote(state, action: PayloadAction<{ id: string; note: string }>) {
      const client = state.list.find((c) => c.id === action.payload.id);
      if (client) client.notes.push(action.payload.note);
    },
    addClientInteraction(state, action: PayloadAction<{ id: string; interaction: Client["interactions"][0] }>) {
      const client = state.list.find((c) => c.id === action.payload.id);
      if (client) client.interactions.push(action.payload.interaction);
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setClientList(state, action: PayloadAction<Client[]>) {
      state.list = action.payload;
    },
  },
});

export const { addClient, updateClient, removeClient, updateClientStatus, addClientNote, addClientInteraction, setSearch, setClientList } = clientsSlice.actions;
export default clientsSlice.reducer;
