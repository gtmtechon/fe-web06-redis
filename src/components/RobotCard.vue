<template>
  <div :class="cardClasses" class="rounded-lg shadow-md p-6 m-4 transition-all duration-300 ease-in-out transform hover:scale-105">
    <h3 class="text-xl font-bold mb-2">{{ robot.botName }}</h3>
    <p class="text-gray-700 mb-1">
      <span class="font-semibold">ID:</span> {{ robot.botId }}
    </p>
    <p class="text-gray-700 mb-1">
      <span class="font-semibold">상태:</span>
      <span :class="statusClasses">{{ robot.status }}</span>
    </p>
    <p class="text-gray-700 mb-1">
      <span class="font-semibold">위치:</span> {{ robot.location }}
    </p>
    <p class="text-gray-700 text-sm">
      <span class="font-semibold">최종 업데이트:</span> {{ formattedLastUpdated }}
    </p>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'RobotCard',
  props: {
    robot: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // 로봇 상태에 따른 카드 배경색 클래스
    const cardClasses = computed(() => {
      switch (props.robot.status) {
        case 'WORKING':
          return 'bg-green-100 border-l-4 border-green-500';
        case 'MOVING':
          return 'bg-blue-100 border-l-4 border-blue-500';
        case 'INREST':
          return 'bg-yellow-100 border-l-4 border-yellow-500';
        case 'OFF':
          return 'bg-gray-100 border-l-4 border-gray-500';
        default:
          return 'bg-white border-l-4 border-gray-300';
      }
    });

    // 로봇 상태에 따른 텍스트 색상 클래스
    const statusClasses = computed(() => {
      switch (props.robot.status) {
        case 'WORKING':
          return 'text-green-600 font-bold';
        case 'MOVING':
          return 'text-blue-600 font-bold';
        case 'INREST':
          return 'text-yellow-600 font-bold';
        case 'OFF':
          return 'text-gray-600 font-bold';
        default:
          return 'text-gray-600';
      }
    });

    // 최종 업데이트 시간을 보기 좋게 포맷
    const formattedLastUpdated = computed(() => {
      if (props.robot.lastUpdated) {
        const date = new Date(props.robot.lastUpdated);
        return date.toLocaleString(); // 현지 시간으로 포맷
      }
      return 'N/A';
    });

    return {
      cardClasses,
      statusClasses,
      formattedLastUpdated
    };
  }
};
</script>

<style scoped>
/* Tailwind CSS를 사용하므로 추가적인 CSS는 필요하지 않을 수 있습니다. */
</style>
