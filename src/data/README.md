# 📁 數據文件夾說明 (Data Directory Documentation)

這個文件夾目前是空的，主要用於放置源代碼相關的數據文件。實際的地理數據位於
`public/data/` 目錄。

## 📂 目錄結構說明

### 當前項目的數據組織

```
project-root/
│
├── public/data/                 # ✅ 實際數據文件位置（公開可訪問）
│   ├── geojson/                 # GeoJSON 地理數據
│   │   ├── gis_osm_places_a_free_1.geojson       # 地點多邊形
│   │   ├── gis_osm_places_a_free_1.qmd           # QGIS 元數據
│   │   ├── gis_osm_roads_free_1.geojson          # 道路網絡
│   │   ├── gis_osm_roads_free_1.qmd              # QGIS 元數據
│   │   ├── gis_osm_transport_a_free_1.geojson    # 交通設施
│   │   ├── gis_osm_transport_a_free_1.qmd        # QGIS 元數據
│   │   ├── gis_osm_water_a_free_1.geojson        # 水域數據
│   │   └── gis_osm_water_a_free_1.qmd            # QGIS 元數據
│   └── README.md                # 數據說明文檔
│
└── src/data/                    # ⚪ 預留位置（當前空）
    └── README.md                # 本文件
```

## 🗺️ GeoJSON 數據集說明

### 1. 地點數據 (Places)

**文件名**: `gis_osm_places_a_free_1.geojson`

**內容描述**:

- 包含行政區劃、城市、城鎮、村莊等地點信息
- 幾何類型: `Polygon`, `MultiPolygon`
- 用途: 作為底層背景圖層

**數據屬性**:

```javascript
{
  "name": "地點名稱",
  "fclass": "功能分類",
  // 示例: "city", "town", "village", "hamlet", "suburb"
  "population": "人口數量（如有）"
}
```

**視覺化樣式**:

- 填充色: 諾魯深藍 `#002B7F`
- 邊框色: 金黃色 `#FFC61E`
- 透明度: 0.9
- 圖層順序: 最底層

### 2. 水域數據 (Water)

**文件名**: `gis_osm_water_a_free_1.geojson`

**內容描述**:

- 包含湖泊、河流、水庫、海洋等水體
- 幾何類型: `Polygon`, `MultiPolygon`
- 用途: 展示水文系統

**數據屬性**:

```javascript
{
  "name": "水體名稱",
  "fclass": "水體類型",
  // 示例: "lake", "river", "reservoir", "water"
}
```

**視覺化樣式**:

- 填充色: 深藍色 `#001b4d`
- 邊框色: 諾魯藍 `#002B7F`
- 透明度: 0.8
- 圖層順序: 第二層

### 3. 道路數據 (Roads)

**文件名**: `gis_osm_roads_free_1.geojson`

**內容描述**:

- 包含各級道路網絡
- 幾何類型: `LineString`, `MultiLineString`
- 用途: 展示交通網絡

**數據屬性**:

```javascript
{
  "name": "道路名稱",
  "fclass": "道路類型",
  // 示例: "motorway", "primary", "secondary", "tertiary", "residential"
  "oneway": "是否單行道"
}
```

**視覺化樣式**:

- 線條色: 金黃色 `#FFC61E`
- 線寬: 1.5px
- 透明度: 0.7
- 圖層順序: 第三層

### 4. 交通設施數據 (Transport)

**文件名**: `gis_osm_transport_a_free_1.geojson`

**內容描述**:

- 包含機場、港口、火車站等交通設施
- 幾何類型: `Polygon`, `Point`
- 用途: 標示主要交通樞紐

**數據屬性**:

```javascript
{
  "name": "設施名稱",
  "fclass": "設施類型",
  // 示例: "airport", "helipad", "station", "port"
}
```

**視覺化樣式**:

- 填充色: 白色 `#FFFFFF`
- 邊框色: 金黃色 `#FFC61E`
- 透明度: 0.7
- 圖層順序: 最上層

## 💾 數據載入方式

### Vue 組件中載入數據

本項目使用 `fetch` API 動態載入 GeoJSON 數據：

```javascript
// src/tabs/MapTab.vue 中的實現
const loadAllData = async () => {
  try {
    // 並行載入所有 GeoJSON 文件
    const [placesResponse, roadsResponse, transportResponse, waterResponse] =
      await Promise.all([
        fetch(
          `${process.env.BASE_URL}data/geojson/gis_osm_places_a_free_1.geojson`
        ),
        fetch(
          `${process.env.BASE_URL}data/geojson/gis_osm_roads_free_1.geojson`
        ),
        fetch(
          `${process.env.BASE_URL}data/geojson/gis_osm_transport_a_free_1.geojson`
        ),
        fetch(
          `${process.env.BASE_URL}data/geojson/gis_osm_water_a_free_1.geojson`
        ),
      ]);

    // 檢查響應狀態
    if (!placesResponse.ok) throw new Error('地點數據載入失敗');
    // ... 其他檢查

    // 並行解析 JSON
    [placesData.value, roadsData.value, transportData.value, waterData.value] =
      await Promise.all([
        placesResponse.json(),
        roadsResponse.json(),
        transportResponse.json(),
        waterResponse.json(),
      ]);

    return true;
  } catch (error) {
    console.error('OSM 數據載入失敗:', error);
    return false;
  }
};
```

### 為什麼使用 `public/` 目錄？

1. **直接訪問**: `public/` 中的文件會被直接複製到構建輸出，可通過 URL 訪問
2. **大文件友好**: GeoJSON 文件通常較大，不適合打包進 bundle
3. **動態載入**: 可在需要時才載入，優化初始載入速度
4. **緩存控制**: 瀏覽器可有效緩存這些靜態資源

## 📊 GeoJSON 格式說明

### 標準 GeoJSON 結構

```json
{
  "type": "FeatureCollection",
  "name": "圖層名稱",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "特徵名稱",
        "fclass": "功能分類",
        "custom_field": "自定義屬性"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [經度1, 緯度1],
            [經度2, 緯度2],
            [經度3, 緯度3],
            [經度1, 緯度1]
          ]
        ]
      }
    }
  ]
}
```

### 幾何類型

| 類型              | 說明     | 用途         | 座標格式                                |
| ----------------- | -------- | ------------ | --------------------------------------- |
| `Point`           | 點       | 標記位置     | `[經度, 緯度]`                          |
| `LineString`      | 線       | 道路、河流   | `[[經度1, 緯度1], [經度2, 緯度2], ...]` |
| `Polygon`         | 多邊形   | 行政區、建築 | `[[[外環座標]], [[內環座標]]]`          |
| `MultiPoint`      | 多點     | 點群         | `[[經度1, 緯度1], [經度2, 緯度2]]`      |
| `MultiLineString` | 多線     | 複雜道路網   | `[[[線1]], [[線2]]]`                    |
| `MultiPolygon`    | 多多邊形 | 群島         | `[[[[多邊形1]]], [[[多邊形2]]]]`        |

## 🔧 數據處理工具

### 推薦工具

1. **[QGIS](https://qgis.org/)** - 開源 GIS 軟件

   - 查看和編輯 GeoJSON
   - 轉換不同地理格式
   - 簡化幾何圖形

2. **[geojson.io](https://geojson.io/)** - 在線 GeoJSON 編輯器

   - 視覺化編輯 GeoJSON
   - 驗證格式正確性
   - 快速創建小型數據集

3. **[mapshaper](https://mapshaper.org/)** - 在線地理數據處理

   - 簡化複雜幾何（減少文件大小）
   - 格式轉換（Shapefile ↔ GeoJSON）
   - 修復拓撲錯誤

4. **[Turf.js](https://turfjs.org/)** - JavaScript 地理空間分析庫
   - 在代碼中處理 GeoJSON
   - 計算面積、距離、緩衝區等
   - 空間查詢和分析

### 數據簡化示例

```javascript
// 使用 Turf.js 簡化幾何
import * as turf from '@turf/turf';

const simplifyGeoJSON = (geojson, tolerance = 0.01) => {
  return turf.simplify(geojson, {
    tolerance: tolerance,
    highQuality: false,
  });
};

// 使用
const simplifiedData = simplifyGeoJSON(complexGeoJSON, 0.001);
```

## 📏 坐標系統

### WGS 84 (EPSG:4326)

本項目使用的所有 GeoJSON 數據採用 **WGS 84** 坐標系統（地理坐標系統）。

**特點**:

- 最常用的地理坐標系統
- GPS 使用的標準
- 經緯度表示：`[經度, 緯度]`
- 經度範圍：-180° 到 180°
- 緯度範圍：-90° 到 90°

**重要提醒**:

- ⚠️ GeoJSON 中坐標順序是 **[經度, 緯度]**，不是 [緯度, 經度]
- ⚠️ 與 Leaflet 的 `LatLng` 順序相反

```javascript
// GeoJSON 格式
{
  "coordinates": [121.5654, 25.033]  // [經度, 緯度]
}

// Leaflet 格式
L.latLng(25.033, 121.5654);  // (緯度, 經度)
```

## 🎯 數據使用最佳實踐

### 1. 性能優化

```javascript
// ✅ 好的做法：並行載入
const loadData = async () => {
  const [data1, data2] = await Promise.all([
    fetch('data1.geojson').then((r) => r.json()),
    fetch('data2.geojson').then((r) => r.json()),
  ]);
};

// ❌ 不好的做法：串行載入
const loadData = async () => {
  const data1 = await fetch('data1.geojson').then((r) => r.json());
  const data2 = await fetch('data2.geojson').then((r) => r.json());
};
```

### 2. 錯誤處理

```javascript
// ✅ 好的做法：完整的錯誤處理
const loadData = async () => {
  try {
    const response = await fetch('data.geojson');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 驗證數據結構
    if (!data.type || data.type !== 'FeatureCollection') {
      throw new Error('Invalid GeoJSON format');
    }

    return data;
  } catch (error) {
    console.error('數據載入失敗:', error);
    // 顯示用戶友好的錯誤消息
    return null;
  }
};
```

### 3. 數據驗證

```javascript
// 驗證 GeoJSON 格式
const validateGeoJSON = (data) => {
  if (!data) return false;

  // 檢查基本結構
  if (data.type !== 'FeatureCollection') return false;
  if (!Array.isArray(data.features)) return false;

  // 檢查特徵
  return data.features.every((feature) => {
    return (
      feature.type === 'Feature' &&
      feature.geometry &&
      feature.geometry.type &&
      feature.geometry.coordinates
    );
  });
};
```

### 4. 內存管理

```javascript
// 大型 GeoJSON 的處理
const processLargeGeoJSON = (data) => {
  // 分批處理特徵
  const batchSize = 1000;
  const features = data.features;

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize);
    processBatch(batch);
  }
};
```

## 🔍 數據來源與授權

### OpenStreetMap

**來源**: [OpenStreetMap](https://www.openstreetmap.org/)

**授權**:
[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)

**使用條款**:

- ✅ 自由使用、修改、分發
- ✅ 商業使用允許
- ⚠️ 必須註明「© OpenStreetMap contributors」
- ⚠️ 衍生作品必須使用相同授權

**歸屬示例**:

```html
<!-- HTML -->
<div>
  Map data ©
  <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
  contributors
</div>
```

```javascript
// JavaScript
const attribution = '© OpenStreetMap contributors';
```

## 📦 添加新數據文件

### 步驟

1. **準備數據文件**

   - 確保是有效的 GeoJSON 格式
   - 使用 UTF-8 編碼
   - 建議簡化複雜幾何以減小文件大小

2. **放置文件**

   ```bash
   # 放到 public/data/ 目錄
   cp your-data.geojson public/data/geojson/
   ```

3. **在組件中引用**

   ```javascript
   const response = await fetch(
     `${process.env.BASE_URL}data/geojson/your-data.geojson`
   );
   const data = await response.json();
   ```

4. **創建圖層**
   ```javascript
   const layer = L.geoJSON(data, {
     style: {
       fillColor: '#color',
       color: '#border-color',
       weight: 1,
     },
   }).addTo(map);
   ```

## 📚 參考資源

### 文檔

- [GeoJSON 規範](https://geojson.org/)
- [Leaflet 文檔](https://leafletjs.com/reference.html)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [Turf.js 文檔](https://turfjs.org/docs/)

### 教程

- [GeoJSON 完整指南](https://macwright.com/2015/03/23/geojson-second-bite.html)
- [Leaflet GeoJSON 教程](https://leafletjs.com/examples/geojson/)
- [OSM 數據提取指南](https://wiki.openstreetmap.org/wiki/Downloading_data)

### 工具

- [geojsonlint](https://geojsonlint.com/) - GeoJSON 驗證
- [GeoJSON Path Finder](https://www.liedman.net/geojson-path-finder/) - 路徑查找
- [simplestyle-spec](https://github.com/mapbox/simplestyle-spec) -
  GeoJSON 樣式規範

## ⚠️ 注意事項

### 文件大小

- 單個 GeoJSON 文件建議不超過 **10 MB**
- 超大文件考慮：
  1. 使用 mapshaper 簡化幾何
  2. 分割成多個小文件
  3. 使用向量瓦片（Vector Tiles）
  4. 服務端提供 API

### 瀏覽器兼容性

```javascript
// 檢查 fetch API 支持
if (!window.fetch) {
  console.error('瀏覽器不支持 fetch API');
  // 使用 polyfill 或 XMLHttpRequest
}
```

### 緩存策略

```javascript
// 使用緩存避免重複載入
const cache = new Map();

const loadWithCache = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);

  return data;
};
```

## 💡 未來擴展建議

### 可能的數據添加

- 建築物輪廓數據
- POI（興趣點）數據
- 土地使用分類數據
- 高程數據（DEM）
- 人口密度數據

### 技術改進

- 實現數據懶加載
- 添加搜索功能
- 支持數據過濾
- 實現圖層控制器
- 添加數據導出功能

---

## 📞 需要幫助？

如有數據相關問題，請查看：

- 主 [README.md](../../README.md)
- [GitHub Issues](https://github.com/kevin7261/30DayMapChallenge-14_Data-challenge-OpenStreetMap/issues)
- [OpenStreetMap 社群](https://www.openstreetmap.org/help)

---

**最後更新**: 2024 **維護者**: Kevin Cheng (@kevin7261)
