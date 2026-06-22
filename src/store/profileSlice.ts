import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SellerProfile = {
  id: string;
  name: string;
  level: 'Plata' | 'Oro';
  levelProgress: number;
  totalCommissions: number;
  monthCommissions: number;
  monthGoal: number;
  clientsTracking: number;
  clientsConverted: number;
  referralLink: string;
  achievements: {
    id: string;
    title: string;
    icon: string;
    unlocked: boolean;
  }[];
  ranking: number;
};

interface ProfileState {
  seller: SellerProfile;
}

const initialSeller: SellerProfile = {
  id: '',
  name: '',
  level: 'Plata',
  levelProgress: 0,
  totalCommissions: 0,
  monthCommissions: 0,
  monthGoal: 0,
  clientsTracking: 0,
  clientsConverted: 0,
  referralLink: '',
  achievements: [],
  ranking: 0,
};

const initialState: ProfileState = {
  seller: initialSeller,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<SellerProfile>>) {
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
