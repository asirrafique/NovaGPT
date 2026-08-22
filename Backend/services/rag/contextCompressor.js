const STOP_WORDS = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "what",
    "how",
    "why",
    "when",
    "where",
    "who",
    "which",
    "does",
    "did",
    "do",
    "can",
    "could",
    "would",
    "should",
    "with",
    "from",
    "into",
    "about",
    "this",
    "that",
    "these",
    "those",
    "and",
    "or",
    "but",
    "for",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "it",
    "its",

    // Generic RAG terms
    "project",
    "projects",
    "technology",
    "technologies",
    "tech",
    "stack",
    "framework",
    "frameworks",
    "library",
    "libraries",
    "tool",
    "tools"
]);


/**
 * Normalize a word.
 */
function normalizeWord(word) {

    return word
        .toLowerCase()
        .replace(/[^\w+#.-]/g, "")
        .trim();
}


/**
 * Extract query terms.
 */
function getQueryTerms(query) {

    return (
        query
            .match(
                /[a-zA-Z0-9+#.-]+/g
            ) || []
    )
        .map(normalizeWord)
        .filter(
            word =>
                word.length > 2 &&
                !STOP_WORDS.has(word)
        );
}


/**
 * Extract important entities such as:
 *
 * Wanderlust
 * NovaGPT
 * Meetlify
 * MongoDB
 * Node.js
 * React
 */
function getImportantEntities(query) {

    return (
        query.match(
            /\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g
        ) || []
    );
}


/**
 * Split a chunk while preserving its line structure.
 *
 * Resume bullets are important structural units,
 * so we don't immediately flatten everything.
 */
function splitIntoUnits(text) {

    const normalized =
        text
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();


    if (!normalized) {
        return [];
    }


    const lines =
        normalized
            .split("\n")
            .map(
                line => line.trim()
            )
            .filter(Boolean);


    const units = [];

    let current = "";


    for (const line of lines) {

        /*
         * Resume project headings:
         *
         * Wanderlust | Live Demo | GitHub
         * NovaGPT | Live Demo | GitHub
         * Meetlify | Live Demo | GitHub
         */
        const isProjectHeading =
            /\|\s*(Live Demo|GitHub)/i.test(
                line
            );


        if (isProjectHeading) {

            if (current) {

                units.push(
                    current.trim()
                );

                current = "";
            }


            units.push(
                line
            );

            continue;
        }


        /*
         * Bullet lines are separate semantic units.
         */
        if (
            line.startsWith("•") ||
            line.startsWith("-")
        ) {

            if (current) {

                units.push(
                    current.trim()
                );

                current = "";
            }


            units.push(
                line
            );

            continue;
        }


        /*
         * Normal text.
         */
        if (current) {

            current += " " + line;

        } else {

            current = line;
        }
    }


    if (current) {

        units.push(
            current.trim()
        );
    }


    return units;
}


/**
 * Score one unit.
 */
function scoreUnit(
    unit,
    queryTerms,
    entities
) {

    const normalized =
        unit.toLowerCase();


    let score = 0;


    // ------------------------------------------------------------
    // Normal query-term matches
    // ------------------------------------------------------------

    for (
        const term
        of queryTerms
    ) {

        if (
            normalized.includes(term)
        ) {

            score += 1;
        }
    }


    // ------------------------------------------------------------
    // Strong entity/project match
    // ------------------------------------------------------------

    for (
        const entity
        of entities
    ) {

        if (
            normalized.includes(
                entity.toLowerCase()
            )
        ) {

            score += 5;
        }
    }


    // ------------------------------------------------------------
    // Project heading bonus
    // ------------------------------------------------------------

    if (
        /\|\s*(Live Demo|GitHub)/i.test(
            unit
        )
    ) {

        score += 1;
    }


    return score;
}


/**
 * Compress retrieved context while preserving
 * semantic/project structure.
 */
export function compressContext({

    query,

    results,

    maxResults = 4,

    maxSentencesPerChunk = 3

}) {

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        return [];
    }


    const queryTerms =
        getQueryTerms(
            query
        );


    const entities =
        getImportantEntities(
            query
        );


    return results
        .slice(
            0,
            maxResults
        )
        .map(
            result => {

                const units =
                    splitIntoUnits(
                        result.text
                    );


                if (
                    units.length === 0
                ) {

                    return {

                        ...result,

                        originalText:
                            result.text,

                        text:
                            result.text,

                        compressionScore:
                            0
                    };
                }


                const scored =
                    units.map(
                        (
                            unit,
                            index
                        ) => ({

                            unit,

                            index,

                            score:
                                scoreUnit(
                                    unit,
                                    queryTerms,
                                    entities
                                )
                        })
                    );


                /*
                 * If the chunk contains an exact project entity,
                 * preserve the heading and nearby content.
                 */
                const entityIndexes = [];


                scored.forEach(
                    item => {

                        const hasEntity =
                            entities.some(
                                entity =>
                                    item.unit
                                        .toLowerCase()
                                        .includes(
                                            entity.toLowerCase()
                                        )
                            );


                        if (
                            hasEntity
                        ) {

                            entityIndexes.push(
                                item.index
                            );
                        }
                    }
                );


                let selectedIndexes =
                    new Set();


                // ------------------------------------------------
                // Exact entity match
                // ------------------------------------------------

                for (
                    const index
                    of entityIndexes
                ) {

                    selectedIndexes.add(
                        index
                    );


                    /*
                     * Keep the following unit because a project
                     * heading is normally followed by its
                     * description.
                     */
                    if (
                        index + 1 <
                        units.length
                    ) {

                        selectedIndexes.add(
                            index + 1
                        );
                    }


                    /*
                     * Keep the previous unit if it exists.
                     */
                    if (
                        index - 1 >= 0
                    ) {

                        selectedIndexes.add(
                            index - 1
                        );
                    }
                }


                // ------------------------------------------------
                // Fill remaining slots by relevance
                // ------------------------------------------------

                const ranked =
                    [...scored]
                        .sort(
                            (a, b) =>
                                b.score -
                                a.score
                        );


                for (
                    const item
                    of ranked
                ) {

                    if (
                        selectedIndexes.size >=
                        maxSentencesPerChunk
                    ) {

                        break;
                    }


                    if (
                        item.score > 0
                    ) {

                        selectedIndexes.add(
                            item.index
                        );
                    }
                }


                /*
                 * If nothing matched, preserve the beginning
                 * of the chunk rather than returning arbitrary
                 * highly generic sentences.
                 */
                if (
                    selectedIndexes.size === 0
                ) {

                    for (
                        let i = 0;
                        i <
                        Math.min(
                            maxSentencesPerChunk,
                            units.length
                        );
                        i++
                    ) {

                        selectedIndexes.add(
                            i
                        );
                    }
                }


                // ------------------------------------------------
                // Restore document order
                // ------------------------------------------------

                const selectedUnits =
                    [...selectedIndexes]
                        .sort(
                            (a, b) =>
                                a - b
                        )
                        .slice(
                            0,
                            maxSentencesPerChunk
                        )
                        .map(
                            index =>
                                units[index]
                        );


                const compressedText =
                    selectedUnits
                        .join(" ")
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                const totalScore =
                    selectedUnits.reduce(
                        (
                            sum,
                            unit
                        ) =>
                            sum +
                            scoreUnit(
                                unit,
                                queryTerms,
                                entities
                            ),
                        0
                    );


                const compressionScore =
                    selectedUnits.length >
                    0
                        ? totalScore /
                          selectedUnits.length
                        : 0;


                return {

                    ...result,

                    originalText:
                        result.text,

                    text:
                        compressedText,

                    compressionScore
                };
            }
        );
}