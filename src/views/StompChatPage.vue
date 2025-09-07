<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-center text-h5">채팅</v-card-title>

          <v-card-text>
            <div class="chat-box">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="['chat-message', msg.senderNickname===senderNickname ? 'sent' : 'received']"
              >
                <strong>{{ msg.senderNickname }}: </strong> {{ msg.message }}
              </div>
            </div>

            <!-- 입력 영역: + 메뉴 / 입력 / 전송 -->
            <div class="input-row">
              <!-- + 버튼 -->
              <v-menu v-model="actionsMenu" :close-on-content-click="true">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-plus" variant="text" class="mr-1" />
                </template>

                <v-list>
                  <v-list-item @click="openCreateVote">
                    <v-list-item-title>투표 만들기</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openVoteList">
                    <v-list-item-title>진행 중 투표</v-list-item-title>
                  </v-list-item>
                  <v-list-item disabled>
                    <v-list-item-title>파일 첨부 (준비중)</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-text-field
                v-model="newMessage"
                label="메시지 입력"
                @keyup.enter="sendMessage"
                hide-details
                class="flex-1"
              />
              <v-btn color="primary" @click="sendMessage">전송</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- [D1] 투표 만들기 다이얼로그 -->
    <v-dialog v-model="createVoteDialog" max-width="520">
      <v-card>
        <v-card-title>투표 만들기</v-card-title>
        <v-card-text>
          <v-text-field v-model="newVote.title" label="제목 (예: 운동 시간 정하기)" />
          <v-textarea
            v-model="newVote.optionsText"
            label="옵션 (콤마 또는 줄바꿈으로 구분)"
            hint="예) 오전 8시, 오후 2시, 저녁 7시"
            persistent-hint
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createVoteDialog=false">취소</v-btn>
          <v-btn color="primary" @click="createVote">생성</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- [D2] 투표 목록 다이얼로그 -->
    <v-dialog v-model="voteListDialog" max-width="560">
      <v-card>
        <v-card-title>진행 중 투표</v-card-title>
        <v-card-text>
          <v-alert v-if="votes.length===0" type="info" variant="tonal">
            진행 중인 투표가 없습니다.
          </v-alert>

          <v-list v-else>
            <v-list-item
              v-for="v in votes"
              :key="v.voteId"
              :title="v.title"
              :subtitle="formatDate(v.createdAt)"
            >
              <template #append>
                <v-btn size="small" class="mr-2" @click="openCastVote(v)">투표</v-btn>
                <v-btn size="small" variant="tonal" @click="openResult(v)">결과 보기</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="voteListDialog=false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- [D3] 투표하기 다이얼로그 -->
    <v-dialog v-model="castDialog" max-width="520">
      <v-card>
        <v-card-title>{{ activeVote?.title }}</v-card-title>
        <v-card-text>
          <v-radio-group v-model="selectedOption">
            <v-radio
              v-for="opt in parsedOptions(activeVote)"
              :key="opt"
              :label="opt"
              :value="opt"
            />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="castDialog=false">취소</v-btn>
          <v-btn color="primary" :disabled="!selectedOption" @click="castVote">투표하기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- [D4] 결과 보기 다이얼로그 -->
    <v-dialog v-model="resultDialog" max-width="520">
      <v-card>
        <v-card-title>{{ activeVote?.title }} - 결과</v-card-title>
        <v-card-text>
          <div v-if="Object.keys(voteResult).length===0">아직 결과가 없습니다.</div>
          <div v-else class="space-y-2">
            <div v-for="opt in parsedOptions(activeVote)" :key="opt" class="mb-2">
              <div class="d-flex align-center justify-space-between mb-1">
                <span>{{ opt }}</span>
                <b>{{ voteResult[opt] || 0 }}</b>
              </div>
              <v-progress-linear
                :model-value="percent(opt)"
                height="10"
                rounded
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="resultDialog=false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import axios from 'axios';

export default{
    data(){
        return {
            messages: [],
            newMessage: "",
            stompClient: null,
            token: "",
            senderNickname: null,
            roomId: null,
            // + 메뉴/투표
            actionsMenu: false,

            createVoteDialog: false,
            voteListDialog: false,
            castDialog: false,
            resultDialog: false,

            newVote: { title: "", optionsText: "" },
            votes: [],                 // [{voteId,title,options,createdAt}]
            activeVote: null,          // 현재 선택된 투표
            selectedOption: null,
            voteResult: {},            // {옵션: 카운트}
        }
    },
    async created(){
        this.senderNickname = localStorage.getItem("nickname");
        this.roomId = this.$route.params.roomId;
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/chatrooms/history/${this.roomId}`);
        this.messages = response.data;
        this.connectWebsocket();
    },
     // 사용자가 현재 라우트에서 다른 라우트로 이동하려고 할때 호출되는 훅함수
    beforeRouteLeave(to, from, next) {
        this.disconnectWebSocket();
        next();
    },
    // 화면을 완전히 꺼버렸을때
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    methods: {
        connectWebsocket(){
            if(this.stompClient && this.stompClient.connected) return;
            // sockjs는 websocket을 내장한 향상된 js 라이브러리. http엔드포인트 사용.
            const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/ws/chat`)
            this.stompClient = Stomp.over(sockJs);
            this.token = localStorage.getItem("token");
            this.stompClient.connect({
                Authorization: `Bearer ${this.token}`

            },
                ()=>{
                    console.log("✅ WebSocket 연결 성공");
                    this.stompClient.subscribe(`/sub/chat/${this.roomId}`, (message) => {
                        const parseMessage = JSON.parse(message.body)
                        this.messages.push(parseMessage);
                        this.scrollToBottom();
                    },{Authorization: `Bearer ${this.token}`})
                }
            )
        },
        sendMessage(){
            if(this.newMessage.trim() === "")return;
            const message = {
                senderNickname: this.senderNickname,
                message: this.newMessage
            }
            this.stompClient.send(`/pub/chat/${this.roomId}`, JSON.stringify(message));
            this.newMessage = ""
        },
        scrollToBottom(){
            this.$nextTick(()=>{
                const chatBox = this.$el.querySelector(".chat-box");
                chatBox.scrollTop = chatBox.scrollHeight;
            })
        },
        async disconnectWebSocket(){
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/chatrooms/${this.roomId}/read`);
            if(this.stompClient && this.stompClient.connected){
                this.stompClient.unsubscribe(`/sub/chat/${this.roomId}`);
                this.stompClient.disconnect();
            }
        },
        openCreateVote() {
            this.actionsMenu = false
            this.createVoteDialog = true
            },
        async createVote() {
            const options = this.newVote.optionsText
                .split(/[\n,]/)
                .map(s => s.trim())
                .filter(Boolean)

            if (!this.newVote.title || options.length === 0) return

            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/chatrooms/${this.roomId}`, {
                title: this.newVote.title,
                options
            })

            this.createVoteDialog = false
            this.newVote = { title: "", optionsText: "" }
            this.openVoteList()  // 방금 만든 거 보이게
            },

        async openVoteList() {
            this.actionsMenu = false
            // 투표 목록 조회
            const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/chatrooms/${this.roomId}`)
            this.votes = data
            this.voteListDialog = true
            },

        openCastVote(vote) {
            this.activeVote = vote
            this.selectedOption = null
            this.castDialog = true
            },
        async castVote() {
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/${this.activeVote.voteId}/vote`, {
                selectedOption: this.selectedOption
            })
            this.castDialog = false
            // 투표 후 곧바로 결과 확인하도록
            await this.openResult(this.activeVote)
            },

        async openResult(vote) {
            this.activeVote = vote
            const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/${vote.voteId}/results`)
            this.voteResult = data
            this.resultDialog = true
            },

            parsedOptions(vote) {
            if (!vote || !vote.options) return []
            if (Array.isArray(vote.options)) {
                return vote.options // 이미 배열이면 그대로 사용
            }
            try {
                return JSON.parse(vote.options) // 문자열이면 파싱
            } catch {
                return []
            }
            },
            percent(opt) {
            const counts = Object.values(this.voteResult || {}).reduce((a, b) => a + b, 0)
            if (counts === 0) return 0
            return Math.round(((this.voteResult[opt] || 0) / counts) * 100)
            },
            formatDate(dt) {
            // createdAt 직렬화가 문자열이면 그대로, epoch면 변환
            try { return new Date(dt).toLocaleString() } catch { return dt }
    }
}
}
</script>
<style>
.chat-box{
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
}
.chat-message{
    margin-bottom:10px;
}
.sent{
    text-align:right;
}
.received{
    text-align:left;
}
.input-row {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
.input-row .flex-1 {
  flex: 1;
}

</style>