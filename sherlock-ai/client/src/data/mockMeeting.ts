import { PredictionState } from "../types";

export const mockMeeting: PredictionState = {
  meetingId: "sherlock-challenge-live",
  provider: "Sherlock challenge simulation",
  candidateId: "p-candidate",
  confidence: 0.86,
  reason:
    "Selected MacBook Pro as the candidate even though the display name is incorrect. The system combines candidate email, self-introduction as Aisha Khan, resume keyword overlap, answer-heavy speaking behavior, face visibility, and screen-share context.",
  participants: [
    {
      id: "p-candidate",
      displayName: "MacBook Pro",
      email: "aisha.khan@candidate.dev",
      roleHint: "candidate",
      joinedAt: "10:01 AM",
      webcamEnabled: true,
      screenSharing: true,
      isSpeaking: true,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "p-rohan",
      displayName: "Rohan Mehta",
      email: "rohan@sherlock.sh",
      roleHint: "interviewer",
      joinedAt: "09:58 AM",
      webcamEnabled: true,
      screenSharing: false,
      isSpeaking: false,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "p-nina",
      displayName: "N. Patel",
      email: "nina@sherlock.sh",
      roleHint: "interviewer",
      joinedAt: "09:59 AM",
      webcamEnabled: false,
      screenSharing: false,
      isSpeaking: false,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "p-observer",
      displayName: "Silent Observer",
      roleHint: "observer",
      joinedAt: "10:03 AM",
      webcamEnabled: true,
      screenSharing: false,
      isSpeaking: false,
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80"
    }
  ],
  evidence: [
    {
      participantId: "p-candidate",
      signal: "Candidate email",
      confidence: 1,
      weight: 0.14,
      direction: "positive",
      reason: "MacBook Pro joined with the candidate email aisha.khan@candidate.dev."
    },
    {
      participantId: "p-candidate",
      signal: "Self introduction",
      confidence: 0.92,
      weight: 0.12,
      direction: "positive",
      reason: "Transcript says: My name is Aisha Khan."
    },
    {
      participantId: "p-candidate",
      signal: "Display name similarity",
      confidence: 0.05,
      weight: 0.13,
      direction: "negative",
      reason: "Display name MacBook Pro does not match candidate metadata; this is treated as weak/negative evidence, not a hard failure."
    },
    {
      participantId: "p-candidate",
      signal: "Resume matching",
      confidence: 0.81,
      weight: 0.1,
      direction: "positive",
      reason: "Transcript overlaps with resume terms: React, Flask, OpenCV, Whisper, evaluation metrics."
    },
    {
      participantId: "p-rohan",
      signal: "Question role",
      confidence: 0.85,
      weight: 0.04,
      direction: "negative",
      reason: "Rohan mostly asks questions, which matches interviewer behavior."
    },
    {
      participantId: "p-observer",
      signal: "Candidate email",
      confidence: 0,
      weight: 0.14,
      direction: "unknown",
      reason: "Silent Observer has no email metadata."
    }
  ],
  ranking: [
    { participantId: "p-candidate", displayName: "MacBook Pro", confidence: 0.86, score: 0.69 },
    { participantId: "p-observer", displayName: "Silent Observer", confidence: 0.49, score: -0.02 },
    { participantId: "p-rohan", displayName: "Rohan Mehta", confidence: 0.34, score: -0.2 },
    { participantId: "p-nina", displayName: "N. Patel", confidence: 0.29, score: -0.3 }
  ],
  transcript: [
    {
      id: "t1",
      participantId: "p-rohan",
      speaker: "Rohan Mehta",
      time: "10:05:12",
      text: "Could you introduce yourself and walk us through your strongest project?",
      isAnswer: false
    },
    {
      id: "t2",
      participantId: "p-candidate",
      speaker: "MacBook Pro",
      time: "10:05:24",
      text: "My name is Aisha Khan. I built a real-time AI interview analysis system using React, Flask, OpenCV, and Whisper.",
      isAnswer: true
    },
    {
      id: "t3",
      participantId: "p-nina",
      speaker: "N. Patel",
      time: "10:06:18",
      text: "How did you avoid relying on only one signal?",
      isAnswer: false
    },
    {
      id: "t4",
      participantId: "p-candidate",
      speaker: "MacBook Pro",
      time: "10:06:31",
      text: "I used a weighted evidence aggregator so incorrect names do not break the prediction.",
      isAnswer: true
    }
  ],
  timeline: [
    { id: "e1", time: "09:58", label: "Rohan joined before scheduled start", participantId: "p-rohan", kind: "join" },
    { id: "e2", time: "10:01", label: "MacBook Pro joined from candidate email", participantId: "p-candidate", kind: "join" },
    { id: "e3", time: "10:05", label: "Self introduction detected: Aisha Khan", participantId: "p-candidate", kind: "speech" },
    { id: "e4", time: "10:06", label: "Display-name mismatch recorded as negative evidence", participantId: "p-candidate", kind: "prediction" },
    { id: "e5", time: "10:07", label: "Confidence crossed 80% after transcript and email evidence", participantId: "p-candidate", kind: "prediction" },
    { id: "e6", time: "10:08", label: "Screen share started during technical answer", participantId: "p-candidate", kind: "screen" }
  ],
  confidenceSeries: [0.31, 0.44, 0.57, 0.68, 0.75, 0.82, 0.86],
  logs: [
    { id: "l1", level: "info", time: "10:05:24", message: "Self-introduction extractor linked MacBook Pro to candidate profile Aisha Khan." },
    { id: "l2", level: "debug", time: "10:06:02", message: "Display name mismatch lowered score but did not override stronger evidence." },
    { id: "l3", level: "warn", time: "10:06:44", message: "Silent Observer has missing email metadata; candidate signal remains unknown." },
    { id: "l4", level: "info", time: "10:07:05", message: "Confidence engine selected MacBook Pro with 86% confidence." }
  ]
};
