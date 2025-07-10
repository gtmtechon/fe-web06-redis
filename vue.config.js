const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: { // 이 부분이 중요합니다.
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Node.js 백엔드 주소
        changeOrigin: true
      },
      '/websocket': { // WebSocket 프록시
        target: 'ws://localhost:3000', // Node.js 백엔드 WebSocket 주소
        ws: true, // WebSocket 프록시 활성화
        changeOrigin: true
      }
    }
  }
})
