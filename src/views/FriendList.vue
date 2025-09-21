<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="text-center text-h5">
                        친구목록
                    </v-card-title>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>닉네임</th>
                                    <th>채팅</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="member in memberList" :key="member.nickname">
                                    <td>{{member.nickname}}</td>
                                    <td>
                                        <v-btn color="primary" @click="startChat(member.nickname)">채팅하기</v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>

            </v-col>

        </v-row>

    </v-container>
</template>

<script>
import axios from 'axios';
export default{
    data(){
        return {
            memberList: []
        }
    },
    async created(){
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friends/list`);
        this.memberList = response.data;
    }
    ,
    methods:{

        async startChat(otherNickname){
            try {
                const { data } = await axios.post(
                `${process.env.VUE_APP_API_BASE_URL}/api/v1/chatrooms/private/create`,
                null,                                   // body 없음
                { params: { otherNickname } }           // ?otherNickname=...
                );

                const roomId = data?.items?.[0];
                if (!roomId) throw new Error('roomId가 없습니다.');

                // 드로어 방식: /chat?roomId=xxx 로 이동 → MyChatPage가 드로어 자동 오픈
                this.$router.push({ path: '/chat', query: { roomId } });
            } catch (e) {
                console.error('채팅 시작 실패:', e);
                alert('채팅을 시작할 수 없어요.');
            }

        }
    }
}
</script>