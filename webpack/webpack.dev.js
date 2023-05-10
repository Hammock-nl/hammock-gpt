const path = require('path')
const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common.js')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = merge(commonConfig('dev'), {
    mode: 'development',
    target: 'web', // Required for react-hot-loading to work properly.
    plugins: [new ReactRefreshWebpackPlugin({ overlay: false })],
    devtool: 'eval-source-map',
    devServer: {
        devMiddleware: {
            publicPath: '/',
        },
        hot: true,
        compress: true,
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: 'all',
        historyApiFallback: true,
        static: {
            directory: path.resolve('dist'),
            staticOptions: {
                redirect: false,
            },
        },
        server: {
            type: 'https',
            options: {
                pfx: '/projects/hammock/certs/hammock.pfx',
                passphrase: '',
            },
        },
    },
})
