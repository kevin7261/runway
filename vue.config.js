const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: '/runway/',
  transpileDependencies: true,
  devServer: {
    port: 8080,
    host: 'localhost',
  },
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Runway';
      return args;
    });
  },
});
