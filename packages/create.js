#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const download = require('download-git-repo');
const ora = require('ora');
const {successLog, errorLog} = require('../utils/index');
const templateUrl = "jinxi1334640772/vue3-element-admin";

// 下载项目模板
function downloadTemplate(appName) {
  return new Promise((resolve, reject) => {
    const spinner = ora('开始生成项目');
    spinner.start();
    download(templateUrl, `./${appName}`, {clone: false}, err => {
      spinner.stop();
      if (err) {
        return reject(err);
      }
      successLog('项目生成成功');
      resolve();
    });
  });
}

// 修改项目package.json中的name
function editPackageName(appName) {
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.resolve(process.cwd(), `${appName}/package.json`);
    const packageJson = require(packageJsonPath);
    packageJson.name = appName;
    fs.writeFile(packageJsonPath, JSON.stringify(packageJson), (err) => {
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
    const spinner = ora('安装依赖包');
    spinner.start();
    child_process.exec('npm install', {cwd: appPath}, (err) => {
      spinner.stop();
      if (err) {
        return reject(err);
      }
      successLog('依赖包安装成功');
      console.log(`cd ${appName}`);
      console.log(`npm run start`);
      resolve();
    });
  });
}


async function create(appName) {
  try {
    await downloadTemplate(appName); // 下载模板文件
    await editPackageName(appName); // 修改项目package.json项目名
    await installPackages(appName); // 安装项目依赖
  } catch (err) {
    errorLog(err);
    process.exit(1);
  }
}

module.exports = create;