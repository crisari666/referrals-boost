import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type CrmPresenceState = {
  onlineUserIds: Record<string, true>
}

type StateWithCrmPresence = { crmPresence: CrmPresenceState }

const initialState: CrmPresenceState = {
  onlineUserIds: {},
}

const crmPresenceSlice = createSlice({
  name: 'crmPresence',
  initialState,
  reducers: {
    crmUserConnected(state, action: PayloadAction<string>) {
      state.onlineUserIds[action.payload] = true
    },
    crmUserDisconnected(state, action: PayloadAction<string>) {
      delete state.onlineUserIds[action.payload]
    },
    clearCrmPresence(state) {
      state.onlineUserIds = {}
    },
  },
})

export const { crmUserConnected, crmUserDisconnected, clearCrmPresence } =
  crmPresenceSlice.actions

export const selectCrmOnlineUserIds = (state: StateWithCrmPresence) =>
  state.crmPresence.onlineUserIds

export const selectIsCrmUserOnline =
  (userId: string) => (state: StateWithCrmPresence) =>
    Boolean(state.crmPresence.onlineUserIds[userId])

export default crmPresenceSlice.reducer
