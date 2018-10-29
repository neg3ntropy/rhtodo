import { Client, SearchParams } from "elasticsearch";

export type ISearchParams = SearchParams;

export interface WithId {
    _id: string;
}

interface Hit<T> {
    readonly _id: string;
    readonly _source: T;
}

export abstract class ElasticRepository<T extends WithId & object> {

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
            return this.fromHit(resp);
        } catch (error) {
            if (error.statusCode === 404) {
                return undefined;
            }
            throw error;
        }
    }

    public async upsert(item: T): Promise<void> {
        await this.esClient.index({
            index: this.index,
            type: this.type,
            id: item._id,
            refresh: "wait_for",
            body: this.toDocument(item)
        });
    }

    public async patch(item: Partial<T> & WithId): Promise<void> {
        await this.esClient.update({
            index: this.index,
            type: this.type,
            id: item._id,
            refresh: "wait_for",
            body: {
                doc: this.toDocument(item)
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
        return resp.hits.hits.map(h => this.fromHit(h));
    }

    protected defaultSearchParams(): ISearchParams {
        return {};
    }

    private fromHit(hit: Hit<T>): T {
        const item = hit._source;
        item._id = hit._id;
        return item;
    }

    private toDocument(item: WithId): T {
        const document = {...item};
        delete document._id;
        return document as T;
    }
}
