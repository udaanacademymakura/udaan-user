import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import { categoryApi } from '../services/categoryApi';
import { commentApi } from '../services/commentApi';
import { contentApi } from '../services/contentApi';
import { controlsApi } from '../services/controlsApi';
import { countryApi } from '../services/countryApi';
import { courseApi } from '../services/courseApi';
import { dashboardApi } from '../services/dashboardApi';
import { discussionApi } from '../services/discussionApi';
import { ebookApi } from '../services/ebookApi';
import { gorkhapatraApi } from '../services/gorkhapatraApi';
import { liveClassApi } from '../services/liveApi';
import { mediaApi } from '../services/mediaApi';
import { notificationApi } from '../services/notificationApi';
import { omrInstructionApi } from '../services/omrInstructionApi';
import { settingApi } from '../services/settingApi';
import { testApi } from '../services/testApi';
import { ticketApi } from '../services/ticketApi';
import authReducer from "../slice/authSlice";
import purchaseSlice from '../slice/purchaseSlice';
import readingScreenReducer from '../slice/ReadingScreenSlice';
import sessionReducer from "../slice/sessionSlice";
import themeReducer from "../slice/themeSlice";
import toastReducer from "../slice/toastSlice";
export const store = configureStore({
    reducer: {
        udaan_theme: themeReducer,
        auth: authReducer,
        toast: toastReducer,
        readScreen: readingScreenReducer,
        purchase: purchaseSlice,
        session: sessionReducer,
        [authApi.reducerPath]: authApi.reducer,
        [courseApi.reducerPath]: courseApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [testApi.reducerPath]: testApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [liveClassApi.reducerPath]: liveClassApi.reducer,
        [contentApi.reducerPath]: contentApi.reducer,
        [settingApi.reducerPath]: settingApi.reducer,
        [gorkhapatraApi.reducerPath]: gorkhapatraApi.reducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [countryApi.reducerPath]: countryApi.reducer,
        [omrInstructionApi.reducerPath]: omrInstructionApi.reducer,
        [ticketApi.reducerPath]: ticketApi.reducer,
        [discussionApi.reducerPath]: discussionApi.reducer,
        [commentApi.reducerPath]: commentApi.reducer,
        [controlsApi.reducerPath]: controlsApi.reducer,
        [ebookApi.reducerPath]: ebookApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware)
            .concat(courseApi.middleware)
            .concat(categoryApi.middleware)
            .concat(testApi.middleware)
            .concat(mediaApi.middleware)
            .concat(notificationApi.middleware)
            .concat(liveClassApi.middleware)
            .concat(contentApi.middleware)
            .concat(settingApi.middleware)
            .concat(gorkhapatraApi.middleware)
            .concat(dashboardApi.middleware)
            .concat(countryApi.middleware)
            .concat(omrInstructionApi.middleware)
            .concat(ticketApi.middleware)
            .concat(discussionApi.middleware)
            .concat(commentApi.middleware)
            .concat(controlsApi.middleware)
            .concat(ebookApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch