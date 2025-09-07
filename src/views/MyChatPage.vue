<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5">
            내 채팅 목록
          </v-card-title>
          <v-card-text>
            <!-- 탭 -->
            <v-tabs v-model="tab" background-color="primary" dark>
              <v-tab value="friend">친구 채팅</v-tab>
              <v-tab value="group">매칭 그룹</v-tab>
            </v-tabs>

            <!-- 공통 테이블 헤더 -->
            <v-table>
              <thead>
                <tr>
                  <th>채팅방 이름</th>
                  <th>읽지 않은 메시지</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                <!-- 친구 채팅 -->
                <template v-if="tab === 'friend'">
                  <tr v-for="chat in friendRooms" :key="chat.roomId">
                    <td>{{ chat.roomName }}</td>
                    <td>{{ chat.unReadCount }}</td>
                    <td>
                      <v-btn color="primary" @click="enterChatRoom(chat.roomId)"
                        >입장</v-btn
                      >
                      <v-btn color="secondary" disabled>나가기</v-btn>
                    </td>
                  </tr>
                  <tr v-if="friendRooms.length === 0">
                    <td colspan="3" class="text-center">
                      친구 채팅방이 없습니다.
                    </td>
                  </tr>
                </template>

                <!-- 그룹 채팅 -->
                <template v-else>
                  <tr v-for="chat in groupRooms" :key="chat.roomId">
                    <td>{{ chat.roomName }}</td>
                    <td>{{ chat.unReadCount }}</td>
                    <td>
                      <v-btn color="primary" @click="enterChatRoom(chat.roomId)"
                        >입장</v-btn
                      >
                      <v-btn
                        color="secondary"
                        @click="leaveChatRoom(chat.roomId)"
                        >나가기</v-btn
                      >
                    </td>
                  </tr>
                  <tr v-if="groupRooms.length === 0">
                    <td colspan="3" class="text-center">
                      매칭 그룹 채팅방이 없습니다.
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import axios from "axios";
export default {
  data() {
    return {
      tab: "friend", // 기본 탭
      friendRooms: [],
      groupRooms: [],
    };
  },
  async created() {
    const response = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/chatrooms/my/rooms`
    );
    const allRooms = response.data;

    // API 응답의 isGroupChat 값 확인 후 분리
    this.friendRooms = allRooms.filter(
      (chat) => chat.isGroupChat === "N" || chat.isGroupChat === false
    );
    this.groupRooms = allRooms.filter(
      (chat) => chat.isGroupChat === "Y" || chat.isGroupChat === true
    );
  },
  methods: {
    enterChatRoom(roomId) {
      this.$router.push(`/chatpage/${roomId}`);
    },
    async leaveChatRoom(roomId) {
      await axios.delete(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/chatrooms/group/${roomId}/leave`
      );
      this.groupRooms = this.groupRooms.filter((chat) => chat.roomId !== roomId);
    },
  },
};
</script>
