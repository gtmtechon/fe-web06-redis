<template>
  <div id="app" class="min-h-screen bg-gray-50 p-6 font-inter">
    <header class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-blue-800 tracking-tight">
        실시간 로봇 모니터링 대시보드
      </h1>
      <p class="text-lg text-gray-600 mt-2">Redis Pub/Sub 및 WebSocket을 활용한 실시간 업데이트</p>
    </header>

    <main class="container mx-auto">
      <div v-if="loading" class="text-center text-gray-600 text-lg">
        로봇 데이터를 불러오는 중...
      </div>
      <div v-else-if="error" class="text-center text-red-600 text-lg">
        오류 발생: {{ error }}
      </div>
      <div v-else-if="Object.keys(robots).length === 0" class="text-center text-gray-600 text-lg">
        현재 로봇 데이터가 없습니다. 시뮬레이터를 실행해주세요.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <RobotCard v-for="robot in sortedRobots" :key="robot.botId" :robot="robot" />
      </div>
    </main>

    <footer class="text-center mt-12 text-gray-500 text-sm">
      <p>&copy; 2024 실시간 로봇 모니터링. 모든 권리 보유.</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import RobotCard from './components/RobotCard.vue';

export default {
  name: 'App',
  components: {
    RobotCard
  },
  setup() {
    const robots = ref({});
    const loading = ref(true);
    const error = ref(null);
    let ws = null;

    const sortedRobots = computed(() => {
      return Object.values(robots.value).sort((a, b) => a.botId.localeCompare(b.botId));
    });

    const fetchInitialData = async () => {
      try {
        // 백엔드와 같은 도메인이므로 상대 경로 사용
        const response = await fetch('/api/robots');
        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }
        const data = await response.json();
        data.forEach(robot => {
          const formattedLocation = `${robot.location.latitude},${robot.location.longitude}`;
          robots.value[robot.botId] = { ...robot, location: formattedLocation };
        });
      } catch (e) {
        console.error("초기 로봇 데이터 가져오기 실패:", e);
        error.value = "초기 데이터를 불러오는 데 실패했습니다.";
      } finally {
        loading.value = false;
      }
    };

    const setupWebSocket = () => {
      // 백엔드와 같은 도메인이므로 상대 경로 사용
      // Azure App Service는 기본적으로 HTTP/HTTPS 요청을 처리하며, WebSocket 연결은 동일한 포트를 통해 업그레이드됩니다.
      // 따라서 `window.location.protocol`을 사용하여 `ws://` 또는 `wss://`를 동적으로 결정합니다.
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);

      ws.onopen = () => {
        console.log('WebSocket 연결 성공');
      };

      ws.onmessage = event => {
        try {
          const robotData = JSON.parse(event.data);
          console.log('WebSocket으로부터 데이터 수신:', robotData);
          robots.value[robotData.botId] = robotData;
        } catch (e) {
          console.error('WebSocket 메시지 파싱 오류:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket 연결 종료. 5초 후 재연결 시도...');
        setTimeout(setupWebSocket, 5000);
      };

      ws.onerror = err => {
        console.error('WebSocket 오류:', err);
        error.value = 'WebSocket 연결에 문제가 발생했습니다.';
        ws.close();
      };
    };

    onMounted(() => {
      fetchInitialData();
      setupWebSocket();
    });

    onUnmounted(() => {
      if (ws) {
        ws.close();
      }
    });

    return {
      robots,
      loading,
      error,
      sortedRobots
    };
  }
};
</script>

<style>
/* Tailwind CSS는 자동으로 포함됩니다. 추가적인 전역 스타일은 여기에 추가할 수 있습니다. */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
</style>
