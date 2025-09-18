<!-- HeaderComponent.vue -->
<template>
  <v-app-bar app dark>
    <v-container>
      <v-row align="center">
        <v-col class="d-flex justify-start">
          <v-btn :to="{path:'/friend/list'}">친구목록</v-btn>
          <v-btn :to="{path:'/chatrooms'}">채팅방목록</v-btn>
        </v-col>

        <v-col class="text-center">
          <v-btn :to="{path: '/'}">매칭 서비스</v-btn>
        </v-col>

        <v-col class="d-flex justify-end">
          <!-- ✅ 라우트로 이동 + 배지 -->
          <v-btn v-if="isLogin" :to="{path:'/api/v1/notification'}" class="relative">
            알림
            <span v-if="badgeCount>0" class="badge">{{ badgeCount }}</span>
          </v-btn>

          <v-btn v-if="isLogin" :to="{path:'/api/v1/chatrooms/list'}">MYCHATPAGE</v-btn>
          <v-btn v-if="!isLogin" :to="{path:'/auth/signup'}">회원가입</v-btn>
          <v-btn v-if="!isLogin" :to="{path:'/auth/login'}">로그인</v-btn>
          <v-btn v-if="isLogin" @click="doLogout">로그아웃</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
import axios from 'axios'

const API = 'http://localhost:8080'

export default {
  data(){
    return {
      isLogin: false,
      badgeCount: 0,
      es: null,
    }
  },
  created(){
    const token = localStorage.getItem("token");
    if (token) {
      this.isLogin = true
      this.bootstrapBadge()
      this.connectSSE()
    }
  },
  methods:{
    async bootstrapBadge() {
      try {
        const { data } = await axios.get(`${API}/api/v1/notifications/unread-count`)
        this.badgeCount = data?.count ?? 0
      } catch (e) { /* noop */ }
    },
    connectSSE() {
      const token = localStorage.getItem('token')
      this.es = new EventSource(`${API}/api/v1/sse/notifications?token=${encodeURIComponent(token||'')}`)
      this.es.addEventListener('match-confirmed', (e) => {
        this.badgeCount += 1       // 새 알림 → 배지 +1
        window.dispatchEvent(new CustomEvent('notifications:new', { detail: JSON.parse(e.data) }))
      })
      this.es.addEventListener('match-cancelled', (e) => {
      this.badgeCount += 1
      // 알림 페이지가 열려있으면 목록도 즉시 갱신하고 싶다면 브로드캐스트
      window.dispatchEvent(new CustomEvent('notifications:new', { detail: JSON.parse(e.data) }))
      })
      // 알림 페이지에서 전체 읽음이 일어나면 배지 0으로 만들라고 신호를 받을 수 있게 커스텀 이벤트 사용
      window.addEventListener('notifications:reset-badge', this.resetBadge)
    },
    resetBadge() { this.badgeCount = 0 },
    beforeUnmount(){ 
      if (this.es) this.es.close()
      window.removeEventListener('notifications:reset-badge', this.resetBadge)
    },
    doLogout(){
      localStorage.clear();
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.relative{ position:relative; }
.badge{
  position:absolute; top:-6px; right:-6px;
  min-width:18px; padding:2px 6px; border-radius:999px;
  background:#ef4444; color:#fff; font-size:12px; line-height:1; text-align:center;
}
</style>
