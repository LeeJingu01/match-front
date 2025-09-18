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
            // 기존의 채팅방이 있으면 return받고, 없으면 새롭게 생성된 roomId return.
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/chatrooms/private/create?otherNickname=${otherNickname}`);
            const roomId = response.data.items[0];
            this.$router.push(`/chatpage/${roomId}`);

        }
    }
}
</script>