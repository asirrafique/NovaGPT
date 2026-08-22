import calculator from "./calculator.js";
import currentTime from "./currentTime.js";

const tools = {
    calculator: {
        name: "calculator",
        description: "Performs basic mathematical calculations.",
        execute: calculator
    },

    current_time: {
        name: "current_time",
        description: "Returns the current date and time for a timezone.",
        execute: currentTime
    }
};

export function getTool(name) {
    return tools[name];
}

export function getToolDefinitions() {
    return Object.values(tools).map((tool) => ({
        name: tool.name,
        description: tool.description
    }));
}