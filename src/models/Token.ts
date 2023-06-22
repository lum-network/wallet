import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
class TokenModel {
    @Expose({ name: 'current_price' })
    price!: number;

    @Expose({ name: 'symbol' })
    @Type(() => String)
    @Transform(({ value }) => value.toString().toLowerCase())
    denom!: string;
}

export default TokenModel;
