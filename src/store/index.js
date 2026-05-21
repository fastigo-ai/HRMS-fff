import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authStore';
import uiReducer from './uiStore';
import employeeReducer from './employeeStore';
import hrReducer from './hrStore';
import managerReducer from './managerStore';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    employee: employeeReducer,
    hr: hrReducer,
    manager: managerReducer,
  },
});
