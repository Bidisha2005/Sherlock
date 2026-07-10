import { EventExtractor } from "../features/eventExtractor";
import { EmailExtractor } from "../features/emailExtractor";
import { NameMatchingExtractor } from "../features/nameMatchingExtractor";
import { SpeechExtractor } from "../features/speechExtractor";
import { TranscriptExtractor } from "../features/transcriptExtractor";
import { VisionExtractor } from "../features/visionExtractor";
import { MeetingRepository } from "../repositories/MeetingRepository";
import { PredictionRepository } from "../repositories/PredictionRepository";
import { FeatureSignal, MeetingSnapshot, PredictionResult } from "../domain/types";
import { ConfidenceEngine } from "./ConfidenceEngine";
import { EvidenceAggregator } from "./EvidenceAggregator";

export class PredictionService {
  private readonly aggregator = new EvidenceAggregator([
    new NameMatchingExtractor(),
    new EmailExtractor(),
    new SpeechExtractor(),
    new VisionExtractor(),
    new TranscriptExtractor(),
    new EventExtractor()
  ]);

  private readonly confidenceEngine = new ConfidenceEngine();

  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly predictionRepository: PredictionRepository
  ) {}

  async predict(snapshot: MeetingSnapshot): Promise<{ prediction: PredictionResult; signals: FeatureSignal[] }> {
    await this.meetingRepository.saveSnapshot(snapshot);
    const signals = await this.aggregator.aggregate(snapshot);
    const prediction = this.confidenceEngine.score(snapshot, signals);
    await this.predictionRepository.savePrediction(prediction, signals);
    return { prediction, signals };
  }

  async latest(meetingId: string): Promise<PredictionResult | null> {
    return this.predictionRepository.findLatest(meetingId);
  }
}
