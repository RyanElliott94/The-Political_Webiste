const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/js/index.js', './src/js/views/loginView.js', './src/js/views/registerView.js', './src/js/views/profileView.js', './src/js/views/viewProfile.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'login.html',
            template: './src/login.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'profile.html',
            template: './src/profile.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'register.html',
            template: './src/register.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'view-profile.html',
            template: './src/view-profile.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                    loader: 'file-loader',
                    options: { 
                        name: '[name].[ext]'
                    } 
                }
            ]
            },
            {
                 test: /\.css$/,
                 use: [
                   'style-loader',
                   'css-loader',
                   'sass-loader'
                 ]
         }
        ]
    }
};
