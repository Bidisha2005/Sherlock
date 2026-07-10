import assert from "node:assert/strict";

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const contribution = (signal) => {
  const magnitude = clamp01(signal.confidence) * clamp01(signal.weight);
  return signal.direction === "negative" ? -magnitude : signal.direction === "unknown" ? 0 : magnitude;
};

const score = (participantId, signals) => {
  const participantSignals = signals.filter((signal) => signal.participantId === participantId);
  const totalWeight = participantSignals.reduce((sum, signal) => sum + clamp01(signal.weight), 0) || 1;
  const rawScore = participantSignals.reduce((sum, signal) => sum + contribution(signal), 0);
  return clamp01((rawScore / totalWeight + 1) / 2);
};

const signals = [
  { participantId: "p1", confidence: 0.9, weight: 0.2, direction: "positive" },
  { participantId: "p1", confidence: 0.8, weight: 0.3, direction: "positive" },
  { participantId: "p2", confidence: 0.9, weight: 0.2, direction: "negative" },
  { participantId: "p2", confidence: 0.4, weight: 0.3, direction: "positive" }
];

assert.ok(score("p1", signals) > score("p2", signals));
assert.ok(score("p1", signals) <= 1);
assert.ok(score("p2", signals) >= 0);
console.log("shared scoring tests passed");
