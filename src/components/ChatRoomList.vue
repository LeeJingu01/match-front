<template>
  <v-table>
    <thead>
      <tr>
        <th>채팅방 이름</th>
        <th>읽지 않은 메시지</th>
        <th>액션</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="room in rooms" :key="room.chatRoomId">
        <td>{{ room.chatRoomName }}</td>
        <td>{{ room.unreadCount }}</td>
        <td>
          <v-btn color="primary" @click="$emit('enter', room.chatRoomId)">
            입장
          </v-btn>
          <v-btn color="secondary" @click="$emit('leave', room.chatRoomId)">
            나가기
          </v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
export default {
  props: {
    rooms: Array,
  },
};
</script>
