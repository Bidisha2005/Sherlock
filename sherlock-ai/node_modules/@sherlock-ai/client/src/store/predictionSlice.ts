import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockMeeting } from "../data/mockMeeting";
import { PredictionState } from "../types";

const predictionSlice = createSlice({
  name: "prediction",
  initialState: mockMeeting,
  reducers: {
    setPrediction: (_state, action: PayloadAction<PredictionState>) => action.payload,
    tickConfidence: (state) => {
      const last = state.confidenceSeries[state.confidenceSeries.length - 1] ?? state.confidence;
      const next = Math.min(0.94, last + (Math.random() - 0.35) * 0.025);
      state.confidence = Number(next.toFixed(2));
      state.confidenceSeries.push(state.confidence);
      if (state.confidenceSeries.length > 12) state.confidenceSeries.shift();
      state.ranking[0].confidence = state.confidence;
    }
  }
});

export const { setPrediction, tickConfidence } = predictionSlice.actions;
export const predictionReducer = predictionSlice.reducer;
