import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { adminApi } from "@/features/api/adminApi";
import { instructorApi } from "@/features/api/instructorApi";
import { categoryApi } from "@/features/api/categoryApi";
import { quizApi } from "@/features/api/quizApi";
import { payoutApi } from "@/features/api/payoutApi";
import { qnaApi } from "@/features/api/qnaApi";
import { setupListeners } from "@reduxjs/toolkit/query";

export const appStore = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>  
        getDefaultMiddleware().concat(
            authApi.middleware, 
            courseApi.middleware, 
            purchaseApi.middleware,
            courseProgressApi.middleware,
            adminApi.middleware,
            instructorApi.middleware,
            categoryApi.middleware,
            quizApi.middleware,
            payoutApi.middleware,
            qnaApi.middleware
        )
});

const initializeApp = async () => {
    await appStore.dispatch(authApi.endpoints.loadUser.initiate({}, { forceRefetch: true }));
};

initializeApp();
setupListeners(appStore.dispatch);