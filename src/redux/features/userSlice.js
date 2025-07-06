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
      state.email = action.payload.email;
    
      localStorage.setItem('user', JSON.stringify({
        isLoggedIn: true,
        id: action.payload.id,
        email: action.payload.email,
        
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
