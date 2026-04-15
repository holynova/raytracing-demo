# 3D 光追材质 Demo

一个零依赖的 WebGL2 路径追踪示例，直接在浏览器中展示不同材质的典型 3D 场景。

## 场景内容

- 漫反射墙面与红色方块
- 金属球与拉丝金属台体
- 玻璃球折射与反射
- 发光顶灯
- 棋盘地面
- 逐帧累积采样降噪

## 运行方式

直接启动一个静态文件服务器，然后打开 `index.html`。

例如：

```bash
cd /Users/sym/code/raytracing-demo
python3 -m http.server 8080
```

然后访问 [http://localhost:8080](http://localhost:8080)。

## 交互

- 鼠标拖动：旋转视角
- 鼠标滚轮：缩放镜头

相机变化后会自动重置采样并重新累积。
