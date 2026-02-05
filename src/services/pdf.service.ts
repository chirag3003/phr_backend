import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { SummaryData } from "../validators/summary.validator";

export class PdfService {
    private outputDir = "uploads";

    constructor() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async generateHealthSummary(data: SummaryData): Promise<string> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
            const filename = `summary-${Date.now()}.pdf`;
            const filePath = path.join(this.outputDir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // --- Header ---
            this.generateHeader(doc);

            // --- Patient Profile ---
            this.generateProfileSection(doc, data);

            // --- Glucose ---
            if (data.glucose.length > 0) {
                this.generateGlucoseSection(doc, data.glucose);
            }

            // --- Symptoms ---
            if (data.symptoms.length > 0) {
                this.generateSymptomSection(doc, data.symptoms);
            }

            // --- Meals ---
            if (data.meals.length > 0) {
                this.generateMealSection(doc, data.meals);
            }

            // --- Documents ---
            if (data.documents.length > 0) {
                this.generateDocumentSection(doc, data.documents);
            }

            // --- Footer ---
            this.generateFooter(doc);

            doc.end();

            stream.on("finish", () => {
                // Return the relative URL/path that logic can convert to a full URL
                // In the controller we usually append the base URL.
                // Here we just return the filename or relative path.
                resolve(`/uploads/${filename}`);
            });

            stream.on("error", (err) => {
                reject(err);
            });
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(20)
            .text("Personal Health Record Summary", { align: "center" })
            .moveDown();

        doc
            .fontSize(10)
            .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "right" })
            .moveDown(2);

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
    }

    private generateProfileSection(doc: PDFKit.PDFDocument, data: SummaryData) {
        doc.fontSize(16).text("Patient Profile", { underline: true }).moveDown(0.5);

        if (!data.profile) {
            doc.fontSize(12).text("No profile data available.");
            doc.moveDown();
            return;
        }

        const { firstName, lastName, dob, sex, height, weight, bloodType, diabetesType } = data.profile;
        const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : "N/A";

        // Calculate BMI
        let bmi = "N/A";
        if (height && weight) {
            const heightInMeters = height / 100;
            const bmiValue = weight / (heightInMeters * heightInMeters);
            bmi = bmiValue.toFixed(1);
        }

        doc.fontSize(12);
        doc.text(`Name: ${firstName} ${lastName}`);
        doc.text(`Age: ${age}`);
        doc.text(`Sex: ${sex}`);
        doc.text(`Blood Type: ${bloodType}`);
        doc.text(`Diabetes Type: ${diabetesType}`);
        doc.text(`Height: ${height} cm`);
        doc.text(`Weight: ${weight} kg`);
        doc.text(`BMI: ${bmi}`, { stroke: true }); // Highlight BMI

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).dash(5, { space: 2 }).stroke().undash();
        doc.moveDown();
    }

    private generateGlucoseSection(doc: PDFKit.PDFDocument, glucose: any[]) {
        doc.addPage();
        doc.fontSize(16).text("Glucose Readings", { underline: true }).moveDown(0.5);

        // Sort by date desc
        glucose.sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

        // Simple Table Header
        const startX = 50;
        let currentY = doc.y;

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Date", startX, currentY);
        doc.text("Time", startX + 100, currentY);
        doc.text("Value", startX + 180, currentY);
        doc.text("Context", startX + 280, currentY);
        doc.text("Notes", startX + 400, currentY);

        currentY += 20;
        doc.moveTo(startX, currentY - 5).lineTo(550, currentY - 5).stroke();
        doc.font("Helvetica");

        glucose.forEach((g) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            const date = new Date(g.dateRecorded).toLocaleDateString();
            const time = `${g.time.hour.toString().padStart(2, '0')}:${g.time.minute.toString().padStart(2, '0')}`;
            const value = `${g.value} ${g.unit}`;

            doc.text(date, startX, currentY);
            doc.text(time, startX + 100, currentY);
            doc.text(value, startX + 180, currentY);
            doc.text(g.mealContext || "-", startX + 280, currentY);
            doc.text(g.notes || "-", startX + 400, currentY, { width: 150 });

            currentY += 20;
        });

        doc.moveDown();
    }

    private generateSymptomSection(doc: PDFKit.PDFDocument, symptoms: any[]) {
        doc.addPage();
        doc.fontSize(16).text("Symptoms Log", { underline: true }).moveDown(0.5);

        symptoms.sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

        const startX = 50;
        let currentY = doc.y;

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Date", startX, currentY);
        doc.text("Symptom", startX + 100, currentY);
        doc.text("Intensity", startX + 250, currentY);
        doc.text("Notes", startX + 350, currentY);

        currentY += 20;
        doc.moveTo(startX, currentY - 5).lineTo(550, currentY - 5).stroke();
        doc.font("Helvetica");

        symptoms.forEach((s) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            const date = new Date(s.dateRecorded).toLocaleDateString();
            const time = `${s.time.hour.toString().padStart(2, '0')}:${s.time.minute.toString().padStart(2, '0')}`;

            doc.text(`${date} ${time}`, startX, currentY);
            doc.text(s.symptomName, startX + 100, currentY);
            doc.text(s.intensity, startX + 250, currentY);
            doc.text(s.notes || "-", startX + 350, currentY, { width: 150 });

            currentY += 20;
        });

        doc.moveDown();
    }

    private generateMealSection(doc: PDFKit.PDFDocument, meals: any[]) {
        doc.addPage();
        doc.fontSize(16).text("Meal Log", { underline: true }).moveDown(0.5);

        meals.sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

        const startX = 50;
        let currentY = doc.y;

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Date/Time", startX, currentY);
        doc.text("Food", startX + 100, currentY);
        doc.text("Type", startX + 250, currentY);
        doc.text("Calories", startX + 350, currentY);
        doc.text("Carbs/Prot/Fat", startX + 420, currentY);


        currentY += 20;
        doc.moveTo(startX, currentY - 5).lineTo(550, currentY - 5).stroke();
        doc.font("Helvetica");

        meals.forEach((m) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            const date = new Date(m.dateRecorded).toLocaleDateString();
            // m.time is string like "HH:MM" in Meal model, unlike others

            doc.text(`${date} ${m.time}`, startX, currentY);
            doc.text(m.name, startX + 100, currentY, { width: 140 });
            doc.text(m.type, startX + 250, currentY);
            doc.text(m.calories.toString(), startX + 350, currentY);

            const macros = `C:${m.carbs} P:${m.protein} F:${m.fiber || 0}`; // Assuming fiber is usually tracked, or we can assume fats. Model has fiber.
            doc.text(macros, startX + 420, currentY);

            currentY += 20;
        });

        doc.moveDown();
    }

    private generateDocumentSection(doc: PDFKit.PDFDocument, documents: any[]) {
        doc.addPage();
        doc.fontSize(16).text("Attached Documents", { underline: true }).moveDown(0.5);

        const startX = 50;
        let currentY = doc.y;

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Title", startX, currentY);
        doc.text("Type", startX + 200, currentY);
        doc.text("Date", startX + 350, currentY);

        currentY += 20;
        doc.moveTo(startX, currentY - 5).lineTo(550, currentY - 5).stroke();
        doc.font("Helvetica");

        documents.forEach((d) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            const date = d.date ? new Date(d.date).toLocaleDateString() : new Date(d.createdAt).toLocaleDateString();

            doc.text(d.title, startX, currentY, { width: 190 });
            doc.text(d.documentType, startX + 200, currentY);
            doc.text(date, startX + 350, currentY);

            currentY += 20;
        });
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).text(
                `Page ${i + 1} of ${range.count}`,
                50,
                doc.page.height - 50,
                { align: "center" }
            );
        }
    }
}
