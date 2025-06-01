import { createSlice } from "@reduxjs/toolkit";

// redux lưu thông tin user

// default value
const initialState = (() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    return JSON.parse(savedUser);
  }
  return {
    isLoggedIn: false,
    id: null,
    username: null,
  };
})();

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.id = action.payload.id;
      state.username = action.payload.username;
    
      localStorage.setItem('user', JSON.stringify({
        isLoggedIn: true,
        id: action.payload.id,
        username: action.payload.username,
      }));
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.id = null;
      state.username = null;
      
      localStorage.removeItem('user');
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
