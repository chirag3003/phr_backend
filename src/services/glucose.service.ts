import { Glucose } from "../models/glucose";
import type { CreateGlucoseInput, UpdateGlucoseInput } from "../validators/glucose.schema";

export const glucoseService = {
    async create(userId: string, data: CreateGlucoseInput) {
        const glucose = new Glucose({ ...data, userId });
        return glucose.save();
    },

    async findAll(userId: string) {
        return Glucose.find({ userId }).sort({ dateRecorded: -1, "time.hour": -1, "time.minute": -1 });
    },

    async findById(id: string) {
        return Glucose.findById(id);
    },

    async findByDateRange(userId: string, startDate: Date, endDate: Date) {
        return Glucose.find({
            userId,
            dateRecorded: { $gte: startDate, $lte: endDate },
        }).sort({ dateRecorded: -1, "time.hour": -1, "time.minute": -1 });
    },

    async findByMealContext(userId: string, mealContext: string) {
        return Glucose.find({ userId, mealContext }).sort({ dateRecorded: -1 });
    },

    async getLatest(userId: string) {
        return Glucose.findOne({ userId }).sort({ dateRecorded: -1, "time.hour": -1, "time.minute": -1 });
    },

    async getStats(userId: string, startDate: Date, endDate: Date): Promise<{
        average: number;
        min: number;
        max: number;
        count: number;
        inRange: number;
        belowRange: number;
        aboveRange: number;
    }> {
        const readings = await Glucose.find({
            userId,
            dateRecorded: { $gte: startDate, $lte: endDate },
        });

        if (readings.length === 0) {
            return { average: 0, min: 0, max: 0, count: 0, inRange: 0, belowRange: 0, aboveRange: 0 };
        }

        const values = readings.map((r) => r.value);
        const sum = values.reduce((a, b) => a + b, 0);

        // Target range: 70-180 mg/dL (standard diabetes management range)
        const inRange = values.filter((v) => v >= 70 && v <= 180).length;
        const belowRange = values.filter((v) => v < 70).length;
        const aboveRange = values.filter((v) => v > 180).length;

        return {
            average: Math.round(sum / values.length),
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
            inRange,
            belowRange,
            aboveRange,
        };
    },

    async update(id: string, data: UpdateGlucoseInput) {
        return Glucose.findByIdAndUpdate(id, data, { new: true });
    },

    async delete(id: string) {
        return Glucose.findByIdAndDelete(id);
    },
};
