require('babel-polyfill');
require('whatwg-fetch');

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    path.resolve(__dirname, './javascripts/app.js'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        use:  'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'postcss-loader',
          'sass-loader',
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin('dist', {} ),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
    })
  ]
};