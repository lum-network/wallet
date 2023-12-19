/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');

module.exports = {
    webpack: function (config) {
        //do stuff with the webpack config...
        config.resolve.fallback = {
            ...config.resolve.fallback,
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            querystring: require.resolve('querystring-es3'),
            buffer: require.resolve('buffer'),
        };
        config.resolve.modules = [path.resolve(__dirname, 'src'), 'node_modules'];
        config.plugins = [
            ...config.plugins,
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        ];

        config.module.rules.push({
            test: /\.m?js$/,
            resolve: {
                fullySpecified: false,
            },
        });

        return config;
    },
    jest: function (config) {
        config.transform = {
            ...config.transform,
            '^.+\\.(ts|tsx)$': 'ts-jest',
        };

        config.moduleNameMapper = {
            ...config.moduleNameMapper,
            '\\.(css|scss)$': 'identity-obj-proxy',
            '@ledgerhq/devices': '@ledgerhq/devices/lib',
            axios: 'axios/dist/node/axios.cjs',
        };

        return config;
    },
};
