# 🛤️ Runway

一個基於 Vue 3 和 D3.js 的互動式地圖視覺化應用。

## 📸 專案截圖

![World Map](https://via.placeholder.com/800x400?text=World+Map+Screenshot)

## ✨ 功能特色

### 地圖顯示

- **全屏響應式地圖**：使用 D3.js 繪製的麥卡托投影世界地圖
- **國家分類著色**：
  - 🔴 **台灣**：紅色標示（主要國家）
  - 🔵 **參展國家**：淺藍色標示（152個參展國家）
  - ⚪ **其他國家**：淺灰色標示
- **微型國家標記**：對於地圖上不易顯示的微型國家，使用圓圈標記
- **國家名稱提示**：滑鼠懸停時顯示國家名稱
- **視覺回饋**：懸停時國家顏色會變深

### 技術特點

- **Natural Earth 數據**：使用 Natural Earth 1:110m 解析度的國家邊界數據
- **限制顯示範圍**：北緯 80° 至南緯 60°，避免極地投影扭曲
- **自動適應**：地圖會隨瀏覽器窗口大小自動調整

## 🛠️ 技術架構

### 核心技術

- **Vue 3.2+** - 前端框架（使用 Composition API）
- **D3.js 7.8+** - 地圖繪製和資料視覺化
- **Pinia 2.1+** - 狀態管理
- **Bootstrap 5** - UI 樣式框架

### 專案結構

```
src/
├── assets/
│   └── css/              # 樣式文件
├── stores/
│   ├── dataStore.js      # 國家數據管理（參展國家列表、微型國家座標）
│   └── defineStore.js    # 配置存儲（保留供未來擴展）
├── tabs/
│   └── MapTab.vue        # 地圖組件（D3.js 地圖繪製邏輯）
├── views/
│   └── HomeView.vue      # 主頁面
├── router/
│   └── index.js          # 路由配置
├── App.vue               # 根組件
└── main.js               # 應用入口

public/
└── data/
    └── ne_110m_admin_0_countries.geojson  # Natural Earth 國家邊界數據
```

## 🚀 快速開始

### 環境要求

- Node.js 16.0+
- npm 7.0+ 或 yarn 1.22+

### 安裝與運行

1. **克隆專案**

   ```bash
   git clone https://github.com/kevin7261/runway.git
   cd runway
   ```

2. **安裝依賴**

   ```bash
   npm install
   ```

3. **啟動開發服務器**

   ```bash
   npm run serve
   ```

   瀏覽器訪問：`http://localhost:8080/runway/`

4. **構建生產版本**

   ```bash
   npm run build
   ```

5. **部署到 GitHub Pages**
   ```bash
   npm run deploy
   ```

## 📚 開發指南

### 添加/修改參展國家

編輯 `src/stores/dataStore.js` 中的 `visitedCountries` 陣列：

```javascript
const visitedCountries = ref([
  'Algeria', // 阿爾及利亞
  'Australia', // 澳大利亞
  'Japan', // 日本
  // ... 添加更多國家
]);
```

**注意**：國家名稱必須與 GeoJSON 數據中的 `properties.name`、`properties.ADMIN`
或 `properties.NAME` 欄位完全匹配。

### 添加微型國家座標

對於在低解析度地圖中不可見的微型國家，可以在 `src/stores/dataStore.js` 中的
`microStates` 陣列添加座標：

```javascript
const microStates = ref([
  { name: 'Singapore', coordinates: [103.8198, 1.3521] },
  { name: 'Monaco', coordinates: [7.4246, 43.7384] },
  // ... 格式：{ name: '國家名稱', coordinates: [經度, 緯度] }
]);
```

### 修改國家顏色

在 `src/tabs/MapTab.vue` 的 `drawWorldMap()` 函數中修改：

```javascript
.attr('fill', (d) => {
  const countryName = d.properties.name || d.properties.ADMIN || d.properties.NAME;
  if (dataStore.isHomeCountry(countryName)) return '#ff9999'; // 台灣：紅色
  if (dataStore.isCountryVisited(countryName)) return '#cce5ff'; // 參展：淺藍色
  return '#d0d0d0'; // 其他：淺灰色
})
```

### 調整地圖投影範圍

在 `src/tabs/MapTab.vue` 的 `createMap()` 函數中修改緯度限制：

```javascript
const northLatLimit = 80; // 北緯限制
const southLatLimit = -60; // 南緯限制
```

## 🎨 樣式自訂

主要樣式位於：

- `src/assets/css/common.css` - 通用樣式
- `src/assets/css/variables.css` - CSS 變數
- `src/tabs/MapTab.vue` - 地圖特定樣式（hover 效果等）

## 📊 數據來源

- **Natural Earth**: https://www.naturalearthdata.com/
  - 數據集：1:110m Cultural Vectors - Admin 0 Countries
  - 格式：GeoJSON
  - 授權：Public Domain

## 🌐 線上展示

- **GitHub Pages**: https://kevin7261.github.io/runway/
- **專案倉庫**: https://github.com/kevin7261/runway

## 📝 開發指令

```bash
# 啟動開發服務器
npm run serve

# 構建生產版本
npm run build

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format

# 部署到 GitHub Pages
npm run deploy
```

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款。

## 🙏 致謝

- [D3.js](https://d3js.org/) - 強大的資料視覺化庫
- [Natural Earth](https://www.naturalearthdata.com/) - 免費的地理數據
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 狀態管理
- [Bootstrap](https://getbootstrap.com/) - CSS 框架

---

**Runway** 🛤️ - 互動式地圖視覺化應用
