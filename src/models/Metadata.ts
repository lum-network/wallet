import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MetadataModel {
    @Expose({ name: 'has_next_page' })
    hasNextPage!: boolean;

    @Expose({ name: 'has_previous_page' })
    hasPreviousPage!: boolean;

    @Expose({ name: 'items_count' })
    itemsCount!: number;

    @Expose({ name: 'items_total' })
    itemsTotal!: number;

    @Expose()
    limit!: number;

    @Expose()
    page!: number;

    @Expose({ name: 'pages_total' })
    pagesTotal!: number;
}

export default MetadataModel;
