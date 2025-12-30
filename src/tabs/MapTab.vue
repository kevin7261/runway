<script>
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * 🗺️ MapTab.vue - D3.js 跑道地圖組件
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * @fileoverview
   * 這是一個基於 D3.js 的地圖視覺化組件，顯示跑道線路數據。
   * 本組件負責載入、處理和渲染跑道 GeoJSON 數據。
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 📋 核心功能
   * ─────────────────────────────────────────────────────────────────────────
   * 1. 跑道線路渲染：
   *    ✓ 載入 runway.geojson
   *    ✓ 繪製所有跑道線路
   *
   * 2. 視覺元素：
   *    ✓ 跑道線路：線條繪製
   *    ✓ 白色地圖背景
   *
   * 3. 交互功能：
   *    ✓ 滾輪縮放控制
   *    ✓ 拖動平移導航
   *    ✓ 滑鼠懸停顯示資訊
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🎨 配色主題
   * ─────────────────────────────────────────────────────────────────────────
   * 白色      #ffffff  → 地圖背景
   * 跑道線路  #333333  → 深灰色線條
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🛠️ 技術棧
   * ─────────────────────────────────────────────────────────────────────────
   * @requires vue                 - Vue 3.2+ (Composition API)
   * @requires d3                  - D3.js 7.8+ (地圖繪製庫)
   * @requires @/stores/dataStore  - Pinia 狀態管理
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 📁 數據來源
   * ─────────────────────────────────────────────────────────────────────────
   * 跑道線路：runway.geojson
   * 路徑：public/data/geojson/
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🔧 使用方式
   * ─────────────────────────────────────────────────────────────────────────
   * <MapTab @map-ready="handleMapReady" />
   *
   * @event map-ready - 地圖初始化完成時觸發，返回地圖實例
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 📝 維護者
   * ─────────────────────────────────────────────────────────────────────────
   * @author Kevin Cheng
   * @version 5.0.0
   * @since 2024
   * @license MIT
   *
   * ═══════════════════════════════════════════════════════════════════════════
   */

  // ═══════════════════════════════════════════════════════════════════════════
  // 📦 依賴導入 (Dependencies Import)
  // ═══════════════════════════════════════════════════════════════════════════

  // Vue 3 核心功能
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  // D3.js 地圖庫
  import * as d3 from 'd3';

  // Pinia 狀態管理
  import { useDataStore } from '@/stores/dataStore';

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 組件定義 (Component Definition)
  // ═══════════════════════════════════════════════════════════════════════════

  export default {
    name: 'MapTab',

    // 組件觸發的事件
    emits: [
      'map-ready', // 地圖初始化完成時觸發，傳遞地圖實例
    ],

    /**
     * ───────────────────────────────────────────────────────────────────────
     * 🎬 組件設置函數 (Component Setup Function)
     * ───────────────────────────────────────────────────────────────────────
     * 使用 Vue 3 Composition API 設置組件邏輯
     *
     * @param {Object} _ - Props（本組件不使用）
     * @param {Object} context - 設置上下文
     * @param {Function} context.emit - 事件觸發函數
     * @returns {Object} 返回模板可用的響應式數據和方法
     */
    setup(_, { emit }) {
      // ═══════════════════════════════════════════════════════════════════════
      // 📦 狀態管理與依賴 (State Management & Dependencies)
      // ═══════════════════════════════════════════════════════════════════════

      // Pinia 數據存儲（保留供未來擴展使用）
      // eslint-disable-next-line no-unused-vars
      const dataStore = useDataStore();

      // ═══════════════════════════════════════════════════════════════════════
      // 🗺️ 地圖相關變數 (Map-Related Variables)
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * 地圖 DOM 容器引用
       * @type {Ref<HTMLElement|null>}
       */
      const mapContainer = ref(null);

      /**
       * D3.js SVG 元素
       * @type {d3.Selection|null}
       */
      let svg = null;

      /**
       * D3.js 投影函數
       * @type {d3.GeoProjection|null}
       */
      let projection = null;

      /**
       * D3.js 路徑生成器
       * @type {d3.GeoPath|null}
       */
      let path = null;

      /**
       * D3.js 縮放行為
       * @type {d3.ZoomBehavior|null}
       */
      let zoom = null;

      /**
       * SVG 主容器組
       * @type {d3.Selection|null}
       */
      let g = null;

      /**
       * 工具提示元素
       * @type {HTMLElement|null}
       */
      let tooltip = null;

      // ═══════════════════════════════════════════════════════════════════════
      // 🎛️ 控制狀態 (Control States)
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * 地圖就緒狀態標記
       * true = 地圖已初始化完成，false = 尚未初始化
       * @type {Ref<boolean>}
       */
      const isMapReady = ref(false);

      /**
       * 地圖容器唯一 ID
       * 使用隨機字符串確保多實例時不會衝突
       * @type {Ref<string>}
       */
      const mapContainerId = ref(`leaflet-map-${Math.random().toString(36).substr(2, 9)}`);

      /**
       * 顯示模式
       * 'map' = 使用地圖投影顯示（目前結果）
       * 'grid' = 直接使用 grid_x, grid_y 繪製網格
       * @type {Ref<string>}
       */
      const displayMode = ref('map');

      // ═══════════════════════════════════════════════════════════════════════
      // 📊 GeoJSON 數據儲存 (GeoJSON Data Storage)
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * 跑道 GeoJSON 數據
       * 來源：runway.geojson
       * @type {Ref<Object|null>}
       */
      const runwayData = ref(null);

      /**
       * 🔧 延伸線段 5 倍長度
       * @param {Array} coordinates - LineString 座標陣列
       * @returns {Array} 延伸後的座標陣列
       */
      const extendLineString = (coordinates) => {
        if (!coordinates || coordinates.length < 2) {
          return coordinates;
        }

        // 取第一個點和最後一個點
        const startPoint = coordinates[0];
        const endPoint = coordinates[coordinates.length - 1];

        // 計算方向向量（經度差和緯度差）
        const dx = endPoint[0] - startPoint[0];
        const dy = endPoint[1] - startPoint[1];

        // 計算原線段長度（使用歐幾里得距離）
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
          return coordinates; // 如果線段長度為0，直接返回
        }

        // 正規化方向向量
        const unitDx = dx / length;
        const unitDy = dy / length;

        // 延伸倍數
        const extendFactor = 5;

        // 計算延伸距離（原長度的5倍）
        const extendDistance = length * extendFactor;

        // 從起點沿反方向延伸
        const newStartPoint = [
          startPoint[0] - unitDx * extendDistance,
          startPoint[1] - unitDy * extendDistance,
        ];

        // 從終點沿正方向延伸
        const newEndPoint = [
          endPoint[0] + unitDx * extendDistance,
          endPoint[1] + unitDy * extendDistance,
        ];

        // 返回延伸後的座標陣列
        return [newStartPoint, newEndPoint];
      };

      /**
       * 📥 載入跑道線路 GeoJSON 數據
       */
      const loadRunwayData = async () => {
        try {
          console.log('[MapTab] 開始載入跑道線路 GeoJSON 數據...');

          // 載入跑道 GeoJSON 檔案
          const runwayResponse = await fetch(
            `${process.env.BASE_URL}data/geojson/runway.geojson`
          );

          // 檢查響應
          if (!runwayResponse.ok) {
            throw new Error(`跑道線路數據載入失敗: HTTP ${runwayResponse.status}`);
          }

          // 解析 JSON
          const rawData = await runwayResponse.json();

          // 延伸每條線段 5 倍，並保存原始座標
          if (rawData.features) {
            rawData.features.forEach((feature) => {
              if (feature.geometry && feature.geometry.type === 'LineString') {
                // 保存原始座標到 properties
                const originalCoords = JSON.parse(
                  JSON.stringify(feature.geometry.coordinates)
                );
                if (!feature.properties) {
                  feature.properties = {};
                }
                feature.properties.originalCoordinates = originalCoords;

                // 延伸線段
                feature.geometry.coordinates = extendLineString(
                  feature.geometry.coordinates
                );
              }
            });
          }

          runwayData.value = rawData;

          console.log('[MapTab] 跑道線路數據載入成功');
          console.log('  - 線路數量:', runwayData.value.features?.length || 0);
          console.log('  - 已將每條線延伸 5 倍長度');

          return true;
        } catch (error) {
          console.error('[MapTab] 跑道線路數據載入失敗:', error);
          return false;
        }
      };

      /**
       * 🛠️ 創建工具提示元素
       */
      const createTooltip = () => {
        if (!mapContainer.value) return;

        // 移除已存在的工具提示
        const existingTooltip = mapContainer.value.querySelector('.map-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }

        // 創建新的工具提示元素
        tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.padding = '4px 8px';

        mapContainer.value.appendChild(tooltip);
        console.log('[MapTab] 工具提示元素創建成功');
      };

      /**
       * 📐 自動調整地圖視圖以顯示所有物件
       */
      const fitMapToFeatures = () => {
        if (!projection || !runwayData.value || !svg) {
          console.warn('[MapTab] 無法調整視圖：缺少必要的組件');
          return;
        }

        try {
          const width = +svg.attr('width');
          const height = +svg.attr('height');

          // 使用 D3 的 fitExtent 自動調整投影
          // 添加 10% 的邊距
          const padding = Math.min(width, height) * 0.1;

          // 使用 fitExtent 方法自動調整投影以適應所有特徵
          projection.fitExtent(
            [
              [padding, padding],
              [width - padding, height - padding],
            ],
            runwayData.value
          );

          // 更新路徑生成器
          path = d3.geoPath().projection(projection);

          // 重新繪製延伸的路徑
          g.selectAll('.runway-extended').attr('d', path);

          // 重新繪製原始長度的路徑（黃色）
          g.selectAll('.runway-original').attr('d', (d) => {
            const originalFeature = {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: d.properties.originalCoordinates,
              },
            };
            return path(originalFeature);
          });

          console.log('[MapTab] 地圖視圖已調整以顯示所有物件');
          console.log('  - 視圖尺寸:', width, 'x', height);
          console.log('  - 邊距:', padding);
        } catch (error) {
          console.error('[MapTab] 調整視圖失敗:', error);
        }
      };

      /**
       * 🗺️ 繪製跑道線路
       */
      const drawRunway = () => {
        if (!g || !runwayData.value) {
          console.error(
            '[MapTab] 無法繪製跑道線路: g=',
            !!g,
            'runwayData=',
            !!runwayData.value
          );
          return;
        }

        try {
          console.log('[MapTab] 開始繪製跑道線路 GeoJSON');

          // 先繪製延伸後的跑道線路（灰色，底層）
          g.selectAll('.runway-extended')
            .data(runwayData.value.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'runway-extended')
            .attr('fill', 'none')
            .attr('stroke', '#333333')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.8);

          // 再繪製原始長度的跑道線路（黃色，最上層）
          g.selectAll('.runway-original')
            .data(
              runwayData.value.features.filter(
                (f) => f.properties?.originalCoordinates
              )
            )
            .enter()
            .append('path')
            .attr('d', (d) => {
              // 使用原始座標創建臨時的 GeoJSON 特徵
              const originalFeature = {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: d.properties.originalCoordinates,
                },
              };
              return path(originalFeature);
            })
            .attr('class', 'runway-original')
            .attr('fill', 'none')
            .attr('stroke', '#FFD700')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1.0)
            .on('mouseover', function (event, d) {
              // 顯示工具提示
              const properties = d.properties || {};
              const id = properties.id || 'N/A';

              const tooltipContent = `
                <div style="font-weight: bold;">跑道線路（原始長度）</div>
                <div>ID: ${id}</div>
              `;

              tooltip.innerHTML = tooltipContent;
              tooltip.style.opacity = '1';
            })
            .on('mousemove', function (event) {
              // 更新工具提示位置
              tooltip.style.left = event.pageX + 10 + 'px';
              tooltip.style.top = event.pageY - 10 + 'px';
            })
            .on('mouseout', function () {
              // 隱藏工具提示
              tooltip.style.opacity = '0';
            });

          console.log('[MapTab] 跑道線路 GeoJSON 繪製完成');

          // 繪製完成後自動調整視圖
          setTimeout(() => {
            fitMapToFeatures();
          }, 100);
        } catch (error) {
          console.error('[MapTab] 跑道線路 GeoJSON 繪製失敗:', error);
        }
      };

      /**
       * 🎛️ 切換顯示模式
       * @param {string} mode - 'map' 或 'grid'
       */
      const toggleDisplayMode = async () => {
        // 僅保留地圖模式
        displayMode.value = 'map';
        console.log('[MapTab] 切換顯示模式: map (grid 已停用)');

        if (displayMode.value === 'map') {
          // 地圖模式：需要地圖投影，載入跑道線路
          if (!runwayData.value) {
            await loadRunwayData();
          }
          // 清除舊的 SVG（如果從其他模式切換過來）
          if (svg && !projection) {
            svg.remove();
            svg = null;
          }

          if (!projection || !path) {
            // 如果還沒有創建地圖，先創建
            const rect = mapContainer.value.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const width = rect.width;
              const height = rect.height;

              // 清除舊的 SVG
              if (svg) {
                svg.remove();
              }

              // 創建 SVG 和地圖投影
              svg = d3
                .select(mapContainer.value)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', '#ffffff');

              projection = d3
                .geoMercator()
                .center([121, 23.5])
                .scale(12000)
                .translate([width / 2, height / 2]);

              path = d3.geoPath().projection(projection);
              g = svg.append('g');

              zoom = d3
                .zoom()
                .scaleExtent([0.5, 50])
                .on('zoom', (event) => {
                  g.attr('transform', event.transform);
                });

              svg.call(zoom);

              // 重置縮放狀態，確保切換模式時不會受到之前模式的影響
              svg.call(zoom.transform, d3.zoomIdentity);

              createTooltip();
              isMapReady.value = true;
            }
          } else {
            // 如果已經創建了地圖，重置縮放狀態
            if (svg && zoom) {
              svg.call(zoom.transform, d3.zoomIdentity);
            }
          }
          // 繪製跑道線路
          drawRunway();
        }
      };

      /**
       * 🏗️ 創建地圖實例
       * 初始化 D3.js 地圖並設定基本配置
       */
      const createMap = () => {
        if (!mapContainer.value) return false;

        const rect = mapContainer.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('[MapTab] 容器尺寸為零，延遲初始化');
          return false;
        }

        try {
          const width = rect.width;
          const height = rect.height;

          // 台灣中心位置：緯度 23.5°, 經度 121°

          // 創建 SVG 元素
          svg = d3
            .select(mapContainer.value)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#ffffff'); // 純白色背景

          // 創建投影 - 麥卡托投影，聚焦在台灣
          projection = d3
            .geoMercator()
            .center([121, 23.5]) // 中心點在台灣
            .scale(12000) // 更大的縮放比例，更聚焦在台灣
            .translate([width / 2, height / 2]);

          // 創建路徑生成器
          path = d3.geoPath().projection(projection);

          // 創建容器組
          g = svg.append('g');

          // 設置縮放行為
          zoom = d3
            .zoom()
            .scaleExtent([0.5, 50]) // 允許縮放 0.5x 到 50x
            .on('zoom', (event) => {
              g.attr('transform', event.transform);
            });

          svg.call(zoom);

          // 重置縮放狀態，確保切換模式時不會受到之前模式的影響
          svg.call(zoom.transform, d3.zoomIdentity);

          // 創建工具提示元素
          createTooltip();

          isMapReady.value = true;

          // 將地圖實例傳遞給父組件
          emit('map-ready', { svg, projection, path });

          console.log('[MapTab] D3.js 地圖創建成功');
          return true;
        } catch (error) {
          console.error('[MapTab] D3.js 地圖創建失敗:', error);
          return false;
        }
      };

      /**
       * 🚀 初始化地圖
       * 根據初始顯示模式創建對應的視圖
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 根據顯示模式載入不同的數據
        if (displayMode.value === 'map') {
          // 地圖模式：載入跑道線路數據
          console.log('[MapTab] 開始載入地圖模式數據...');
          const runwayLoaded = await loadRunwayData();

          if (!runwayLoaded) {
            console.error('[MapTab] 無法載入跑道線路數據');
            return;
          }

          console.log('[MapTab] 數據載入完成，開始創建地圖');

          const tryCreateMap = async () => {
            if (attempts >= maxAttempts) {
              console.error('[MapTab] 地圖初始化失敗，已達到最大嘗試次數');
              return;
            }

            attempts++;
            console.log(`[MapTab] 嘗試創建地圖 (${attempts}/${maxAttempts})`);

            if (createMap()) {
              console.log('[MapTab] 地圖創建成功，開始繪製圖層');
              // 繪製跑道線路
              drawRunway();
            } else {
              console.log('[MapTab] 地圖創建失敗，100ms 後重試');
              setTimeout(tryCreateMap, 100);
            }
          };

          tryCreateMap();
        }
      };

      // 🧹 生命週期：組件掛載
      onMounted(() => {
        nextTick(() => {
          initMap();
        });
      });

      // 🧹 生命週期：組件卸載
      onUnmounted(() => {
        if (svg) {
          svg.remove();
          svg = null;
        }

        // 清理工具提示
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }

        projection = null;
        path = null;
        zoom = null;
        g = null;
        isMapReady.value = false;
      });

      // 📤 返回組件公開的屬性和方法
      return {
        mapContainer,
        mapContainerId,
        displayMode,
        toggleDisplayMode,
      };
    },
  };
</script>

<template>
  <!-- 🗺️ 地圖主容器 -->
  <div id="map-container" class="h-100 w-100 position-relative bg-transparent z-0">
    <!-- 🗺️ Leaflet 地圖容器 -->
    <div :id="mapContainerId" ref="mapContainer" class="h-100 w-100"></div>
  </div>
</template>

<style scoped>
  @import '../assets/css/common.css';

  #map-container {
    overflow: hidden;
    background: #ffffff; /* 純白色背景 */
  }

  :deep(.leaflet-container) {
    background: #ffffff; /* 純白色背景 */
  }

  :deep(.leaflet-popup-content-wrapper) {
    background: rgba(0, 43, 127, 0.95); /* 諾魯深藍色半透明 */
    color: #ffc61e; /* 金黃色文字 */
    border: 2px solid #ffc61e; /* 金黃色邊框 */
  }

  :deep(.leaflet-popup-tip) {
    background: rgba(0, 43, 127, 0.95); /* 諾魯深藍色半透明 */
  }

  :deep(.leaflet-tooltip) {
    background-color: rgba(0, 43, 127, 0.95) !important; /* 諾魯深藍色 */
    color: #ffc61e !important; /* 金黃色文字 */
    border: 1px solid #ffc61e !important; /* 金黃色邊框 */
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 4px;
    line-height: 1.4;
  }

  :deep(.map-tooltip) {
    background-color: rgba(0, 0, 0, 0.9); /* 深色半透明背景 */
    color: #fff; /* 白色文字 */
    border: 2px solid #fff; /* 白色邊框 */
    border-radius: 8px; /* 圓角 */
    padding: 12px; /* 內邊距 */
    font-size: 14px; /* 字體大小 */
    font-family: 'Arial', sans-serif; /* 字體 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* 陰影 */
    z-index: 1000; /* 確保在最上層 */
    max-width: 250px; /* 最大寬度 */
    line-height: 1.4; /* 行高 */
  }
</style>
