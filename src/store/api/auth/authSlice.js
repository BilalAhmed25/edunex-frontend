import { createSlice } from "@reduxjs/toolkit";

// Safe helper to get initial user
const getInitialUser = () => {
    try {
        const item = localStorage.getItem("user");
        // Only parse if item exists and isn't the string "undefined"
        return item && item !== "undefined" ? JSON.parse(item) : null;
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        return null;
    }
};

const initialUser = getInitialUser();

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: initialUser,
        isAuth: !!initialUser,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuth = true;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        logOut: (state) => {
            state.user = null;
            state.isAuth = false;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
    },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;