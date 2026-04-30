export class Log {
    // Print based log for now
    public static warning(message: string) {
        console.log(`[WARN] ${message}`);
    }

    public static error(message: string) {
        console.log(`[ERROR] ${message}`);
    }

    public static info(message: string) {
        console.log(`[INFO] ${message}`);
    }

    public static debug(message: string) {
        console.log(`[DEBUG] ${message}`);
    }
}
