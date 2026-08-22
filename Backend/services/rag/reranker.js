/**
 * Extract useful tokens.
 */
function tokenize(text) {

    return (
        text
            .toLowerCase()
            .match(
                /[a-z0-9+#.-]+/g
            ) || []
    );
}


/**
 * Extract important entities from original-style queries.
 *
 * Examples:
 * Wanderlust
 * NovaGPT
 * Meetlify
 */
function extractEntities(query) {

    return (
        query.match(
            /\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g
        ) || []
    );
}


/**
 * Rerank retrieved results.
 */
export function rerankResults({

    results,

    query,

    originalQuery = query,

    topK = 5

}) {

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        return [];
    }


    const queryWords =
        tokenize(
            query
        );


    const entities =
        extractEntities(
            originalQuery
        );


    const reranked =
        results.map(
            result => {

                const text =
                    result.text
                        .toLowerCase();


                // ------------------------------------------------
                // Query term coverage
                // ------------------------------------------------

                const matchedWords =
                    queryWords.filter(
                        word =>
                            word.length > 2 &&
                            text.includes(word)
                    );


                const termCoverage =
                    queryWords.length > 0
                        ? matchedWords.length /
                          queryWords.length
                        : 0;


                // ------------------------------------------------
                // Exact entity coverage
                // ------------------------------------------------

                let entityMatches = 0;


                for (
                    const entity
                    of entities
                ) {

                    if (
                        text.includes(
                            entity.toLowerCase()
                        )
                    ) {

                        entityMatches++;
                    }
                }


                const entityCoverage =
                    entities.length > 0
                        ? entityMatches /
                          entities.length
                        : 0;


                // ------------------------------------------------
                // Exact phrase
                // ------------------------------------------------

                const phraseBonus =
                    text.includes(
                        originalQuery
                            .toLowerCase()
                    )
                        ? 0.15
                        : 0;


                // ------------------------------------------------
                // Project/entity bonus
                // ------------------------------------------------

                const entityBonus =
                    entityCoverage *
                    0.35;


                // ------------------------------------------------
                // Final score
                // ------------------------------------------------

                const rerankScore =
                    (
                        result.combinedScore *
                        0.55
                    ) +
                    (
                        termCoverage *
                        0.20
                    ) +
                    (
                        entityCoverage *
                        0.25
                    ) +
                    entityBonus +
                    phraseBonus;


                return {

                    ...result,

                    termCoverage,

                    entityCoverage,

                    phraseBonus,

                    rerankScore
                };
            }
        );


    reranked.sort(
        (a, b) =>
            b.rerankScore -
            a.rerankScore
    );


    return reranked.slice(
        0,
        topK
    );
}