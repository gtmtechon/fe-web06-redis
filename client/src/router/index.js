// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import CurrentDeviceTemperature from '../views/CurrentDeviceTemperature.vue';
import RobotMonitoringPage from '../views/RobotMonitoringPage.vue'; // 새로 추가된 컴포넌트 임포트

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/devices/temperature',
    name: 'CurrentDeviceTemperature',
    component: CurrentDeviceTemperature,
  },
  {
    path: '/robots/monitor', // 로봇 모니터링 페이지 라우트
    name: 'RobotMonitoringPage',
    component: RobotMonitoringPage,
  },
  // 기타 라우트들...
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;