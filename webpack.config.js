const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'uifx.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'UIFX',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'uifx.css',
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          'cp dist/uifx.js demo/assets/vendor/uifx/uifx.js',
          'cp dist/uifx.css demo/assets/vendor/uifx/uifx.css'
        ],
        blocking: false,
        parallel: true
      }
    }),
  ],
};
