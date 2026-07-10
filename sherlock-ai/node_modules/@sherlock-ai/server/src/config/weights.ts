import { EvidenceSignal } from "../domain/types";

export const signalWeights: Record<EvidenceSignal, number> = {
  display_name_similarity: 0.13,
  calendar_metadata: 0.08,
  candidate_email: 0.14,
  speaking_duration: 0.07,
  speaker_turns: 0.05,
  webcam_state: 0.04,
  face_detection: 0.08,
  face_visibility: 0.05,
  transcript_analysis: 0.1,
  self_introduction: 0.12,
  resume_matching: 0.1,
  screen_share: 0.03,
  join_order: 0.03,
  participant_events: 0.03,
  conversation_graph: 0.04,
  question_answer_role: 0.04
};
