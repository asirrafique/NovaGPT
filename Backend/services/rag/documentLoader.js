import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";


export async function extractText(file) {

    if (!file) {
        throw new Error("File is required");
    }


    const mimeType =
        file.mimetype;


    // ============================================================
    // PDF
    // ============================================================

    if (
        mimeType === "application/pdf"
    ) {

        const parser =
            new PDFParse({
                data: file.buffer
            });


        try {

            const result =
                await parser.getText();


            return result.text || "";

        } finally {

            await parser.destroy();

        }
    }


    // ============================================================
    // DOCX
    // ============================================================

    if (
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

        const result =
            await mammoth.extractRawText({
                buffer: file.buffer
            });


        return result.value || "";
    }


    // ============================================================
    // TXT
    // ============================================================

    if (
        mimeType === "text/plain"
    ) {

        return file.buffer.toString(
            "utf-8"
        );
    }


    // ============================================================
    // UNSUPPORTED
    // ============================================================

    throw new Error(
        `Unsupported document type: ${mimeType}`
    );
}   