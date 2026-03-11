import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AssistantMessage } from "@/types/assistant";
import * as assistantService from "@/services/assistantService";

interface AssistantState {
  messages: AssistantMessage[];
  isTyping: boolean;
}

const initialState: AssistantState = {
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! 👋 Soy tu **asistente virtual de LoteLink**. Estoy entrenado con toda la información de nuestros proyectos inmobiliarios.\n\nPuedo ayudarte con:\n• Detalles y precios de proyectos\n• Opciones de financiamiento\n• Tips de ventas\n• Documentos y contratos\n\n¿En qué puedo ayudarte hoy?",
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,
};

/** EVENT: SEND_PROMPT — Send user message and get AI response */
export const sendPrompt = createAsyncThunk(
  "assistant/sendPrompt",
  async (input: string) => {
    const response = await assistantService.sendPrompt(input);
    return response;
  }
);

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    /** EVENT: CLEAR_CHAT — Reset conversation */
    clearChat(state) {
      state.messages = [initialState.messages[0]];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendPrompt.pending, (state, action) => {
      // Add user message immediately
      state.messages.push({
        id: `user-${Date.now()}`,
        role: "user",
        content: action.meta.arg,
        timestamp: new Date().toISOString(),
      });
      state.isTyping = true;
    });
    builder.addCase(sendPrompt.fulfilled, (state, action) => {
      state.messages.push(action.payload);
      state.isTyping = false;
    });
    builder.addCase(sendPrompt.rejected, (state) => {
      state.messages.push({
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Lo siento, ocurrió un error. Por favor intenta de nuevo.",
        timestamp: new Date().toISOString(),
      });
      state.isTyping = false;
    });
  },
});

export const { clearChat } = assistantSlice.actions;
export default assistantSlice.reducer;
