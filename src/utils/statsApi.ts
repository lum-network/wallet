import { HttpClient } from 'utils';
import { COINGECKO_API_URL } from 'constant';
import { TokenModel } from 'models';

class StatsApi extends HttpClient {
    private static instance?: StatsApi;

    private constructor() {
        super(COINGECKO_API_URL);
    }

    public static getInstance(): StatsApi {
        if (!this.instance) {
            this.instance = new StatsApi();
        }

        return this.instance;
    }

    getPrices = async () =>
        this.request<TokenModel[]>(
            {
                url: '/coins/markets?vs_currency=usd&ids=lum-network%2C%20cosmos%2C%20osmosis&order=id_asc',
                method: 'GET',
            },
            TokenModel,
        );
}

export default StatsApi.getInstance();
