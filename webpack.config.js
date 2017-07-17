let path = require('path');
let fs = require('fs');
let HtmlwebpackPlugin = require('html-webpack-plugin');
let merge = require('webpack-merge');
let webpack = require('webpack');
let ROOT_PATH = path.resolve(__dirname);
let APP_PATH = path.resolve(ROOT_PATH, 'app');
let BUILD_PATH = path.resolve(ROOT_PATH, 'build');
let TARGET = process.env.npm_lifecycle_event;
let PAGE_PATH = path.resolve(ROOT_PATH, 'app/page');
let MODULE_PATH = path.resolve(ROOT_PATH, 'app/module');
let exec = require('child_process').exec, child;
let OpenBrowserPlugin = require('open-browser-webpack-plugin');
let CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");


/**webpack配置 */
let configObj = {};
/**通用配置 */
let commonConfig = {
  entry: {
    'utils': path.resolve(__dirname, './app/utils'),
    'app': path.resolve(__dirname, './app/entry')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "[name].bundle.js",
  },
  externals: {
    "jquery": "jQuery"
  },
  module: {
    loaders: [
      { test: /\.(jpg|gif|png|woff|woff2|svg|eot|ttf)(\?v=.*)?$/, loader: 'url-loader?limit=500' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.html$/, loader: "html?minimize=false" },
      { test: /\.json$/, loader: "json" },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.styl$/, loader: "style!css!stylus" },
      { test: /\.ts$/, loader: 'babel-loader!ts-loader' }
    ]
  },

  //配置短路径引用
  resolve: {
    alias: {
      // module: path.resolve(APP_PATH, 'module'),
      // service: path.resolve(APP_PATH, "service"),
      // imgs: path.resolve(APP_PATH, "imgs"),
      // fonts: path.resolve(APP_PATH, "fonts"),
      // images: path.resolve(APP_PATH, "images"),
      // component: path.resolve(APP_PATH, "component"),
      // node_modules: path.resolve(ROOT_PATH, 'node_modules')
    },
    extensions: ['','.js','.ts', '.html', '.json', '.less', '.css','.styl', '.jpg', '.gif', '.png', '.woff', '.svg', '.eot', '.ttf']
  },

  plugins: [
    new CommonsChunkPlugin({ name: 'common', filename: '[hash].bundle.js' }),
    new HtmlwebpackPlugin({ title: 'Meeting Embed', filename: 'index.html', template: 'app/index' })
  ],
  // devtool: "source-map"
};
//webpack-dev-server 提供的是内存级别的server,不会生成build的文件夹
if (TARGET === 'start') {
  configObj = merge(commonConfig, {
    devServer: {
      hot: true,
      inline: true,
      progress: true,
      host: process.env.HOST,
      port: "30001"
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ]
  });
} else {
  //删除build目录
    child = exec('rd/s/q build', function (err, out) {
      console.log(out);
      if(err){
        child = exec('rm -rf build', function (err, out) {
          console.log(out); err && console.log(err);
        });
      }
    });

  configObj = merge(commonConfig, {
    output: {
      path: BUILD_PATH,
      filename: "js/[name][hash].js",
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({ minimize: true })
    ]
  });
}

module.exports = configObj;

