// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});


const chalk = require("chalk");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const path = require("path");

const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls
} = require("../utils/WebpackDevServerUtils");
const config = require("../config/webpack.dev.config");
const createDevServerConfig = require("../config/webpack.server.config");
const package = require("../package.json");


const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
  console.log(
  chalk.cyan(
    `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
    )}`
  )
);
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
);
  console.log(
    `Learn more here: ${chalk.yellow("http://bit.ly/CRA-advanced-config")}`
);
  console.log();
}

choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return;
    }
    const protocol = process.env.HTTPS === "true" ? "https" : "http";
    // const appName = require(paths.appPackageJson).name;
    const urls = prepareUrls(protocol, HOST, port);

    // Load proxy config
    const proxySetting = package.proxy
    const proxyConfig = prepareProxy(proxySetting, path.join(__dirname, '../public'));
    // const proxyConfig = package.proxy

    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler(webpack, config);

    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    );
    const devServer = new WebpackDevServer(compiler, serverConfig);

    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err);
      }
      // if (isInteractive) {
      //   clearConsole();
      // }
      console.log(chalk.cyan("Starting the development server...\n"));
      console.log(urls.localUrlForBrowser)
      // openBrowser(urls.localUrlForBrowser);
    });
    // devServer.proxyRes( function (proxyRes, req, res) {
    //   console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    // });
    // console.log(devServer,'devServer')
    ["SIGINT", "SIGTERM"].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close();
        process.exit();
      });
    });
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });