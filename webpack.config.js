const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const JsConfigWebpackPlugin = require('js-config-webpack-plugin')
const TsConfigWebpackPlugin = require('ts-config-webpack-plugin')
const ScssConfigWebpackPlugin = require('scss-config-webpack-plugin')

module.exports = {
  entry: './src/index.jsx',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: {
          loader: 'elm-webpack-loader',
          options: {},
        },
      },
    ],
  },
  plugins: [
    // Cleans the dist folder before the build starts
    new CleanWebpackPlugin(),
    // Generate a base html file and injects all generated css and js files
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    // Multi threading babel loader configuration with caching for .js and .jsx files
    // see https://github.com/namics/webpack-config-plugins/tree/master/packages/js-config-webpack-plugin/config
    // new JsConfigWebpackPlugin(),
    new TsConfigWebpackPlugin(),
    // SCSS Configuration for .css .module.css and .scss .module.scss files
    // see https://github.com/namics/webpack-config-plugins/tree/master/packages/scss-config-webpack-plugin/config
    new ScssConfigWebpackPlugin(),
  ],
}
