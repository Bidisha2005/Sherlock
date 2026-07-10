export type MeetingProvider = "google_meet" | "microsoft_teams" | "zoom" | "mock";
export type SignalDirection = "positive" | "negative" | "unknown";
export type EvidenceSignal =
  | "display_name_similarity"
  | "calendar_metadata"
  | "candidate_email"
  | "speaking_duration"
  | "speaker_turns"
  | "webcam_state"
  | "face_detection"
  | "face_visibility"
  | "transcript_analysis"
  | "self_introduction"
  | "resume_matching"
  | "screen_share"
  | "join_order"
  | "participant_events"
  | "conversation_graph"
  | "question_answer_role";

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  resumeText: string;
  expectedMeetingId: string;
  calendarGuestEmails: string[];
  scheduledStartIso: string;
}

export interface Participant {
  id: string;
  displayName: string;
  email?: string;
  joinedAtIso: string;
  leftAtIso?: string;
  webcamEnabled: boolean;
  screenSharing: boolean;
  isSpeaking: boolean;
}

export interface TranscriptSegment {
  id: string;
  participantId: string;
  startedAtMs: number;
  endedAtMs: number;
  text: string;
  confidence: number;
}

export interface ParticipantTelemetry {
  participantId: string;
  speakingMs: number;
  speakerTurns: number;
  cameraVisibleRatio: number;
  faceDetectedRatio: number;
  questionCount: number;
  answerCount: number;
  interruptions: number;
  directMentions: number;
}

export interface MeetingSnapshot {
  meetingId: string;
  provider: MeetingProvider;
  capturedAtIso: string;
  candidateProfile: CandidateProfile;
  participants: Participant[];
  transcript: TranscriptSegment[];
  telemetry: ParticipantTelemetry[];
}

export interface FeatureSignal {
  participantId: string;
  signal: EvidenceSignal;
  confidence: number;
  weight: number;
  direction: SignalDirection;
  reason: string;
  observedAtIso: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ParticipantRanking {
  participantId: string;
  displayName: string;
  score: number;
  confidence: number;
  positiveSignals: FeatureSignal[];
  negativeSignals: FeatureSignal[];
  unknownSignals: FeatureSignal[];
}

export interface PredictionResult {
  meetingId: string;
  candidate: Participant | null;
  confidence: number;
  topSignals: FeatureSignal[];
  weakSignals: FeatureSignal[];
  reason: string;
  ranking: ParticipantRanking[];
  missingInformation: string[];
  generatedAtIso: string;
}
