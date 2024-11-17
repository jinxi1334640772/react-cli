#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const download = require("download-git-repo");
const ora = require("ora");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const { errorLog, successLog, underlineLog } = require("./utils");
const webpackConfig = require("./config/webpack.dev.config");
const webpackConfigProd = require("./config/webpack.prod.config");

// 执行prod命令：生产模式下打包构建
const prod = function prod() {
  webpack(webpackConfigProd, (err, stats) => {
    if (err) {
      errorLog(err);
      process.exit(1);
    }
    const compiler = webpack(webpackConfigProd);
    // 执行编译器run方法，开始项目打包构建
    compiler.run((err, stats) => {
      if (err) {
        errorLog(err);
        process.exit(1);
      }
      process.stdout.write(
        stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        })
      );

      if (stats.hasErrors()) {
        errorLog("  Build failed with errors.\n");
        process.exit(1);
      }
      successLog("Build completed.");
    });
  });
};

// 执行dev命令：启动服务器，进行本地开发
const dev = function dev() {
  const compiler = webpack(webpackConfig);
  // 启动开发服务器
  const server = new WebpackDevServer(compiler, {
    contentBase: webpackConfig.devServer.contentBase,
    publicPath: webpackConfig.devServer.publicPath,
  });
  server.listen(webpackConfig.devServer.port, err => {
    if (err) {
      errorLog(err);
      process.exit(1);
    }
    console.log(
      `\nApp is running: ${underlineLog(
        `http://localhost:${webpackConfig.devServer.port}/`
      )}`
    );
  });
};

// 下载项目模板
const templateUrl =
  "direct:https://gitee.com/myPrettyCode/vue3-element-admin.git";
function downloadTemplate(appName) {
  return new Promise((resolve, reject) => {
    const spinner = ora("开始生成项目");
    spinner.start();

    /** download(repository, destination, options, callback) clone远程仓库到本地目录
     * @repository 这是你要下载的Git仓库的URL。它可以是GitHub、GitLab或Bitbucket等平台上的仓库地址。其他仓库：direct:https://gitee.com/myPrettyCode/vue3-element-admin.git
     * @destination 这是你想要下载并解压仓库内容的目标目录路径
     * @options
     *    clone 默认为true，表示使用git clone命令来下载仓库。设置为false时，会使用git archive命令，这可能会更快，但不包括.git目录。
     *    depth 如果clone为true，可以设置depth选项以进行浅克隆，即只获取最近的几次提交。
     *    progress 如果设置为true，则在下载过程中显示进度条。
     *    recursive 如果为true，则下载子模块。
     * @callback 在下载过程结束后被调用
     */
    download(
      templateUrl,
      `./${appName}`,
      { clone: false, progress: true, recursive: true },
      err => {
        spinner.stop();
        if (err) {
          return reject(err);
        }
        successLog("项目生成成功");
        resolve();
      }
    );
  });
}

// 修改项目package.json中的name
function editPackageName(appName) {
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.resolve(
      process.cwd(),
      `${appName}/package.json`
    );
    const packageJson = require(packageJsonPath);
    packageJson.name = appName;
    fs.writeFile(packageJsonPath, JSON.stringify(packageJson), err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

// 下载依赖包
function installPackages(appName) {
  const appPath = path.resolve(process.cwd(), appName);
  return new Promise((resolve, reject) => {
    const spinner = ora("安装依赖包");
    spinner.start();
    // 使用child_process子进程，在新项目目录下执行，npm install命令
    child_process.exec("npm install", { cwd: appPath }, err => {
      spinner.stop();
      if (err) {
        return reject(err);
      }
      successLog("依赖包安装成功");
      console.log(`cd ${appName}`);
      console.log(`npm run start`);
      resolve();
    });
  });
}

const create = async function create(appName) {
  try {
    await downloadTemplate(appName); // 下载模板文件
    await editPackageName(appName); // 修改项目package.json项目名
    // await installPackages(appName); // 安装项目依赖
  } catch (err) {
    errorLog(err);
    process.exit(1);
  }
};

module.exports = {
  create,
  dev,
  prod,
};
