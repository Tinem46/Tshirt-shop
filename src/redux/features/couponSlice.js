// redux/features/couponSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  savedCoupons: [],
  selectedCoupon: null,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    setSavedCoupons(state, action) {
      state.savedCoupons = action.payload;
    },
    addSavedCoupon(state, action) {
      if (!state.savedCoupons.find(c => c.id === action.payload.id)) {
        state.savedCoupons.push(action.payload);
      }
    },
    removeSavedCoupon(state, action) {
      state.savedCoupons = state.savedCoupons.filter(
        (c) => c.id !== action.payload
      );
      if (state.selectedCoupon && state.selectedCoupon.id === action.payload) {
        state.selectedCoupon = null;
      }
    },
    selectCoupon(state, action) {
      state.selectedCoupon = action.payload;
    },
    clearCoupons(state) {
      state.savedCoupons = [];
      state.selectedCoupon = null;
    },
  },
});

export const {
  setSavedCoupons,
  addSavedCoupon,
  removeSavedCoupon,
  selectCoupon,
  clearCoupons,
} = couponSlice.actions;

export default couponSlice.reducer;
