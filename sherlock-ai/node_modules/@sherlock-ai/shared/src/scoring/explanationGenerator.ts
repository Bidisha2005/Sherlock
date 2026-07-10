import { PredictionResult } from "../types";

export class ExplanationGenerator {
  toHumanReadable(result: PredictionResult): string {
    const selected = result.candidate?.displayName ?? "Unknown";
    const positives = result.topSignals.map((signal) => `+ ${signal.reason}`).join("\n");
    const weak = result.weakSignals.map((signal) => `- ${signal.reason}`).join("\n");
    const missing = result.missingInformation.map((item) => `? ${item}`).join("\n");

    return [
      `Selected Participant: ${selected}`,
      `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
      "Positive Signals:",
      positives || "No strong positive signals yet.",
      "Weak / Negative / Unknown Signals:",
      weak || "No major weak signals.",
      "Missing Information:",
      missing || "No critical missing information."
    ].join("\n");
  }
}
