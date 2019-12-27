# project-management

该工程用于本地的项目管理。

## 主要功能

- 添加已有项目
- 添加新项目(目前只支持git项目)
- 打开项目  
  在原本的软件中新开一个窗口打开，目前只支持vscode。因为该功能是通过命令打开项目，所以需要配置vscode命令，使命令行支持code命令。
- 删除项目  
  目前会直接删除本地的项目，暂时未提供仅展示上的删除。

## 快速使用

运行服务  
`> npm run start`   
  
打包服务  
`> npm run pack`

## 项目依赖

### 数据存储

该项目是使用的`electron-store`库进行数据持久化的，查询存储位置可以在代码中添加`console.log(app.getPath("userData"))`查看数据存储位置。

### 页面渲染

该项目使用的是`react、antd`进行页面编写。

### 打包工具

使用的`electron-builder`打包工具。
