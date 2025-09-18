<!-- NotificationPage.vue -->
<template>
  <div>
    <div v-for="n in notifications" :key="n.notificationId ?? n.createdAt" :class="{unread: !n.readAt}">
      <div><b>{{ n.title }}</b></div>
      <div>{{ n.body }}</div>
      <small>{{ formatTime(n.createdAt) }}</small>
      <div>
        <button @click="openChat(n)" v-if="n.chatRoomId">채팅 열기</button>
        <button @click="deleteNotification(n.notificationId)">삭제</button>
      </div>
    </div>
    <div v-if="notifications.length === 0" class="empty">알림이 없습니다.</div>
  </div>
</template>

<script>
import axios from 'axios'
const API = 'http://localhost:8080'

export default {
  name: 'NotificationPage',
  data(){ return { notifications: [] } },
  methods: {
    formatTime(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return iso
      return d.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      })
    },
    async loadList(){
      const { data } = await axios.get(`${API}/api/v1/notifications`)
      this.notifications = data.items || []
    },
    async markAllRead(){
      // 1) 로컬 optimistic
      const now = new Date().toISOString()
      this.notifications.forEach(n => { if (!n.readAt) n.readAt = now })
      // 2) 헤더 배지 0으로
      window.dispatchEvent(new CustomEvent('notifications:reset-badge'))
      // 3) 서버 전체 읽음
      try { await axios.post(`${API}/api/v1/notifications/read-all`) } catch (e) { /* 실패시 다시 카운트 새로고침 등 선택 */ }
    },
    openChat(n){
      if (n.chatRoomId) this.$router.push(`/chatpage/${n.chatRoomId}`)
    },
  async deleteNotification(notificationId) {
    try {
      await axios.delete(`${API}/api/v1/notifications/${notificationId}`);
      this.notifications = this.notifications.filter(n => n.notificationId !== notificationId)
    } catch (e){
      console.error("알림 삭제 실패", e)
    }
  }
  },
  async mounted(){
    await this.loadList()
    await this.markAllRead()   // ✅ 페이지 들어오면 즉시 전체 읽음
  }
}
</script>

<style scoped>
.unread{ background:#f8fbff; }
.empty{ color:#6b7280; padding:16px; }
</style>
