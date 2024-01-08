#!/usr/bin/env node

const program = require('commander');
const version = require('../package').version;
// 用来显示命令版本
program.version(version)
  .usage(`<command> [options] 脚手架版本为： ${version}，通过此文件注册二级命令，一级命令在package.json的bin中注册！！！`);

// 注册create命令
program.command('create <这里输入想要的项目名称>')
  .description('这是命令description：显示在控制台，用于描述命令。<>里代表变量，不能省略。命令其实就是要执行的函数！！！')
  .action((name) => {
    // 执行zhangjinxi create <app-name> 命令时，会执行此action
    require("../packages/create")(name);
  });

// 注册dev命令
program.command('dev')
  .description('Start app development.启动开发服务器，进行本地开发')
  .action(() => {
    require('../packages/dev')();
  });

// 注册build命令
program.command('build')
  .description('Build app bundle.生产环境打包')
  .action(() => {
    require('../packages/prod')();
  });

program.parse(process.argv);  