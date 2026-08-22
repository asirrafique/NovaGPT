export default function currentTime(timeZone = "UTC") {
    try {
        const time = new Intl.DateTimeFormat("en-US", {
            timeZone,
            dateStyle: "full",
            timeStyle: "long"
        }).format(new Date());

        return {
            success: true,
            timeZone,
            time
        };

    } catch (error) {
        return {
            success: false,
            error: "Invalid timezone"
        };
    }
}