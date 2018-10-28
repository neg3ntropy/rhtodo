interface Sourced<T, U> {
    [onMethod: string]: ((payload: T) => U) | undefined;
}

export function dispatch<U, T extends {name: string}>(handler: unknown, payload: T, deflt?: () => U): U {
    const handlerName = `on${payload.name}`;
    const handlerMethod = (handler as Sourced<T, U>)[handlerName];
    if (typeof handlerMethod === "function") {
        return handlerMethod.bind(handler)(payload);
    } else if (deflt) {
        return deflt();
    } else {
        throw new Error(`Not implemented: ${handlerName}`);
    }
}

export function uidToDate(uuid: string): Date {
    const split = uuid.split("-");
    const timeString = [
        split[2].substring(1),
        split[1],
        split[0]
    ].join("");
    const uuidTime = parseInt(timeString, 16) - 122192928000000000;
    return new Date(Math.floor(uuidTime / 10000));
}
