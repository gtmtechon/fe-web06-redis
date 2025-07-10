my-robot-app/
├── .github/
│   └── workflows/
│       └── azure-web-app-deploy.yml  <-- GitHub Actions 워크플로우 파일
├── node_modules/                     <-- Node.js 종속성
├── dist/                             <-- Vue.js 빌드 결과물이 배포 시 여기에 복사됩니다.
├── public/                           <-- Vue.js의 정적 자산 (index.html, favicon.ico 등)
├── src/                              <-- Vue.js 소스 코드
│   ├── assets/
│   ├── components/
│   │   └── RobotCard.vue
│   └── App.vue
│   └── main.js
├── app.js                            <-- Node.js 서버 코드
├── package.json                      <-- 통합된 Node.js 및 Vue.js 종속성 및 스크립트
├── .env                              <-- 로컬 개발용 환경 변수 (Git에 커밋하지 마세요!)
├── vue.config.js                     <-- Vue.js 설정
└── README.md
