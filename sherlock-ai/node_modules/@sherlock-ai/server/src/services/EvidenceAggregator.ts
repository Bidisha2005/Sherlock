import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";

export class EvidenceAggregator {
  constructor(private readonly extractors: FeatureExtractor[]) {}

  async aggregate(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    const batches = await Promise.all(this.extractors.map((extractor) => extractor.extract(snapshot)));
    return batches.flat();
  }
}
