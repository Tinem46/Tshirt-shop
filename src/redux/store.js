import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import couponReducer from "./features/couponSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    coupon: couponReducer,
  },
});

export const getRootState = () => store.getState();
