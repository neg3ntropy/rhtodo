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
