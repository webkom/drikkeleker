import { type Slice, createSlice } from '@reduxjs/toolkit';


export interface testSliceData {
  a: number;
  b: number;
}

// create a slice to store the state of the app
export const testSlice: Slice = createSlice({
  name: 'testSlice',
  initialState: {
    // state goes here
    a: 1,
    b: 2,
  },
  reducers: {
    // reducers go here
    updateTestSlice: (testSlice, action) => {
      testSlice = action.payload;
    },
    updateTestA: (testSlice, action) => {
      testSlice.a = action.payload;
    },
    updateTestB: (testSlice, action) => {
      testSlice.b = action.payload;
    },
  },
});

export const { reducer: testReducer } = testSlice;
export const { actions: testActions } = testSlice;

// This name needs to match the name of the slice in the store.ts file
export const selectTest = (state: any): testSliceData => state.testState;
