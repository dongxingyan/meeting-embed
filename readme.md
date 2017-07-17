# HTML5嵌入电信通页面


## 简述

项目初始化： `$ npm install`

调试： `$ npm start`后，浏览器打开`http://localhost:30001`

开发目录：

	app
	 |-entry.ts webpack构建入口
	 |-app.ts 应用程序入口，angularjs所依赖的所有第三方库需要在此声明依赖。同级的所有目录和文件中的angularjs模块需要在此声明依赖。
	 |-global.ts 全局设置的常量，服务器地址，版本号等等。
	 |-utils.ts 项目所依赖的所有第三方库需要在这里声明依赖。
	 |-index.html 主页面模板。
	 |-components/ 通用的组件
	 	|-nut-action-sheet
	 	|-nut-alert
	 	|-nut-msg
	 	|-nut-page 页面组件，包含一个标题头和一个action-sheet
	 |-common/ 通用的服务
		|-common.ts
		|-remote_resource.ts 远程访问相关的服务
		|-nativeApi.ts 原生API相关服务
		|-route_control.ts 路由控制服务
		|-models/ 声明了程序全局的各种数据对象的结构
			|-basic/
			|-business/
			|-models.ts 引入依赖
			|-session.ts 会话相关信息的存储（应用程序运行数据）
	|-pages/ 页面
	   |-pages.ts
	   |-invitation
	      |- ...
	   |-my_meeting_room
	  	  |- ...
	   |-recharge
	  	  |- ...

## 项目依赖

- 构建
	- webpack
	- less & stylus
	- babe & typescript
- 移动适配
	- lib-flexible
- web应用框架
	- angularjs
	- angualr-ui-router

## rules

1. app每个目录下与目录同名的`.ts`文件必须负责组织本级目录下的所有angular模块。（同级`.ts`文件中的模块，同级文件夹下的`文件夹名.ts`文件中的模块）
2. 每个模块的名字应该是本模块export出来的name字段。
3. page目录下，每个子目录对应一张或者一组互相有关联的页面。自己管理自己的路由声明。
4. 路由使用ui-router+component。

