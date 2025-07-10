<template>
  <div class="page-container">
    <h1>실시간 로봇 위치 및 상태 모니터링</h1>
    <router-link to="/" class="button primary back-button">홈으로 돌아가기</router-link>

    <div v-if="loading" class="loading-message">로봇 정보를 불러오는 중...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="Object.keys(robots).length === 0" class="no-data-message">
      현재 조회할 수 있는 로봇 데이터가 없습니다.
    </div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>로봇 ID</th>
            <th>위도</th>
            <th>경도</th>
            <th>상태</th>
            <th>마지막 업데이트</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="robot in sortedRobots" :key="robot.robotId">
            <td>{{ robot.robotId }}</td>
            <td>{{ robot.latitude.toFixed(6) }}</td>
            <td>{{ robot.longitude.toFixed(6) }}</td>
            <td :class="{'status-moving': robot.status === '이동중', 'status-cleaning': robot.status === '정화중', 'status-idle': robot.status === '쉬는중'}">
              {{ robot.status }}
            </td>
            <td>{{ robot.lastUpdated ? new Date(robot.lastUpdated).toLocaleString() : 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="refresh-info">데이터는 웹소켓을 통해 실시간으로 업데이트됩니다.</p>
    </div>

    <!-- 지도 표시 영역 (추후 연동) -->
    <div class="map-container">
      <h2>석촌호수 로봇 위치 (지도 연동 예정)</h2>
      <p>여기에 Google Maps, Naver Maps, OpenLayers 등 지도 라이브러리를 사용하여 로봇의 실시간 위치를 시각화할 수 있습니다.</p>
      <!-- <div id="map"></div> -->
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'; // Socket.IO 클라이언트 라이브러리 임포트
import axios from 'axios'; // 초기 데이터 로드를 위한 axios

// Node.js WebSocket 서버 및 REST API는 동일 호스트에서 제공되므로 상대 경로 사용
const WS_SERVER_URL = window.location.origin; // 현재 웹 페이지의 호스트 (http://localhost:3001 또는 https://your-app.azurewebsites.net)
const REST_API_BASE_URL = `${window.location.origin}/api`; // REST API 기본 경로

export default {
  name: 'RobotMonitoringPage',
  data() {
    return {
      robots: {}, // 로봇 ID를 키로 하는 객체로 관리하여 빠른 업데이트
      loading: true,
      error: null,
      socket: null, // Socket.IO 클라이언트 인스턴스
    };
  },
  computed: {
    sortedRobots() {
      // 로봇 ID를 기준으로 정렬하여 테이블에 표시
      return Object.values(this.robots).sort((a, b) => a.robotId.localeCompare(b.robotId));
    }
  },
  async created() {
    // 1. 초기 로봇 데이터 로드 (REST API 사용)
    await this.fetchInitialRobotsData();
    // 2. 웹소켓 연결 시작
    this.connectWebSocket();
  },
  beforeUnmount() {
    // 컴포넌트가 파괴되기 전에 웹소켓 연결 해제
    if (this.socket) {
      this.socket.disconnect();
      console.log('WebSocket disconnected.');
    }
  },
  methods: {
    async fetchInitialRobotsData() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${REST_API_BASE_URL}/robots/latest-all`);
        // 배열로 받은 데이터를 객체로 변환하여 robots 상태에 저장
        response.data.forEach(robot => {
          this.robots[robot.robotId] = robot;
        });
        console.log('Initial robot data loaded:', this.robots);
      } catch (err) {
        console.error('Error fetching initial robot data:', err);
        this.error = `초기 로봇 데이터를 불러오는 데 실패했습니다: ${err.response?.status ? `HTTP ${err.response.status} - ` : ''}${err.response?.data?.message || err.message}`;
      } finally {
        this.loading = false;
      }
    },
    connectWebSocket() {
      // Socket.IO 클라이언트 연결
      this.socket = io(WS_SERVER_URL); // 현재 호스트로 연결

      this.socket.on('connect', () => {
        console.log('WebSocket connected to server.');
      });

      this.socket.on('robot_status_update', (data) => {
        // 실시간 업데이트 수신 시 robots 객체 업데이트
        console.log('Received real-time update:', data);
        this.robots = {
          ...this.robots,
          [data.robotId]: data // 해당 로봇의 데이터만 업데이트
        };
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected from server.');
      });

      this.socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        this.error = `웹소켓 연결 오류: ${err.message}`;
      });
    },
  },
};
</script>

<style scoped>
/* 기존 스타일 유지 */
.page-container {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #0056b3;
  margin-bottom: 20px;
}

.button {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  text-decoration: none;
}

.button.primary {
  background-color: #007bff;
  color: white;
}

.button.primary:hover {
  background-color: #0056b3;
}

.back-button {
  margin-bottom: 20px;
}

.loading-message, .error-message, .no-data-message, .refresh-info {
  margin-top: 20px;
  font-size: 1.1em;
}

.error-message {
  color: red;
}

.no-data-message {
  color: #555;
}

.refresh-info {
  font-size: 0.9em;
  color: #777;
  margin-top: 15px;
}

.table-container {
  max-width: 900px;
  margin: 20px auto;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  background-color: white;
}

th, td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

/* 로봇 상태에 따른 스타일링 */
.status-moving {
  color: #007bff; /* 파란색 */
  font-weight: bold;
}
.status-cleaning {
  color: #28a745; /* 녹색 */
  font-weight: bold;
}
.status-idle {
  color: #6c757d; /* 회색 */
}

.map-container {
  margin-top: 40px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>