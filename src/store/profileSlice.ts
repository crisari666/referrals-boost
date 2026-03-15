import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { currentSeller } from "@/data/mockData";

interface ProfileState {
  seller: typeof currentSeller;
}

const initialState: ProfileState = {
  seller: currentSeller,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<typeof currentSeller>>) {
      state.seller = { ...state.seller, ...action.payload };
    },
    incrementConversions(state) {
      state.seller.clientsConverted += 1;
    },
    addCommission(state, action: PayloadAction<number>) {
      state.seller.monthCommissions += action.payload;
      state.seller.totalCommissions += action.payload;
    },
  },
});

export const { updateProfile, incrementConversions, addCommission } = profileSlice.actions;
export default profileSlice.reducer;
