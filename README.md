# Meteora Earth

一个精致的实时 3D 地球气象监测小工具。界面采用清新柔和的磨砂玻璃风格，支持拖拽缩放地球、点击任意位置读取实时气象、城市搜索、近实时卫星影像、云层/风场动态图层与 Web Audio 交互音效。

## 数据源

- 实时天气与 48 小时逐小时预报：[Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- 城市地理编码：[Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- 近实时卫星真彩图层：[NASA GIBS WMS](https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/wms/)

## 本地运行

```powershell
python -m http.server 5173
```

然后打开 `http://127.0.0.1:5173/`。

## 部署

仓库是纯静态站点，可直接通过 GitHub Pages 部署根目录。
