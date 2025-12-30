/**
 * 📦 數據存儲模組 (Data Store Module)
 *
 * 管理城市圖層數據和地圖導航功能
 * 使用 Pinia 狀態管理系統和 Vue 3 Composition API
 */

// 核心依賴
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 🏪 數據存儲商店定義 (Data Store Definition)
 *
 * 使用 Pinia 的 defineStore 創建一個名為 'data' 的狀態管理商店。
 * 採用 Composition API 語法，提供更好的 TypeScript 支援和代碼組織。
 *
 * @returns {Object} 包含所有狀態和方法的商店對象
 */
export const useDataStore = defineStore(
  'data', // 商店唯一標識符
  () => {
    // ------------------------------------------------------------
    // 地圖實例管理
    const mapInstance = ref(null);

    const setMapInstance = (map) => {
      mapInstance.value = map;
    };

    return {
      mapInstance, // 地圖實例
      setMapInstance, // 設定地圖實例
    };
  },
  {
    persist: true,
  }
);
