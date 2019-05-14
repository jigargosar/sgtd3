const CleanWebpackPlugin = require('clean-webpack-plugin')
const CommonConfigWebpackPlugin = require('common-config-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.jsx',
  devtool: 'source-map',
  plugins: [
    // Cleans the dist folder before the build starts
    new CleanWebpackPlugin(),
    // Multi threading babel loader configuration with caching for .js and .jsx files
    // Multi threading typescript loader configuration with caching for .ts and .tsx files
    // SCSS Configuration for .css .module.css and .scss .module.scss files
    // File loader configuration for .woff and .woff2 files
    // File loader configuration for .gif .jpg .jpeg .png and .svg files
    // https://github.com/namics/webpack-config-plugins/
    new CommonConfigWebpackPlugin(),
    // Generate a base html file and injects all generated css and js files
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
  ],
}
