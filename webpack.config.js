module.exports = {
    rules: [
        {
            // node_modules - only babel, no eslint
            test: /\.(ts|tsx)$/,
            include: [path.resolve(__dirname, 'node_modules')],
            use: [
                {
                    loader: 'babel-loader',
                },
            ],
        },
        {
            // project files - babel + eslint
            test: /\.(ts|tsx)$/,
            include: [path.resolve(__dirname, './src/')],
            use: [
                {
                    loader: 'babel-loader',
                },
                {
                    loader: 'eslint-loader',
                },
            ],
        },
    ],
};
