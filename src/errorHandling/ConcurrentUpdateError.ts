import { AppError } from "./AppError";

export class ConcurrentUpdateError extends AppError {
    constructor() {
        super(409, "CONCURRENT_UPDATE", "Object was modified elsewhere while processing command");
    }
}
