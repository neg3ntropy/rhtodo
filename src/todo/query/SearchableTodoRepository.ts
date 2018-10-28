import { ElasticRepository } from "../../elasticsearch/ElasticRepository";

export class SearchableTodoRepository extends ElasticRepository<SearchableTodo> {
    protected readonly type = "todo";
    protected readonly index = "todo";
}
