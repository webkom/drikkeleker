import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { testReducer } from './slices/testSlice.ts';

// Create a simple redux store
const store = configureStore({
  reducer: combineReducers({ //Note: For the reducer, the key is the name of the slice in the store.ts file
    testState: testReducer,
    // exampleState: exampleReducer,
  }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

export default store;
