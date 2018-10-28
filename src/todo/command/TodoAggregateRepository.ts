import { EventSourcedAggregateRepository } from "../../cqrs/EventSourcedAggregateRepository";
import { TodoAggregate } from "./TodoAggregate";

export class TodoAggregateRepository extends EventSourcedAggregateRepository<TodoAggregate> {

    protected init(aggregateId: string): TodoAggregate {
        return new TodoAggregate(aggregateId);
    }

}
