import path from "path";
import fs from "fs";
import { Configuration, DefinePlugin } from "webpack";
// import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __RPG_X2_DEVELOPMENT__ = process.env.NODE_ENV !== "production";
const __RPG_X2_PRODUCTION__ = !__RPG_X2_DEVELOPMENT__;

const packageJsonPath = path.join(process.cwd(), "package.json");
const rawPackageJson = fs.readFileSync(packageJsonPath).toString();
const PackageJson = JSON.parse(rawPackageJson);
const { version: __RPG_X2_VERSION__ } = PackageJson;

const nodeModulesPath = path.resolve(__dirname, "node_modules");
// const targets = __RPG_X2_DEVELOPMENT__ ? { chrome: "79", firefox: "72" } : "> 0.25%, not dead";
const targets = { chrome: "80" };

const config: Configuration = {
  mode: __RPG_X2_DEVELOPMENT__ ? "development" : "production",
  devtool: __RPG_X2_DEVELOPMENT__ ? "inline-source-map" : false,
  entry: ["./src/index"],
  output: {
    path: path.join(__dirname, "dist", "statics"),
    filename: __RPG_X2_DEVELOPMENT__ ? "[name].bundle.js" : "[name].[contenthash].js",
    chunkFilename: __RPG_X2_DEVELOPMENT__ ? "[name].chunk.js" : "[name].[contenthash].chunk.js",
    publicPath: __RPG_X2_DEVELOPMENT__ ? "/" : "/statics/",
  },
  resolve: {
    // alias: { // doesnt work ?!?!
    //   JestHelpers: path.resolve(path.join(__dirname, "src", "tests", "jestHelpers")),
    // },
    extensions: [".js", ".ts", ".tsx"],
    fallback: {
      // util: require.resolve("util/"),
      // buffer: require.resolve("buffer/"),
    },
  },
  optimization: {
    minimize: __RPG_X2_PRODUCTION__,
    splitChunks: {
      cacheGroups: {
        vendors: { test: /[\\/]node_modules[\\/]/, name: "vendors", chunks: "all", priority: 10 },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/, nodeModulesPath],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/env", { modules: false, targets }],
              "@babel/react",
              "@babel/typescript",
            ],
            plugins: [
              "@babel/proposal-numeric-separator",
              "@babel/plugin-transform-runtime",
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              "@babel/plugin-proposal-object-rest-spread",
            ],
          },
        },
      },
      { test: /\.m?js/, resolve: { fullySpecified: false } },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1, modules: true, sourceMap: __RPG_X2_DEVELOPMENT__ },
          },
          { loader: "postcss-loader", options: { sourceMap: __RPG_X2_DEVELOPMENT__ } },
        ],
      },
      // {
      //   test: /.jpe?g$|.gif$|.png$|.svg$|.woff$|.woff2$|.ttf$|.eot$/,
      //   use: "url-loader?limit=10000",
      // },
    ],
  },
  // @ts-ignore
  devServer: {
    port: 8085, //WEBPACK_PORT
    overlay: __RPG_X2_DEVELOPMENT__,
    open: __RPG_X2_DEVELOPMENT__,
    contentBase: path.join(__dirname, "public"),
    openPage: `http://localhost:${8085}/`,
    publicPath: "/",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{ from: "public" }]),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].chunk.css",
    }),
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, "public/index.html") }),
    new DefinePlugin({
      __RPG_X2_DEVELOPMENT__: JSON.stringify(__RPG_X2_DEVELOPMENT__),
      __RPG_X2_PRODUCTION__: JSON.stringify(__RPG_X2_PRODUCTION__),
      __RPG_X2_VERSION__: JSON.stringify(__RPG_X2_VERSION__),
    }),
  ],
};

export default config;
