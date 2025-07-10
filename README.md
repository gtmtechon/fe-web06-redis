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


### local host에서 테스트하기 위해서는
cd $project_home
(재설치 시: rm -rf *; npm cache clean --force)
`$` npm install
`$`npm run build-client
`$`npm start
web browser--> http://localhost:3000

### error
{
    "message": "로봇 데이터를 가져오지 못했습니다.",
    "error": "WRONGTYPE Operation against a key holding the wrong kind of value"
}

Sol)=> redis flush: azure portal>redis>Administration>Flush data
