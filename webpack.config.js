var path = require("path");
const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css']
  },
  entry: {
    popup: [path.join(__dirname, 'src/popup')],
    options: [path.join(__dirname, 'src/options')],
    content_script: [path.join(__dirname, 'src/content_script')],
    background_script: [path.join(__dirname, 'src/background_script')],
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/i,
        use: ['style-loader','css-loader'],
      }
    ]
  }
};
