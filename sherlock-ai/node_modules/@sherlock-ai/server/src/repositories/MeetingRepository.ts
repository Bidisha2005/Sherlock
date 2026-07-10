import { Collection, Db } from "mongodb";
import { MeetingSnapshot } from "../domain/types";

export interface MeetingRepository {
  saveSnapshot(snapshot: MeetingSnapshot): Promise<void>;
  findLatestSnapshot(meetingId: string): Promise<MeetingSnapshot | null>;
}

export class MongoMeetingRepository implements MeetingRepository {
  private readonly collection: Collection<MeetingSnapshot>;

  constructor(db: Db) {
    this.collection = db.collection<MeetingSnapshot>("meeting_snapshots");
  }

  async saveSnapshot(snapshot: MeetingSnapshot): Promise<void> {
    await this.collection.insertOne(snapshot);
  }

  async findLatestSnapshot(meetingId: string): Promise<MeetingSnapshot | null> {
    return this.collection.find({ meetingId }).sort({ capturedAtIso: -1 }).limit(1).next();
  }
}

export class InMemoryMeetingRepository implements MeetingRepository {
  private snapshots: MeetingSnapshot[] = [];

  async saveSnapshot(snapshot: MeetingSnapshot): Promise<void> {
    this.snapshots.push(snapshot);
  }

  async findLatestSnapshot(meetingId: string): Promise<MeetingSnapshot | null> {
    return [...this.snapshots].reverse().find((snapshot) => snapshot.meetingId === meetingId) ?? null;
  }
}
