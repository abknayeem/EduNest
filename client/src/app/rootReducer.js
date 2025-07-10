import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { adminApi } from "@/features/api/adminApi";
import { instructorApi } from "@/features/api/instructorApi";
import { categoryApi } from "@/features/api/categoryApi";
import { quizApi } from "@/features/api/quizApi";
import instructorApplicationReducer from "../features/instructorApplicationSlice";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [courseProgressApi.reducerPath]:courseProgressApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [instructorApi.reducerPath]: instructorApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    auth:authReducer,
    instructorApplication: instructorApplicationReducer,
});

export default rootReducer;