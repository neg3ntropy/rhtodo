import uuid = require("uuid");

export class UuidFactory {

    public static readonly defaultInstance = new UuidFactory();

    public uuid(): string {
        return uuid.v4();
    }
    public timeUuid(): string {
        return uuid.v1();
    }

}
