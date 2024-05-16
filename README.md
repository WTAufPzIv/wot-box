# 更新流程
1. 修改根目录和app目录下的packages.json文件中的version
2. 执行npm run build
3. 将根目录生成的dist文件夹复制进app文件夹中
4. 执行npm run build:electron
5. 上一步会在根目录生成release文件夹，进入文件夹将win-unpacked内的文件全部复制到electron安装包美化工具中的FilesToInstall文件夹中
6. 如有必要，修改美化工具中的配置（一般就是解压后的大小，所需硬盘空间）
7. 执行美化工具中的build-nim.bat
8. 将生成在output文件夹内的安装包复制到sha512文件夹内
9. 删除文件夹内的老yml文件
10. 运行start.bat，会生成新的yml文件。文件内的sha512已自动生成，但需要手动修改其中的size和发布更新的时间
11. 将安装包和yml文件放到静态托管服务器即可