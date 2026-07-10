import { FeatureSignal, MeetingSnapshot } from "./types";

export interface FeatureExtractor {
  readonly name: string;
  extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]>;
}
