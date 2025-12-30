<script>
  /**
   * 🏠 App.vue - 應用程式主組件
   *
   * 功能說明：
   * 1. 🏗️ 提供應用程式整體框架和佈局結構
   * 2. ⏳ 管理全域載入狀態和進度顯示
   * 3. 🚀 管理 Vue Router 的路由導航系統
   * 4. 📱 實現響應式滿版佈局，無邊距和空隙
   *
   * 架構說明：
   * - 內容層：路由視圖容器，動態顯示不同頁面組件
   *
   * 設計理念：
   * - 滿版無邊距佈局設計
   * - 模組化組件架構
   */

  export default {
    name: 'App',
  };
</script>

<template>
  <!-- 🏠 App.vue - 主應用程式組件 (Main Application Component) -->
  <!-- 提供應用程式整體框架，使用 Bootstrap 實現滿版無空隙佈局 -->
  <div id="app" class="d-flex flex-column vh-100">
    <!-- 🔴 4:5 直立滿版紅框（永遠在最上方） -->
    <div class="red-frame"></div>
    <!-- 📱 主要內容區域 (Main Content Area) -->
    <div class="d-flex flex-column overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<style>
  /**
 * 🎨 應用程式全域樣式 (Application Global Styles)
 *
 * 引入共用 CSS 並定義應用程式層級的樣式
 * 注意：大部分樣式已移至 common.css 中統一管理
 */

  /* 📦 引入共用樣式表 (Import Common Stylesheets) */
  @import './assets/css/common.css';

  /* 📱 應用程式特定樣式 (App-Specific Styles) */
  /* 其他樣式已整合至 common.css 中，避免重複定義 */

  /* 🔴 4:5 直立滿版紅框樣式 */
  .red-frame {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 居中對齊 */
    width: 80vh; /* 高度100vh * 4/5 = 80vh */
    height: 100vh; /* 高度100% */
    border: 4px solid #ff0000; /* 紅色邊框 */
    box-sizing: border-box;
    z-index: 9999; /* 永遠在最上方 */
    pointer-events: none; /* 不阻擋下方元素的交互 */
  }
</style>
