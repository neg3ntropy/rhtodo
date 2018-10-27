import { ICommandProcessor, CommandAck } from "./ICommandProcessor";
import { ICommand } from "./ICommand";
import { EventSourcingAggregateRepository } from "./EventSourcingAggregateRepository";
import { EventSourcingAggregate } from "./EventSourcingAggregate";

export class EventSourcingCommandProcessor implements ICommandProcessor {

    constructor(private readonly repository: EventSourcingAggregateRepository<EventSourcingAggregate>) {}

    public async process(command: ICommand): Promise<CommandAck> {
        try {
            const aggregate = await this.repository.load(command.aggregateId);
            aggregate.handleCommand(command);
            await this.repository.save(aggregate);
            return {ok: true, version: aggregate.version};
        } catch (error) {
            return {ok: false, error: error};
        }
    }
}
