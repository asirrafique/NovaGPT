import fs from "fs";

import { chunkText } from "./chunker.js";

import { extractText } from "./documentLoader.js";


// ============================================================
// CONFIGURATION
// ============================================================

const filePath =
    "../../MY-RESUME.pdf";


// ============================================================
// LOAD RESUME
// ============================================================

const buffer =
    fs.readFileSync(
        filePath
    );


const file = {

    buffer,

    originalname:
        "MY-RESUME.pdf",

    mimetype:
        "application/pdf"
};


// ============================================================
// EXTRACT TEXT
// ============================================================

const text =
    await extractText(file);


console.log(
    "\n📄 EXTRACTED RESUME TEXT"
);

console.log(
    "Characters:",
    text.length
);


// ============================================================
// CHUNK
// ============================================================

const chunks =
    chunkText(
        text,
        1000,
        180
    );


console.log(
    "\n📚 RESUME CHUNKS"
);

console.log(
    "Total chunks:",
    chunks.length
);


// ============================================================
// DISPLAY CHUNKS
// ============================================================

chunks.forEach(
    (chunk, index) => {

        console.log(
            `\n${"=".repeat(70)}`
        );

        console.log(
            `CHUNK ${index}`
        );

        console.log(
            `${"=".repeat(70)}`
        );

        console.log(
            chunk
        );
    }
);