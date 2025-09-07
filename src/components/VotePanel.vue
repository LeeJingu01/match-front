<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center justify-space-between">
      투표
      <v-btn color="primary" @click="showCreate = true">투표 만들기</v-btn>
    </v-card-title>

    <!-- 목록 -->
    <v-card-text>
      <v-alert v-if="!votes.length" type="info" variant="tonal">진행 중인 투표가 없습니다.</v-alert>

      <v-list v-else lines="two" density="comfortable">
        <v-list-item
          v-for="v in votes"
          :key="v.voteId"
          class="mb-4"
        >
          <template #title>{{ v.title }}</template>
          <template #subtitle>생성: {{ formatDt(v.createdAt) }}</template>

          <div class="mt-2">
            <!-- 아직 투표 전 -->
            <div v-if="!v.voted">
              <v-radio-group v-model="v.selected">
                <v-radio
                  v-for="opt in v.options"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </v-radio-group>
              <v-btn :disabled="!v.selected" color="primary" @click="doVote(v)">투표</v-btn>
              <v-btn variant="tonal" class="ml-2" @click="loadResults(v)">결과 보기</v-btn>
            </div>

            <!-- 결과 -->
            <div v-else>
              <div v-for="row in v.resultRows" :key="row.opt" class="mb-3">
                <div class="d-flex justify-space-between mb-1">
                  <span>{{ row.opt }}</span>
                  <span>{{ row.count }} ({{ row.pct }}%)</span>
                </div>
                <v-progress-linear :model-value="row.pct" height="10" />
              </div>
              <v-btn variant="tonal" @click="loadResults(v)">새로고침</v-btn>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- 생성 다이얼로그 -->
    <v-dialog v-model="showCreate" width="560">
      <v-card>
        <v-card-title>새 투표 만들기</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" label="제목" />
          <div class="d-flex">
            <v-text-field
              v-model="newOpt"
              label="옵션 추가"
              @keyup.enter="addOption"
              class="mr-2"
            />
            <v-btn class="mt-2" @click="addOption">추가</v-btn>
          </div>
          <div>
            <v-chip
              v-for="(o,i) in form.options"
              :key="i"
              class="mr-2 mb-2"
              closable
              @click:close="removeOption(i)"
            >
              {{ o }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreate = false">취소</v-btn>
          <v-btn color="primary" :disabled="!canCreate" @click="createVote">생성</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  name: "VotePanel",
  props: {
    roomId: { type: Number, required: true },
  },
  data() {
    return {
      showCreate: false,
      votes: [],
      form: { title: "", options: [] },
      newOpt: "",
    };
  },
  async created() {
    
    await this.fetchVotes();
  },
  computed: {
    canCreate() {
      return this.form.title.trim() && this.form.options.length >= 2;
    },
  },
  methods: {
    formatDt(dt) {
      return new Date(dt).toLocaleString();
    },
    addOption() {
      const s = (this.newOpt || "").trim();
      if (!s) return;
      this.form.options.push(s);
      this.newOpt = "";
    },
    removeOption(i) {
      this.form.options.splice(i, 1);
    },
    async fetchVotes() {
      const { data } = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/chatrooms/${this.roomId}`
      );
      // 서버: Vote.options = JSON 문자열
      this.votes = data.map((v) => ({
        ...v,
        options: JSON.parse(v.options || "[]"),
        selected: "",
        voted: false,
        resultRows: [],
      }));
    },
    async createVote() {
      const { data } = await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/chatrooms/${this.roomId}`,
        {
          title: this.form.title,
          options: this.form.options,
        }
      );
      const v = {
        ...data,
        options: JSON.parse(data.options || "[]"),
        selected: "",
        voted: false,
        resultRows: [],
      };
      this.votes.unshift(v);
      this.showCreate = false;
      this.form = { title: "", options: [] };
    },
    async doVote(v) {
      await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/${v.voteId}/vote`,
        { selectedOption: v.selected }
      );
      v.voted = true;
      await this.loadResults(v);
    },
    async loadResults(v) {
      const { data } = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/vote/${v.voteId}/results`
      );
      const total = Object.values(data).reduce((a, b) => a + b, 0) || 0;
      v.resultRows = v.options.map((opt) => {
        const count = Number(data[opt] || 0);
        const pct = total ? Math.round((count * 100) / total) : 0;
        return { opt, count, pct };
      });
      v.voted = true; // 결과가 보이면 voted 상태로 취급
    },
  },
};
</script>
