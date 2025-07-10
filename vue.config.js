const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // devServer.proxy 설정은 통합 배포 시 필요 없으므로 제거합니다.
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000',
  //       changeOrigin: true
  //     },
  //     '/websocket': {
  //       target: 'ws://localhost:3000',
  //       ws: true,
  //       changeOrigin: true
  //     }
  //   }
  // }
})