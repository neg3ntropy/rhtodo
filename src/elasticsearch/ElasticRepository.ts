import { Client } from "elasticsearch";

export abstract class ElasticRepository<T> {

    protected abstract readonly type: string;
    protected abstract readonly index: string;

    constructor(private readonly esClient: Client) {}

    public async get(id: string): Promise<T|undefined> {
        try {
            const resp = await this.esClient.get({
                index: this.index,
                type: this.type,
                id: id,
            });
            return resp._source as T;
        } catch (error) {
            if (error.statusCode === 404) {
                return undefined;
            }
            throw error;
        }
    }

    public async upsert(id: string, item: T): Promise<void> {
        await this.esClient.index({
            index: this.index,
            type: this.type,
            id: id,
            body: item
        });
    }

    public async patch(id: string, item: Partial<T>): Promise<void> {
        await this.esClient.update({
            index: this.index,
            type: this.type,
            id: id,
            body: {
                doc: item
            }
        });
    }

    public async delete(id: string): Promise<void> {
        await this.esClient.delete({
            index: this.index,
            type: this.type,
            id: id
        });
    }

    public async search(id: string, match: Partial<T>): Promise<T[]> {
        const resp = await this.esClient.search({
            index: "test1", type: "todo",
            body: {
                query: {
                  match: match
                }
              }
        });
        return resp.hits.hits.map(h => h._source as T);
    }
}
