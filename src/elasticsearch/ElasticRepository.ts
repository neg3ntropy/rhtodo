import { Client, SearchParams } from "elasticsearch";

export type ISearchParams = SearchParams;

export abstract class ElasticRepository<T> {

    protected abstract readonly type: string;
    protected abstract readonly index: string;

    constructor(private readonly esClient: Client) {}

    public async get(id: string): Promise<T|undefined> {
        try {
            const resp = await this.esClient.get<T>({
                index: this.index,
                type: this.type,
                id: id,
            });
            return resp._source;
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
            refresh: "wait_for",
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

    public async search(searchParams: ISearchParams): Promise<T[]> {
        const resp = await this.esClient.search<T>({
            ...this.defaultSearchParams(),
            ...searchParams,
            index: this.index,
            type: this.type,
        });
        return resp.hits.hits.map(h => h._source);
    }

    protected defaultSearchParams(): ISearchParams {
        return {};
    }
}
