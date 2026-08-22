export default function calculator(expression) {
    try {
        if (!expression || typeof expression !== "string") {
            throw new Error("Expression is required");
        }

        // Only allow basic arithmetic.
        if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
            throw new Error("Invalid mathematical expression");
        }

        const normalized = expression.replace(/%/g, "/100");

        const result = Function(
            `"use strict"; return (${normalized})`
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        return {
            success: true,
            result
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}