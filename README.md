# fe-web06-redis
redis cache test

## simple front end project 
root/
├── server.js               # Node.js 서버 (정적 파일 제공, API, WebSocket)
├── package.json            # 최상위 프로젝트의 Node.js 의존성 및 스크립트
├── .env                    # 환경 변수 (Redis 연결 정보)
├── client/                 # Vue.js 프런트엔드 프로젝트 폴더
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   │   └── index.js
│   │   └── views/
│   │       ├── HomePage.vue
│   │       └── RobotMonitoringPage.vue
│   ├── vue.config.js       # Vue.js 빌드 설정
│   ├── package.json        # Vue.js 프로젝트의 의존성
│   └── ... (기타 Vue.js 파일)
└── dist/                   # Vue.js 빌드 결과물 (Node.js 서버가 제공)