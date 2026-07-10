import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../store/hooks";
import { setPrediction } from "../store/predictionSlice";
import { PredictionState } from "../types";

const socketUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";

export const useRealtimeDashboard = () => {
  const dispatch = useAppDispatch();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("meeting.join", { meetingId: "sherlock-challenge-live" });
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("dashboard.updated", (payload: PredictionState) => dispatch(setPrediction(payload)));

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return { connected, socketUrl };
};
