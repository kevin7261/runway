/**
 * 🗺️ 定義存儲模組 (Define Store Module)
 *
 * 管理應用程式的全局配置和設定
 * 注意：本項目使用 D3.js 繪製地圖，此 store 保留供未來擴展使用
 *
 * 技術架構：
 * - Pinia 狀態管理
 * - 響應式狀態更新
 */

import { defineStore } from 'pinia';

export const useDefineStore = defineStore('define', {
  state: () => ({}),
  actions: {},
});
