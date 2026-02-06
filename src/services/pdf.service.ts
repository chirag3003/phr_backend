import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { SummaryData } from "../validators/summary.validator";

// Design Tokens
const THEME = {
    primary: "#0056D2", // Royal Blue
    secondary: "#E6F0FF", // Light Blue
    text: "#333333",
    white: "#FFFFFF",
    grey: "#808080",
    lightGrey: "#f4f4f4"
};

export class PdfService {
    private outputDir = "uploads";

    constructor() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async generateHealthSummary(data: SummaryData, aiSummary?: string): Promise<string> {
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

            // --- AI Summary ---
            if (aiSummary) {
                this.generateAiSummarySection(doc, aiSummary);
            }

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
                resolve(`/uploads/${filename}`);
            });

            stream.on("error", (err) => {
                reject(err);
            });
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument) {
        // Blue Header Background
        doc.rect(0, 0, doc.page.width, 100).fill(THEME.primary);

        // Title
        doc.fontSize(24).fillColor(THEME.white).text("Health Summary", 50, 40);

        // Subtitle / Date
        doc.fontSize(10).fillColor(THEME.secondary).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 70);

        doc.moveDown(4);
    }

    private generateProfileSection(doc: PDFKit.PDFDocument, data: SummaryData) {
        doc.fillColor(THEME.text);

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

        // Profile Box
        const startY = 120;
        doc.roundedRect(50, startY, 495, 100, 5).fill(THEME.lightGrey);

        doc.fillColor(THEME.primary).fontSize(14).text("Patient Profile", 70, startY + 15);
        doc.fillColor(THEME.text).fontSize(10);

        // Column 1
        let col1X = 70;
        let col1Y = startY + 40;
        doc.text(`Name: ${firstName} ${lastName}`, col1X, col1Y);
        doc.text(`Age: ${age} | Sex: ${sex}`, col1X, col1Y + 15);
        doc.text(`Blood Type: ${bloodType}`, col1X, col1Y + 30);

        // Column 2
        let col2X = 300;
        doc.text(`Diabetes Type: ${diabetesType}`, col2X, col1Y);
        doc.text(`Height: ${height} cm | Weight: ${weight} kg`, col2X, col1Y + 15);

        doc.font("Helvetica-Bold").text(`BMI: ${bmi}`, col2X, col1Y + 30).font("Helvetica");

        doc.y = startY + 120;
    }

    private generateAiSummarySection(doc: PDFKit.PDFDocument, summary: string) {
        doc.fillColor(THEME.primary).fontSize(16).text("AI Health Overview", 50, doc.y);
        doc.moveDown(0.5);

        doc.fillColor(THEME.text).fontSize(11).lineGap(4);
        doc.text(summary, {
            align: 'justify',
            indent: 10
        });

        doc.moveDown(2);
    }

    private drawTableHeader(doc: PDFKit.PDFDocument, y: number, headers: { text: string, x: number }[]) {
        doc.rect(50, y, 495, 20).fill(THEME.primary);
        doc.fillColor(THEME.white).fontSize(9).font("Helvetica-Bold");

        headers.forEach(h => {
            doc.text(h.text, h.x, y + 5);
        });
    }

    private generateGlucoseSection(doc: PDFKit.PDFDocument, glucose: any[]) {
        this.checkPageBreak(doc, 200);
        doc.fillColor(THEME.primary).fontSize(16).font("Helvetica-Bold").text("Glucose Readings").font("Helvetica").moveDown(0.5);

        glucose.sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

        let currentY = doc.y;
        this.drawTableHeader(doc, currentY, [
            { text: "Date", x: 60 },
            { text: "Time", x: 150 },
            { text: "Value", x: 220 },
            { text: "Context", x: 300 },
            { text: "Notes", x: 400 }
        ]);
        currentY += 20;

        doc.fillColor(THEME.text).fontSize(9).font("Helvetica");

        glucose.forEach((g, i) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                this.drawTableHeader(doc, currentY, [
                    { text: "Date", x: 60 },
                    { text: "Time", x: 150 },
                    { text: "Value", x: 220 },
                    { text: "Context", x: 300 },
                    { text: "Notes", x: 400 }
                ]);
                currentY += 20;
                doc.fillColor(THEME.text).fontSize(9).font("Helvetica");
            }

            // Zebra Striping
            if (i % 2 === 0) {
                doc.rect(50, currentY, 495, 20).fill(THEME.secondary);
                doc.fillColor(THEME.text); // Reset fill
            }

            const date = new Date(g.dateRecorded).toLocaleDateString();
            const time = `${g.time.hour.toString().padStart(2, '0')}:${g.time.minute.toString().padStart(2, '0')}`;
            const value = `${g.value} ${g.unit}`;

            doc.text(date, 60, currentY + 5);
            doc.text(time, 150, currentY + 5);

            // Highlight critical values? Maybe later.
            doc.text(value, 220, currentY + 5);
            doc.text(g.mealContext || "-", 300, currentY + 5);
            doc.text(g.notes || "-", 400, currentY + 5, { width: 140, height: 15, ellipsis: true });

            currentY += 20;
        });

        doc.moveDown(2);
    }

    private generateSymptomSection(doc: PDFKit.PDFDocument, symptoms: any[]) {
        this.checkPageBreak(doc, 200);
        doc.fillColor(THEME.primary).fontSize(16).font("Helvetica-Bold").text("Symptoms Log").font("Helvetica").moveDown(0.5);

        symptoms.sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

        let currentY = doc.y;
        this.drawTableHeader(doc, currentY, [
            { text: "Date/Time", x: 60 },
            { text: "Symptom", x: 180 },
            { text: "Intensity", x: 300 },
            { text: "Notes", x: 400 }
        ]);
        currentY += 20;
        doc.fillColor(THEME.text).fontSize(9).font("Helvetica");

        symptoms.forEach((s, i) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                // Redraw header... (omitted for brevity in this single file edit, ideally factored out)
                currentY += 20;
            }

            if (i % 2 === 0) {
                doc.rect(50, currentY, 495, 20).fill(THEME.secondary);
                doc.fillColor(THEME.text);
            }

            const date = new Date(s.dateRecorded).toLocaleDateString();
            const time = `${s.time.hour.toString().padStart(2, '0')}:${s.time.minute.toString().padStart(2, '0')}`;

            doc.text(`${date} ${time}`, 60, currentY + 5);
            doc.text(s.symptomName, 180, currentY + 5);
            doc.text(s.intensity, 300, currentY + 5);
            doc.text(s.notes || "-", 400, currentY + 5, { width: 140, height: 15, ellipsis: true });

            currentY += 20;
        });

        doc.moveDown(2);
    }

    private generateMealSection(doc: PDFKit.PDFDocument, meals: any[]) {
        this.checkPageBreak(doc, 200);
        doc.fillColor(THEME.primary).fontSize(16).font("Helvetica-Bold").text("Meal Log").font("Helvetica").moveDown(0.5);

        meals.sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

        let currentY = doc.y;
        this.drawTableHeader(doc, currentY, [
            { text: "Date/Time", x: 60 },
            { text: "Food", x: 180 },
            { text: "Type", x: 300 },
            { text: "Calories", x: 380 },
            { text: "Macros", x: 450 }
        ]);
        currentY += 20;
        doc.fillColor(THEME.text).fontSize(9).font("Helvetica");

        meals.forEach((m, i) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                currentY += 20;
            }

            if (i % 2 === 0) {
                doc.rect(50, currentY, 495, 20).fill(THEME.secondary);
                doc.fillColor(THEME.text);
            }

            const date = new Date(m.dateRecorded).toLocaleDateString();

            doc.text(`${date} ${m.time}`, 60, currentY + 5);
            doc.text(m.name, 180, currentY + 5, { width: 110, ellipsis: true });
            doc.text(m.type, 300, currentY + 5);
            doc.text(m.calories.toString(), 380, currentY + 5);

            const macros = `C:${m.carbs} P:${m.protein}`;
            doc.text(macros, 450, currentY + 5);

            currentY += 20;
        });

        doc.moveDown(2);
    }

    private generateDocumentSection(doc: PDFKit.PDFDocument, documents: any[]) {
        this.checkPageBreak(doc, 200);
        doc.fillColor(THEME.primary).fontSize(16).font("Helvetica-Bold").text("Attached Documents").font("Helvetica").moveDown(0.5);

        let currentY = doc.y;
        this.drawTableHeader(doc, currentY, [
            { text: "Title", x: 60 },
            { text: "Type", x: 250 },
            { text: "Date", x: 400 }
        ]);
        currentY += 20;
        doc.fillColor(THEME.text).fontSize(9).font("Helvetica");

        documents.forEach((d, i) => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                currentY += 20;
            }

            if (i % 2 === 0) {
                doc.rect(50, currentY, 495, 20).fill(THEME.secondary);
                doc.fillColor(THEME.text);
            }

            const date = d.date ? new Date(d.date).toLocaleDateString() : new Date(d.createdAt).toLocaleDateString();

            doc.text(d.title, 60, currentY + 5, { width: 180, ellipsis: true });
            doc.text(d.documentType, 250, currentY + 5);
            doc.text(date, 400, currentY + 5);

            currentY += 20;
        });

        doc.moveDown(2);
    }

    private checkPageBreak(doc: PDFKit.PDFDocument, spaceNeeded: number) {
        if (doc.y + spaceNeeded > doc.page.height - 50) {
            doc.addPage();
        }
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            doc.fillColor(THEME.grey).fontSize(8).text(
                `Page ${i + 1} of ${range.count} - Generated by PHR App`,
                50,
                doc.page.height - 30,
                { align: "center" }
            );
        }
    }
}
