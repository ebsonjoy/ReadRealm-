import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userData : localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        setCredentials : (state,action)=>{
            state.userData = action.payload;
            localStorage.setItem('userData', JSON.stringify(action.payload))
        },
        logout : (state) =>{
            state.userData = null;
            localStorage.removeItem('userData')
        },
    },
});

export const {setCredentials,logout} = authSlice.actions
export default authSlice.reducer