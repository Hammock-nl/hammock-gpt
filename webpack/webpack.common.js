const webpack = require('webpack')
const path = require('path')
const npmPackage = require('../package.json')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const DotEnvWebpackPlugin = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const build = (() => {
    const timestamp = new Date().getTime()
    return {
        name: npmPackage.name,
        version: npmPackage.version,
        timestamp: timestamp,
        author: npmPackage.author,
    }
})()

module.exports = (env, baseHref) => ({
    context: path.resolve('./src'),
    devtool: 'source-map',
    target: 'browserslist',
    entry: {
        vendor: ['core-js', 'react', 'react-dom', '@fluentui/react'],
        app: ['./index.tsx'],
    },
    output: {
        path: path.resolve('dist'),
        filename: '[name].[fullhash].js',
        chunkFilename: '[id].[fullhash].chunk.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css', '.html'],
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [env === 'dev' && 'react-refresh/babel'].filter(Boolean),
                        },
                    },
                ],
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader', // compiles Sass to CSS, using Node Sass by default
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader',
                options: {
                    name: 'assets/[name].[ext]',
                },
            },
        ],
    },
    optimization: {
        emitOnErrors: false,
        chunkIds: 'named',
        removeAvailableModules: true,
    },
    plugins: [
        new DotEnvWebpackPlugin({
            path: `./webpack/.env.${env}`,
            defaults: './webpack/.env',
        }),
        new webpack.BannerPlugin({
            banner: `${build.name} v.${build.version} (${build.timestamp}) © ${build.author}`,
        }),
        new webpack.DefinePlugin({
            'process.env.BUILD': JSON.stringify(build),
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                htmlLoader: {
                    minimize: true,
                },
            },
        }),
        new MiniCssExtractPlugin({ filename: '[name].[fullhash].css' }),
        new HtmlWebpackPlugin({
            title: 'HAMMOCK',
            filename: 'index.html',
            template: '../assets/index.html',
            chunks: ['app'],
            base: baseHref || '/',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: '../assets/icons/manifest',
                    to: 'icons',
                },
                {
                    from: '../assets/manifests',
                    to: '[name][ext]',
                },
                {
                    from: '../assets/manifests/manifest.xml',
                    to: 'manifest.xml',
                },
            ],
        }),
    ],
})
