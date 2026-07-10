import { Collection, Db } from "mongodb";
import { FeatureSignal, PredictionResult } from "../domain/types";

interface PredictionDocument {
  prediction: PredictionResult;
  signals: FeatureSignal[];
}

export interface PredictionRepository {
  savePrediction(prediction: PredictionResult, signals: FeatureSignal[]): Promise<void>;
  findLatest(meetingId: string): Promise<PredictionResult | null>;
}

export class MongoPredictionRepository implements PredictionRepository {
  private readonly collection: Collection<PredictionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<PredictionDocument>("predictions");
  }

  async savePrediction(prediction: PredictionResult, signals: FeatureSignal[]): Promise<void> {
    await this.collection.insertOne({ prediction, signals });
  }

  async findLatest(meetingId: string): Promise<PredictionResult | null> {
    const document = await this.collection
      .find({ "prediction.meetingId": meetingId })
      .sort({ "prediction.generatedAtIso": -1 })
      .limit(1)
      .next();
    return document?.prediction ?? null;
  }
}

export class InMemoryPredictionRepository implements PredictionRepository {
  private documents: PredictionDocument[] = [];

  async savePrediction(prediction: PredictionResult, signals: FeatureSignal[]): Promise<void> {
    this.documents.push({ prediction, signals });
  }

  async findLatest(meetingId: string): Promise<PredictionResult | null> {
    return [...this.documents].reverse().find((item) => item.prediction.meetingId === meetingId)?.prediction ?? null;
  }
}
