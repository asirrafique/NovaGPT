/**
 * Deterministic query transformer.
 *
 * No Gemini call is required.
 * This prevents RAG search from consuming
 * Gemini generation quota.
 */

const STOP_WORDS = new Set([
    "what",
    "which",
    "how",
    "why",
    "when",
    "where",
    "who",

    "did",
    "does",
    "do",
    "is",
    "are",
    "was",
    "were",

    "i",
    "my",
    "me",
    "we",
    "our",

    "use",
    "used",
    "using",

    "the",
    "a",
    "an",

    "in",
    "on",
    "for",
    "with",
    "from",
    "of",
    "to",
    "and",
    "or",
    "but"
]);


const EXPANSIONS = {

    technology: [
        "technologies",
        "tech stack"
    ],

    technologies: [
        "tech stack",
        "frameworks",
        "libraries"
    ],

    framework: [
        "frameworks"
    ],

    frameworks: [
        "frameworks"
    ],

    library: [
        "libraries"
    ],

    libraries: [
        "libraries"
    ],

    stack: [
        "tech stack"
    ]
};


function tokenize(query) {

    return (
        query.match(
            /[A-Za-z0-9+#.-]+/g
        ) || []
    );
}


export async function transformQuery(query) {

    if (
        !query ||
        typeof query !== "string"
    ) {

        throw new Error(
            "Query is required"
        );
    }


    const tokens =
        tokenize(query);


    const important = [];


    for (
        const token
        of tokens
    ) {

        const lower =
            token.toLowerCase();


        if (
            STOP_WORDS.has(
                lower
            )
        ) {

            continue;
        }


        if (
            !important.some(
                item =>
                    item.toLowerCase() ===
                    lower
            )
        ) {

            important.push(
                token
            );
        }
    }


    const expansionTerms = [];


    for (
        const token
        of important
    ) {

        const lower =
            token.toLowerCase();


        const expansions =
            EXPANSIONS[
                lower
            ] || [];


        for (
            const expansion
            of expansions
        ) {

            if (
                !expansionTerms.includes(
                    expansion
                )
            ) {

                expansionTerms.push(
                    expansion
                );
            }
        }
    }


    return [
        ...important,
        ...expansionTerms
    ].join(" ");
}