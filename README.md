# Meteora Earth Pro

Meteora Earth Pro 是一个苹果风的实时 3D 地球气象监测台，面向浏览器和 GitHub Pages 直接部署。它支持精准城市定位、3D 地球点选、近实时卫星图层、实时天气、空气质量、风险分析、收藏、最近站点、对比、分享和报告复制。

## 核心升级

- 精准定位：内置中国重点城市权威坐标，优先修正同名地点误判，例如“中国南京”会定位到江苏省南京市。
- 多源地理编码：内置城市库、OpenStreetMap Nominatim、Open-Meteo Geocoding 分级兜底，并显示置信度和来源。
- 经纬度映射校准：修复 3D 地球纹理经度偏移，点选和城市定位保持一致。
- Apple Glass UI：全新磨砂玻璃商业化界面、主题切换、细腻动效和响应式布局。
- 20+ 功能：AQI、UV、能见度、日出日落、7 日预报、24/48 小时趋势、温度/降水/风/气压图表、收藏、最近、对比、分享链接、复制报告、自动刷新、卫星日期、渲染质量、单位切换、全屏、定位、风险贡献、站点图钉等。
- 星球细节增强：地形光纹、经纬网、极光带、轨道弧线、风暴单元、洋流线、昼夜分界线和悬停经纬度 HUD。
- 新增智能功能：舒适度、露点、热压力、风寒、6 小时雨峰、气压趋势、月相、黄金时段、日照时长、PM2.5、PM10、臭氧、NO₂、风暴提醒、出行分、地球快照和电影巡航。

## 数据源

- 实时天气和预报：[Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- 空气质量：[Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
- 地理编码兜底：[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)
- 近实时卫星真彩图层：[NASA GIBS WMS](https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/wms/)

## 本地运行

```powershell
python -m http.server 5173
```

然后打开 `http://127.0.0.1:5173/`。

## 部署

仓库包含 GitHub Pages Actions 工作流，推送到 `main` 后会自动部署到：

`https://salvatorebgg.github.io/tech-bgg/`
