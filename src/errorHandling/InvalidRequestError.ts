import { AppError } from "./AppError";

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(400, "BAD_REQUEST", message);
    }
}
