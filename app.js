// 필요한 모듈 임포트
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const redis = require('redis');
const dotenv = require('dotenv');
const path = require('path'); // path 모듈 추가
const cors = require('cors'); // <-- 이 줄을 추가합니다.


// .env 파일에서 환경 변수 로드
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Redis 클라이언트 설정
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_PORT = process.env.REDIS_PORT || 6380;
const REDIS_SSL = process.env.REDIS_SSL === 'true';

if (!REDIS_HOST || !REDIS_PASSWORD) {
  console.error("REDIS_HOST 또는 REDIS_PASSWORD 환경 변수가 설정되지 않았습니다.");
  process.exit(1); // 환경 변수가 없으면 애플리케이션 종료
}
// CORS 설정 추가 (로컬 개발 환경에서 필요할 수 있음)
// 운영 환경에서는 Vue.js 프론트엔드의 실제 도메인으로 origin을 제한해야 합니다.
app.use(cors({
  origin: '*', // 모든 오리진 허용 (개발용)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Redis 클라이언트 생성 (Publisher 및 Subscriber)
const redisOptions = {
  url: `rediss://${REDIS_HOST}:${REDIS_PORT}`, // SSL 사용 시 rediss://
  password: REDIS_PASSWORD,
  socket: {
    tls: REDIS_SSL,
    rejectUnauthorized: false // 개발 환경에서 자체 서명 인증서 사용 시 필요
  }
};

const publisherClient = redis.createClient(redisOptions);
const subscriberClient = redis.createClient(redisOptions);

// Redis 연결 상태 로깅
publisherClient.on('connect', () => console.log('Publisher가 Redis에 연결되었습니다.'));
publisherClient.on('error', (err) => console.error('Publisher Redis 오류:', err));
publisherClient.connect().catch(err => console.error('Publisher가 Redis에 연결하지 못했습니다:', err));

subscriberClient.on('connect', () => console.log('Subscriber가 Redis에 연결되었습니다.'));
subscriberClient.on('error', (err) => console.error('Subscriber Redis 오류:', err));
subscriberClient.connect().catch(err => console.error('Subscriber가 Redis에 연결하지 못했습니다:', err));

// Redis Pub/Sub 채널 구독
subscriberClient.on('ready', () => {
  console.log('Subscriber가 구독 준비 완료되었습니다.');
  subscriberClient.subscribe('robot_updates', (message, channel) => {
    console.log(`Redis 채널 '${channel}'로부터 메시지 수신: ${message}`);
    // 연결된 모든 WebSocket 클라이언트에게 메시지 전송
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// WebSocket 연결 처리
wss.on('connection', ws => {
  console.log('클라이언트가 WebSocket을 통해 연결되었습니다.');

  // 클라이언트로부터 메시지 수신 시 (선택 사항)
  ws.on('message', message => {
    console.log(`클라이언트로부터 메시지 수신: ${message}`);
  });

  // WebSocket 연결 종료 시
  ws.on('close', () => {
    console.log('클라이언트가 WebSocket에서 연결 해제되었습니다.');
  });

  // WebSocket 오류 발생 시
  ws.on('error', error => {
    console.error('WebSocket 오류:', error);
  });
});

// 초기 데이터 로드 API
app.get('/api/robots', async (req, res) => {
  if (!publisherClient.isReady) {
    return res.status(503).json({ message: 'Redis 클라이언트가 준비되지 않았습니다.' });
  }
  try {
    const keys = await publisherClient.keys('robot:aw-robot-*');
    const robots = [];
    for (const key of keys) {
      const robotData = await publisherClient.hgetall(key);
      if (robotData) {
        const [latitude, longitude] = robotData.location.split(',').map(Number);
        robots.push({
          ...robotData,
          location: { latitude, longitude }
        });
      }
    }
    res.json(robots);
  } catch (error) {
    console.error('초기 로봇 데이터 가져오기 오류:', error);
    res.status(500).json({ message: '로봇 데이터를 가져오지 못했습니다.', error: error.message });
  }
});

// Vue.js 프론트엔드 정적 파일 서빙
// 'dist' 폴더는 Vue.js 빌드 시 생성되는 결과물이 저장되는 곳입니다.
// GitHub Actions에서 'dist' 폴더의 내용을 이 경로로 복사할 것입니다.
app.use(express.static(path.join(__dirname, 'dist')));

// Vue Router history 모드를 위한 모든 요청에 index.html 서빙
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 서버 포트 설정
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 애플리케이션 종료 시 Redis 연결 해제
process.on('SIGINT', async () => {
  console.log('서버 종료 중...');
  await publisherClient.quit();
  await subscriberClient.quit();
  server.close(() => {
    console.log('HTTP 서버가 닫혔습니다.');
    process.exit(0);
  });
});
