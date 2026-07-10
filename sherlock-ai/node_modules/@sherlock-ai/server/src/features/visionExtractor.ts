import { signalWeights } from "../config/weights";
import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";

export class VisionExtractor implements FeatureExtractor {
  readonly name = "vision";

  async extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    return snapshot.telemetry.flatMap((item): FeatureSignal[] => {
      const participant = snapshot.participants.find((entry) => entry.id === item.participantId);
      const name = participant?.displayName ?? item.participantId;
      return [
        {
          participantId: item.participantId,
          signal: "webcam_state",
          confidence: participant?.webcamEnabled ? 0.65 : 0.2,
          weight: signalWeights.webcam_state,
          direction: participant?.webcamEnabled ? "positive" : "unknown",
          reason: participant?.webcamEnabled ? `${name} has webcam enabled.` : `${name} webcam state is unavailable or off.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: item.participantId,
          signal: "face_visibility",
          confidence: item.cameraVisibleRatio,
          weight: signalWeights.face_visibility,
          direction: item.cameraVisibleRatio >= 0.5 ? "positive" : item.cameraVisibleRatio <= 0.1 ? "unknown" : "negative",
          reason: `${name} face visibility ratio is ${(item.cameraVisibleRatio * 100).toFixed(1)}%.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: item.participantId,
          signal: "face_detection",
          confidence: item.faceDetectedRatio,
          weight: signalWeights.face_detection,
          direction: item.faceDetectedRatio >= 0.5 ? "positive" : "unknown",
          reason: `${name} has face detections in ${(item.faceDetectedRatio * 100).toFixed(1)}% of sampled frames.`,
          observedAtIso: snapshot.capturedAtIso
        }
      ];
    });
  }
}
