<template>
  <div class="page-container">
    <h1>등록된 IoT 장비 목록</h1>
    <div class="header-buttons">
      <router-link to="/devices/register" class="button primary">새 장비 등록</router-link>
      <router-link to="/devices/temperature" class="button secondary">현재온도 조회</router-link>
      <!-- 새롭게 추가된 "실시간 로봇 모니터링" 버튼 -->
      <router-link to="/robots/monitor" class="button secondary">실시간 로봇 모니터링</router-link>
    </div>


    <div v-if="loading" class="loading-message">장비 목록을 불러오는 중...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="devices.length === 0" class="no-devices-message">등록된 장비가 없습니다.</div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>장비 ID</th>
            <th>장비 이름</th>
            <th>위치</th>
            <th>등록일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device.deviceId">
            <td>{{ device.deviceId }}</td>
            <td>{{ device.deviceName }}</td>
            <td>{{ device.location }}</td>
            <td>{{ new Date(device.registeredAt).toLocaleString() }}</td>
            <td class="actions">
              <router-link :to="`/devices/monitor/${device.deviceId}`" class="button small secondary">모니터링</router-link>
              <router-link :to="`/devices/edit/${device.deviceId}`" class="button small info">수정</router-link>
              <button @click="confirmDelete(device.deviceId)" class="button small danger">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// API 호출 URL은 Node.js 서버의 URL로 변경됩니다.
// Node.js 서버가 APIM 호출을 담당하므로, 프런트엔드에서는 APIM 구독 키가 필요 없습니다.
const apiClient = axios.create({
  baseURL: `${window.location.origin}/api`, // 현재 호스트의 /api 경로
  headers: {
    'Content-Type': 'application/json',
    // 'Ocp-Apim-Subscription-Key': process.env.VUE_APP_APIM_SUBSCRIPTION_KEY // Node.js 서버가 처리
  }
});

export default {
  name: 'HomePage',
  data() {
    return {
      devices: [],
      loading: true,
      error: null,
    };
  },
  created() {
    this.fetchDevices();
  },
  methods: {
    async fetchDevices() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/devices'); // /api/devices 로 호출
        this.devices = response.data;
      } catch (err) {
        console.error('Error fetching devices:', err);
        this.error = `장비 목록을 불러오는 데 실패했습니다: ${err.response?.status ? `HTTP ${err.response.status} - ` : ''}${err.response?.data?.message || err.message}`;
      } finally {
        this.loading = false;
      }
    },
    async confirmDelete(deviceId) {
      if (confirm(`정말 장비 ID: ${deviceId}를 삭제하시겠습니까?`)) {
        try {
          await apiClient.delete(`/devices/${deviceId}`); // /api/devices/{id} 로 호출
          alert('장비가 성공적으로 삭제되었습니다.');
          this.fetchDevices(); // 목록 새로고침
        } catch (err) {
          console.error('Error deleting device:', err);
          this.error = `장비 삭제에 실패했습니다: ${err.response?.status ? `HTTP ${err.response.status} - ` : ''}${err.response?.data?.message || err.message}`;
        }
      }
    },
  },
};
</script>

<style scoped>
/* 기존 스타일은 변경 없음 */
.page-container {
  padding: 20px;
  text-align: center; /* 전체 페이지 내용 중앙 정렬 */
}

h1 {
  color: #0056b3;
  margin-bottom: 20px;
}

/* 새롭게 추가된 버튼 컨테이너 */
.header-buttons {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px; /* 버튼들 사이의 간격 */
}

.button {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  text-decoration: none;
  /* margin-bottom: 20px; -> .header-buttons 로 이동 */
}

.button.primary {
  background-color: #007bff;
  color: white;
}

.button.primary:hover {
  background-color: #0056b3;
}

.loading-message, .error-message, .no-devices-message {
  margin-top: 20px;
  font-size: 1.1em;
}

.error-message {
  color: red;
}

.no-devices-message {
  color: #555;
}

/* 테이블을 감싸는 컨테이너에 중앙 정렬 속성 적용 */
.table-container {
  max-width: 900px; /* 테이블의 최대 너비 설정 (조절 가능) */
  margin: 20px auto; /* 좌우 마진을 자동으로 설정하여 중앙 정렬 */
  overflow-x: auto; /* 테이블이 너무 넓을 경우 스크롤 허용 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

table {
  width: 100%; /* 부모 컨테이너 너비에 맞춤 */
  border-collapse: collapse;
  margin: 0; /* 테이블 자체의 외부 마진 제거 */
  background-color: white;
}

th, td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: center; /* 테이블 셀 내용 중앙 정렬 */
  vertical-align: middle; /* 세로 정렬 중앙 */
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

.actions {
  white-space: nowrap; /* 버튼들이 한 줄에 표시되도록 설정 */
}

.button.small {
  padding: 6px 12px;
  font-size: 0.85em;
  margin: 2px;
}

.button.info {
  background-color: #17a2b8;
  color: white;
}

.button.info:hover {
  background-color: #117a8b;
}

.button.danger {
  background-color: #dc3545;
  color: white;
}

.button.danger:hover {
  background-color: #c82333;
}

.button.secondary {
  background-color: #6c757d;
  color: white;
}

.button.secondary:hover {
  background-color: #5a6268;
}
</style>