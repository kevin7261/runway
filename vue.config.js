const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: '/runway/',
  transpileDependencies: true,
  devServer: {
    port: 8080,
    host: 'localhost',
  },
});
