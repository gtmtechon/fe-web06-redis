// server.js
require('dotenv').config(); // .env 파일 로드

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');
const path = require('path'); // 파일 경로 처리를 위해 추가

const app = express();
const server = http.createServer(app);

// CORS 설정 (프런트엔드와 백엔드가 동일 App Service에 통합되므로, 개발 환경에서만 필요)
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3001'], // Vue.js 개발 서버 포트와 Node.js 서버 포트
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

const PORT = process.env.PORT || 3001;

// Socket.IO 설정
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:3001'], // Vue.js 개발 서버 포트와 Node.js 서버 포트
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Redis 클라이언트 설정
const redisHost = process.env.REDIS_HOST;
const redisPassword = process.env.REDIS_PASSWORD;
const redisPort = parseInt(process.env.REDIS_PORT || '6380', 10);
const redisSsl = process.env.REDIS_SSL === 'true';

let redisClient;
let redisSubscriber;

if (redisHost && redisPassword) {
  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    tls: redisSsl ? {} : undefined, // SSL 사용 시 tls 옵션 설정
    lazyConnect: true // 필요할 때만 연결
  });

  redisSubscriber = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    tls: redisSsl ? {} : undefined,
    lazyConnect: true
  });

  // Redis 연결 및 Pub/Sub 구독
  redisSubscriber.on('connect', () => {
    console.log('Redis subscriber connected.');
    redisSubscriber.subscribe('robot_updates', (err, count) => {
      if (err) {
        console.error("Failed to subscribe: %s", err.message);
      } else {
        console.log(`Subscribed to ${count} channel(s).`);
      }
    });
  });

  redisSubscriber.on('message', (channel, message) => {
    if (channel === 'robot_updates') {
      try {
        const robotData = JSON.parse(message);
        console.log('Received from Redis:', robotData);
        // 모든 연결된 클라이언트에게 실시간 데이터 푸시
        io.emit('robot_status_update', robotData);
      } catch (e) {
        console.error('Error parsing Redis message:', e);
      }
    }
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

  // Redis 연결 시도
  redisClient.connect().catch(err => console.error('Failed to connect Redis Client:', err));
  redisSubscriber.connect().catch(err => console.error('Failed to connect Redis Subscriber:', err));

} else {
  console.warn("Redis connection details not found. Real-time updates will not be available.");
}

// ---------------------------------------------------
// REST API: 모든 로봇의 최신 상태 조회 (초기 로드용)
// 클라이언트에서 /api/robots/latest-all 로 호출
// ---------------------------------------------------
app.get('/api/robots/latest-all', async (req, res) => {
  if (!redisClient) {
    return res.status(500).json({ message: "Redis client not initialized or connected." });
  }
  try {
    const keys = await redisClient.keys('robot:*:status'); // 예: 'robot:robot-01:status'
    const allRobotData = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        allRobotData.push(JSON.parse(data));
      }
    }
    res.json(allRobotData);
  } catch (error) {
    console.error('Error fetching all robot data from Redis:', error);
    res.status(500).json({ message: 'Failed to fetch robot data from Redis.' });
  }
});

// Socket.IO 연결 이벤트
io.on('connection', (socket) => {
  console.log('A client connected via WebSocket.');
  socket.on('disconnect', () => {
    console.log('A client disconnected from WebSocket.');
  });
});

// ---------------------------------------------------
// Vue.js 프런트엔드 정적 파일 제공
// 'dist' 폴더는 Vue.js 프로젝트 빌드 결과물이 생성될 위치입니다.
// ---------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')));

// Vue Router history 모드 지원: 모든 요청을 index.html로 리디렉션
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`Node.js WebSocket server listening on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});