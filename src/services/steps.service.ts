import { Steps } from "../models";
import type { SyncStepsRequest, LastUpdatedResponse } from "../validators";

export class StepsService {
  /**
   * Get last sync date for a user
   * Used by mobile app to know which date range to sync next
   */
  async getLastSyncDate(userId: string): Promise<LastUpdatedResponse> {
    const lastEntry = await Steps.findOne({ userId }).sort({ dateRecorded: -1 });

    if (!lastEntry) {
      // If no data exists, suggest syncing from 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return {
        lastSyncDate: null,
        nextSyncStartDate: thirtyDaysAgo,
      };
    }

    const lastSyncDate = lastEntry.dateRecorded;
    // Next sync should start from the day after last sync
    const nextSyncStartDate = new Date(lastSyncDate);
    nextSyncStartDate.setDate(nextSyncStartDate.getDate() + 1);

    return {
      lastSyncDate,
      nextSyncStartDate,
    };
  }

  /**
   * Sync steps data from mobile app
   * Validates dates (no today, no future dates) and performs bulk upsert
   */
  async syncSteps(userId: string, data: SyncStepsRequest): Promise<{ synced: number; lastSyncDate: Date }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate all dates - reject if any date is >= today
    for (const step of data.steps) {
      const stepDate = new Date(step.dateRecorded);
      stepDate.setHours(0, 0, 0, 0);

      if (stepDate >= today) {
        throw new Error(
          `Invalid date: ${step.dateRecorded}. Cannot sync steps for today or future dates. Only sync data up to yesterday.`
        );
      }
    }

    // Bulk upsert to prevent duplicates if same day synced twice
    const upsertOps = data.steps.map((step) => ({
      updateOne: {
        filter: {
          userId: new (require("mongoose")).Types.ObjectId(userId),
          dateRecorded: new Date(step.dateRecorded),
        },
        update: {
          $set: {
            userId: new (require("mongoose")).Types.ObjectId(userId),
            dateRecorded: new Date(step.dateRecorded),
            stepCount: step.stepCount,
            source: step.source || "AppleHealthKit",
            syncedAt: new Date(),
            notes: step.notes,
          },
        },
        upsert: true,
      },
    }));

    await (Steps.collection as any).bulkWrite(upsertOps);

    // Get the latest sync date
    const latestEntry = await Steps.findOne({ userId }).sort({ dateRecorded: -1 });
    const lastSyncDate = latestEntry?.dateRecorded || new Date();

    return {
      synced: data.steps.length,
      lastSyncDate,
    };
  }

  /**
   * Get steps for a specific date range
   */
  async getStepsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return Steps.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    }).sort({ dateRecorded: -1 });
  }

  /**
   * Get all steps for a user
   */
  async getSteps(userId: string) {
    return Steps.find({ userId }).sort({ dateRecorded: -1 });
  }

  /**
   * Get latest step record for a user
   */
  async getLatestSteps(userId: string) {
    return Steps.findOne({ userId }).sort({ dateRecorded: -1 });
  }

  /**
   * Get step statistics for a date range
   */
  async getStepsStats(userId: string, startDate: Date, endDate: Date) {
    const steps = await Steps.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    });

    if (steps.length === 0) {
      return {
        totalSteps: 0,
        averageStepsPerDay: 0,
        minSteps: 0,
        maxSteps: 0,
        daysWithData: 0,
      };
    }

    const stepCounts = steps.map((s) => s.stepCount);
    const totalSteps = stepCounts.reduce((a, b) => a + b, 0);

    return {
      totalSteps,
      averageStepsPerDay: Math.round(totalSteps / steps.length),
      minSteps: Math.min(...stepCounts),
      maxSteps: Math.max(...stepCounts),
      daysWithData: steps.length,
    };
  }

  /**
   * Delete steps by ID
   */
  async deleteSteps(id: string) {
    return Steps.findByIdAndDelete(id);
  }
}
