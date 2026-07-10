import { Server } from "socket.io";
import { FeatureSignal, MeetingSnapshot, PredictionResult } from "../domain/types";
import { PredictionService } from "../services/PredictionService";
import { logger } from "../utils/logger";

interface DashboardParticipant {
  id: string;
  displayName: string;
  email?: string;
  roleHint: "candidate" | "interviewer" | "observer";
  joinedAt: string;
  webcamEnabled: boolean;
  screenSharing: boolean;
  isSpeaking: boolean;
  avatarUrl: string;
}

interface DashboardPayload {
  meetingId: string;
  provider: string;
  candidateId: string;
  confidence: number;
  reason: string;
  participants: DashboardParticipant[];
  evidence: Array<FeatureSignal & { signalLabel: string }>;
  ranking: Array<{ participantId: string; displayName: string; confidence: number; score: number }>;
  transcript: Array<{ id: string; participantId: string; speaker: string; text: string; time: string; isAnswer: boolean }>;
  timeline: Array<{ id: string; time: string; label: string; participantId?: string; kind: string }>;
  confidenceSeries: number[];
  logs: Array<{ id: string; level: "info" | "warn" | "debug"; message: string; time: string }>;
}

const avatars = {
  candidate: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
  rohan: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  nina: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  observer: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80"
};

const script = [
  { participantId: "p-rohan", speaker: "Rohan Mehta", text: "Could you introduce yourself and walk us through your strongest project?", isAnswer: false },
  { participantId: "p-candidate", speaker: "MacBook Pro", text: "My name is Aisha Khan. I built a real-time AI interview analysis system using React, Flask, OpenCV, Whisper, and evaluation metrics.", isAnswer: true },
  { participantId: "p-nina", speaker: "N. Patel", text: "How did you avoid depending on just one identity rule?", isAnswer: false },
  { participantId: "p-candidate", speaker: "MacBook Pro", text: "I combined weak signals like candidate email, transcript self introduction, speaking turns, face visibility, resume overlap, and screen share into a weighted confidence score.", isAnswer: true },
  { participantId: "p-observer", speaker: "Silent Observer", text: "Can the system handle someone joining with a device name instead of their real name?", isAnswer: false },
  { participantId: "p-candidate", speaker: "MacBook Pro", text: "Yes. The display name is weak here, but the email, self introduction, resume keywords, and answer-heavy conversation role still point to me as the candidate.", isAnswer: true }
];

const confidenceSeries: number[] = [];
const logs: DashboardPayload["logs"] = [];
const timeline: DashboardPayload["timeline"] = [
  { id: "e-join-rohan", time: "09:58", label: "Rohan joined before scheduled start", participantId: "p-rohan", kind: "join" },
  { id: "e-join-candidate", time: "10:01", label: "MacBook Pro joined from candidate email", participantId: "p-candidate", kind: "join" }
];

let tick = 0;
let timer: NodeJS.Timeout | undefined;

export const startLiveMeetingSimulator = (io: Server, predictionService: PredictionService): void => {
  if (timer) return;

  const emitSnapshot = async () => {
    const snapshot = buildSnapshot(tick);
    const { prediction, signals } = await predictionService.predict(snapshot);
    const payload = toDashboardPayload(snapshot, prediction, signals);
    io.emit("dashboard.updated", payload);
    io.to(snapshot.meetingId).emit("prediction.updated", { prediction, signals });
    tick += 1;
  };

  emitSnapshot().catch((error) => logger.error("Mock simulator failed", { message: error.message }));
  timer = setInterval(() => emitSnapshot().catch((error) => logger.error("Mock simulator failed", { message: error.message })), 3000);
  logger.info("Live mock meeting simulator started");
};

const buildSnapshot = (index: number): MeetingSnapshot => {
  const now = new Date();
  const activeScript = script.slice(0, Math.min(script.length, index + 1));
  const speakingParticipant = script[index % script.length].participantId;
  const candidateSpeechCount = activeScript.filter((item) => item.participantId === "p-candidate").length;
  const screenSharing = index >= 3;

  return {
    meetingId: "sherlock-challenge-live",
    provider: "mock",
    capturedAtIso: now.toISOString(),
    candidateProfile: {
      id: "candidate-aisha",
      fullName: "Aisha Khan",
      email: "aisha.khan@candidate.dev",
      resumeText: "React TypeScript Flask Python OpenCV Whisper MediaPipe evaluation precision recall F1 score real time AI dashboard",
      expectedMeetingId: "sherlock-challenge-live",
      calendarGuestEmails: ["aisha.khan@candidate.dev", "rohan@sherlock.sh", "nina@sherlock.sh"],
      scheduledStartIso: new Date(now.getTime() - 10 * 60_000).toISOString()
    },
    participants: [
      participant("p-candidate", "MacBook Pro", "aisha.khan@candidate.dev", "10:01 AM", true, screenSharing, speakingParticipant === "p-candidate"),
      participant("p-rohan", "Rohan Mehta", "rohan@sherlock.sh", "09:58 AM", true, false, speakingParticipant === "p-rohan"),
      participant("p-nina", "N. Patel", "nina@sherlock.sh", "09:59 AM", index % 4 !== 0, false, speakingParticipant === "p-nina"),
      participant("p-observer", "Silent Observer", undefined, "10:03 AM", true, false, speakingParticipant === "p-observer")
    ],
    transcript: activeScript.map((item, transcriptIndex) => ({
      id: `t-${transcriptIndex}`,
      participantId: item.participantId,
      startedAtMs: transcriptIndex * 18_000,
      endedAtMs: transcriptIndex * 18_000 + 10_000,
      text: item.text,
      confidence: 0.91
    })),
    telemetry: [
      telemetry("p-candidate", 14_000 + candidateSpeechCount * 22_000, candidateSpeechCount + 1, 0.72 + Math.min(0.18, index * 0.02), 0.68 + Math.min(0.2, index * 0.025), 0, candidateSpeechCount, 0, 3),
      telemetry("p-rohan", 22_000 + index * 1500, 3, 0.62, 0.58, 3, 0, 0, 1),
      telemetry("p-nina", 12_000 + index * 800, 2, index % 4 === 0 ? 0.08 : 0.34, 0.25, 2, 0, 0, 1),
      telemetry("p-observer", 8_000 + index * 650, 1, 0.31, 0.3, 1, 0, 0, 0)
    ]
  };
};

const participant = (
  id: string,
  displayName: string,
  email: string | undefined,
  joinedAt: string,
  webcamEnabled: boolean,
  screenSharing: boolean,
  isSpeaking: boolean
) => ({
  id,
  displayName,
  email,
  joinedAtIso: new Date(`2026-07-09T${joinedAt.replace(" AM", ":00+05:30").replace(" PM", ":00+05:30")}`).toISOString(),
  webcamEnabled,
  screenSharing,
  isSpeaking
});

const telemetry = (
  participantId: string,
  speakingMs: number,
  speakerTurns: number,
  cameraVisibleRatio: number,
  faceDetectedRatio: number,
  questionCount: number,
  answerCount: number,
  interruptions: number,
  directMentions: number
) => ({
  participantId,
  speakingMs,
  speakerTurns,
  cameraVisibleRatio,
  faceDetectedRatio,
  questionCount,
  answerCount,
  interruptions,
  directMentions
});

const toDashboardPayload = (snapshot: MeetingSnapshot, prediction: PredictionResult, signals: FeatureSignal[]): DashboardPayload => {
  const candidateId = prediction.candidate?.id ?? "";
  confidenceSeries.push(prediction.confidence);
  if (confidenceSeries.length > 14) confidenceSeries.shift();

  const transcript = snapshot.transcript.map((segment) => {
    const participant = snapshot.participants.find((item) => item.id === segment.participantId);
    const scriptItem = script.find((item) => item.text === segment.text);
    return {
      id: segment.id,
      participantId: segment.participantId,
      speaker: participant?.displayName ?? segment.participantId,
      text: segment.text,
      time: new Date(snapshot.capturedAtIso).toLocaleTimeString("en-IN", { hour12: false }),
      isAnswer: scriptItem?.isAnswer ?? false
    };
  });

  const latestLine = transcript[transcript.length - 1];
  if (latestLine && !timeline.some((event) => event.id === `speech-${latestLine.id}`)) {
    timeline.push({ id: `speech-${latestLine.id}`, time: latestLine.time, label: `${latestLine.speaker} spoke`, participantId: latestLine.participantId, kind: "speech" });
  }
  if (tick === 3) timeline.push({ id: "screen-share", time: latestLine?.time ?? "10:07", label: "MacBook Pro started screen share during coding discussion", participantId: "p-candidate", kind: "screen" });

  logs.unshift({
    id: `log-${tick}`,
    level: prediction.confidence > 0.8 ? "info" : "debug",
    time: new Date(snapshot.capturedAtIso).toLocaleTimeString("en-IN", { hour12: false }),
    message: `Realtime confidence engine selected ${prediction.candidate?.displayName ?? "unknown"} at ${Math.round(prediction.confidence * 100)}%.`
  });
  if (logs.length > 8) logs.pop();

  return {
    meetingId: snapshot.meetingId,
    provider: "Sherlock challenge simulation",
    candidateId,
    confidence: prediction.confidence,
    reason: prediction.reason,
    participants: snapshot.participants.map((item) => ({
      id: item.id,
      displayName: item.displayName,
      email: item.email,
      roleHint: item.id === "p-candidate" ? "candidate" : item.id === "p-observer" ? "observer" : "interviewer",
      joinedAt: item.id === "p-candidate" ? "10:01 AM" : item.id === "p-rohan" ? "09:58 AM" : item.id === "p-nina" ? "09:59 AM" : "10:03 AM",
      webcamEnabled: item.webcamEnabled,
      screenSharing: item.screenSharing,
      isSpeaking: item.isSpeaking,
      avatarUrl: item.id === "p-candidate" ? avatars.candidate : item.id === "p-rohan" ? avatars.rohan : item.id === "p-nina" ? avatars.nina : avatars.observer
    })),
    evidence: signals.map((signal) => ({ ...signal, signalLabel: titleCase(signal.signal) })),
    ranking: prediction.ranking.map((row) => ({
      participantId: row.participantId,
      displayName: row.displayName,
      confidence: row.confidence,
      score: row.score
    })),
    transcript,
    timeline: timeline.slice(-10),
    confidenceSeries: [...confidenceSeries],
    logs: [...logs]
  };
};

const titleCase = (value: string): string =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
