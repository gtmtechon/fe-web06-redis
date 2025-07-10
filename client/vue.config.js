// client/vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 빌드 결과물이 상위 폴더의 'dist' 디렉토리로 생성되도록 설정
  outputDir: path.resolve(__dirname, '../dist'),
  // 개발 서버 설정 (로컬 개발 시 Node.js 서버와 충돌 방지)
  devServer: {
    proxy: {
      '/api': { // /api로 시작하는 모든 요청을 Node.js 서버로 프록시
        target: 'http://localhost:3001',
        ws: true, // 웹소켓 프록시 활성화
        changeOrigin: true
      }
    }
  }
})