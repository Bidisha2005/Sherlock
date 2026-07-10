import { z } from "zod";

const participantSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  joinedAtIso: z.string().datetime(),
  leftAtIso: z.string().datetime().optional(),
  webcamEnabled: z.boolean(),
  screenSharing: z.boolean(),
  isSpeaking: z.boolean()
});

const transcriptSegmentSchema = z.object({
  id: z.string().min(1),
  participantId: z.string().min(1),
  startedAtMs: z.number().nonnegative(),
  endedAtMs: z.number().nonnegative(),
  text: z.string(),
  confidence: z.number().min(0).max(1)
});

const telemetrySchema = z.object({
  participantId: z.string().min(1),
  speakingMs: z.number().nonnegative(),
  speakerTurns: z.number().nonnegative(),
  cameraVisibleRatio: z.number().min(0).max(1),
  faceDetectedRatio: z.number().min(0).max(1),
  questionCount: z.number().nonnegative(),
  answerCount: z.number().nonnegative(),
  interruptions: z.number().nonnegative(),
  directMentions: z.number().nonnegative()
});

export const meetingSnapshotSchema = z.object({
  meetingId: z.string().min(1),
  provider: z.enum(["google_meet", "microsoft_teams", "zoom", "mock"]),
  capturedAtIso: z.string().datetime(),
  candidateProfile: z.object({
    id: z.string().min(1),
    fullName: z.string().min(1),
    email: z.string().email(),
    resumeText: z.string(),
    expectedMeetingId: z.string().min(1),
    calendarGuestEmails: z.array(z.string().email()),
    scheduledStartIso: z.string().datetime()
  }),
  participants: z.array(participantSchema).min(1),
  transcript: z.array(transcriptSegmentSchema),
  telemetry: z.array(telemetrySchema)
});
