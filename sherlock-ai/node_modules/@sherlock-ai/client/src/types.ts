export type SignalDirection = "positive" | "negative" | "unknown";

export interface Participant {
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

export interface EvidenceSignal {
  participantId: string;
  signal: string;
  signalLabel?: string;
  confidence: number;
  weight: number;
  direction: SignalDirection;
  reason: string;
}

export interface RankingRow {
  participantId: string;
  displayName: string;
  confidence: number;
  score: number;
}

export interface TranscriptSegment {
  id: string;
  participantId: string;
  speaker: string;
  text: string;
  time: string;
  isAnswer: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  participantId?: string;
  kind: "join" | "speech" | "vision" | "screen" | "prediction";
}

export interface LogEntry {
  id: string;
  level: "info" | "warn" | "debug";
  message: string;
  time: string;
}

export interface PredictionState {
  meetingId: string;
  provider: string;
  candidateId: string;
  confidence: number;
  reason: string;
  participants: Participant[];
  evidence: EvidenceSignal[];
  ranking: RankingRow[];
  transcript: TranscriptSegment[];
  timeline: TimelineEvent[];
  confidenceSeries: number[];
  logs: LogEntry[];
}
