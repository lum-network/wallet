import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { plainToInstance } from 'class-transformer';
import { MetadataModel } from 'models';

declare module 'axios' {
    interface AxiosResponse<T = any> extends Promise<T> {
        data: T;
    }
}

abstract class HttpClient {
    protected readonly instance: AxiosInstance;
    private readonly subObject?: string;

    protected constructor(baseURL: string, subObject?: string) {
        this.instance = axios.create({ baseURL, timeout: 10000 });
        this.subObject = subObject;

        this.initializeResponseInterceptor();
    }

    private initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use((res) => this.handleResponse(res), this.handleError);
    };

    private handleResponse = ({ data }: AxiosResponse) => data;

    private handleError = (error: any): Promise<any> => Promise.reject(error);

    protected request = async <T>(config: AxiosRequestConfig, Model: any): Promise<[T, MetadataModel]> => {
        const response = await this.instance.request(config);

        return [
            plainToInstance(Model, this.subObject ? response[this.subObject] : response) as unknown as T,
            plainToInstance(MetadataModel, response.metadata),
        ];
    };
}

export default HttpClient;
