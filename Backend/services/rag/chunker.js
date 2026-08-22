const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 180;


/**
 * Normalize extracted document text.
 */
function normalizeText(text) {

    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


/**
 * Detect whether a line looks like a document heading.
 *
 * Useful for:
 * - PROJECTS
 * - EDUCATION
 * - SKILLS
 * - EXPERIENCE
 * - Wanderlust
 * - NovaGPT
 * - Meetlify
 */
function looksLikeHeading(line) {

    const clean =
        line.trim();


    if (!clean) {
        return false;
    }


    // Markdown-style heading
    if (
        /^#{1,6}\s+/.test(
            clean
        )
    ) {

        return true;
    }


    // Common resume sections
    if (
        /^(projects?|skills?|experience|education|certifications?|achievements?|summary|objective|technical skills?)$/i
            .test(clean)
    ) {

        return true;
    }


    // Short title-like line.
    //
    // Avoid treating normal sentences as headings.
    if (
        clean.length <= 60 &&
        !/[.!?]$/.test(clean) &&
        !clean.startsWith("•")
    ) {

        const words =
            clean.split(/\s+/);


        if (
            words.length <= 8
        ) {

            return true;
        }
    }


    return false;
}


/**
 * Split text at semantic boundaries.
 */
function findBestBreak(
    text,
    start,
    end
) {

    const minimum =
        start +
        Math.floor(
            (end - start) *
            0.55
        );


    const boundaryCandidates = [

        // Paragraph
        text.lastIndexOf(
            "\n\n",
            end
        ),

        // New line
        text.lastIndexOf(
            "\n",
            end
        ),

        // Sentence
        text.lastIndexOf(
            ". ",
            end
        ),

        text.lastIndexOf(
            "? ",
            end
        ),

        text.lastIndexOf(
            "! ",
            end
        ),

        // Whitespace
        text.lastIndexOf(
            " ",
            end
        )
    ];


    const valid =
        boundaryCandidates
            .filter(
                (position) =>
                    position >=
                    minimum
            )
            .sort(
                (a, b) =>
                    b - a
            );


    if (
        valid.length === 0
    ) {

        return end;
    }


    let breakPosition =
        valid[0];


    // Keep punctuation in the chunk.
    if (
        text[breakPosition] === "." ||
        text[breakPosition] === "?" ||
        text[breakPosition] === "!"
    ) {

        breakPosition += 1;
    }


    return breakPosition;
}


/**
 * Find a good overlap starting point.
 */
function calculateNextStart(
    text,
    end,
    overlap,
    start
) {

    let nextStart =
        Math.max(
            end - overlap,
            start + 1
        );


    // Don't start in the middle of a word.
    while (
        nextStart < end &&
        !/\s/.test(
            text[nextStart]
        )
    ) {

        nextStart++;
    }


    return nextStart;
}


/**
 * Split document text into semantic-ish chunks.
 *
 * Improvements over the old implementation:
 *
 * 1. Better paragraph boundaries
 * 2. Better sentence boundaries
 * 3. Resume heading awareness
 * 4. Larger overlap
 * 5. Avoids aggressive cutting around project sections
 */
export function chunkText(
    text,
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_CHUNK_OVERLAP
) {

    if (
        !text ||
        typeof text !== "string"
    ) {

        return [];
    }


    if (
        chunkSize <= 0
    ) {

        throw new Error(
            "chunkSize must be greater than 0"
        );
    }


    if (
        overlap < 0 ||
        overlap >= chunkSize
    ) {

        throw new Error(
            "overlap must be smaller than chunkSize"
        );
    }


    const normalizedText =
        normalizeText(
            text
        );


    if (!normalizedText) {

        return [];
    }


    // ------------------------------------------------------------
    // First pass:
    // protect heading boundaries
    // ------------------------------------------------------------

    const lines =
        normalizedText.split(
            "\n"
        );


    const semanticBlocks = [];

    let currentBlock = [];


    for (const line of lines) {

        if (
            looksLikeHeading(line) &&
            currentBlock.length > 0
        ) {

            semanticBlocks.push(
                currentBlock.join("\n")
            );

            currentBlock = [];
        }


        currentBlock.push(
            line
        );
    }


    if (
        currentBlock.length > 0
    ) {

        semanticBlocks.push(
            currentBlock.join("\n")
        );
    }


    // ------------------------------------------------------------
    // Second pass:
    // create chunks
    // ------------------------------------------------------------

    const chunks = [];


    for (
        const block of semanticBlocks
    ) {

        const cleanBlock =
            block.trim();


        if (!cleanBlock) {
            continue;
        }


        // Small semantic block:
        // keep it intact.
        if (
            cleanBlock.length <=
            chunkSize
        ) {

            chunks.push(
                cleanBlock
            );

            continue;
        }


        // Large block:
        // split normally.
        let start = 0;


        while (
            start <
            cleanBlock.length
        ) {

            let end =
                Math.min(
                    start +
                    chunkSize,
                    cleanBlock.length
                );


            if (
                end <
                cleanBlock.length
            ) {

                end =
                    findBestBreak(
                        cleanBlock,
                        start,
                        end
                    );
            }


            const chunk =
                cleanBlock
                    .slice(
                        start,
                        end
                    )
                    .trim();


            if (chunk) {

                chunks.push(
                    chunk
                );
            }


            if (
                end >=
                cleanBlock.length
            ) {

                break;
            }


            start =
                calculateNextStart(
                    cleanBlock,
                    end,
                    overlap,
                    start
                );
        }
    }


    return chunks;
}