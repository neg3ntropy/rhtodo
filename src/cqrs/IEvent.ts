export interface IEvent {
    readonly name: string;
    aggregateId?: string;
    sequence?: number;
    timeUuid?: string;
}

export interface IPublishedEvent extends IEvent {
    readonly aggregateId: string;
    readonly sequence: number;
    readonly timeUuid: string;
}
