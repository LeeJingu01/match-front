import { createRouter, createWebHashHistory } from "vue-router"
import MemberCreate from "@/views/MemberCreate.vue"
import LoginPage from "@/views/LoginPage.vue"
import FriendList from "@/views/FriendList.vue"
import SimpleWebsocket from "@/views/SimpleWebsocket.vue"
import StompChatPage from "@/views/StompChatPage.vue"
import GroupChattingList from "@/views/GroupChattingList.vue"
import MyChatPage from "@/views/MyChatPage.vue"
import NotificationPage from "@/views/NotificationPage.vue"



const routes = [
    {
        path:'/auth/signup',
        name: 'MemberCreate',
        component: MemberCreate
    },
    {
        path:'/auth/login',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path:'/friend/list',
        name: 'FriendList',
        component: FriendList
    },
    {
        path:'/simple/chat',
        name: 'SimpleWebsocket',
        component: SimpleWebsocket
    },
    {
        path:'/chatpage/:roomId',
        name: 'StompChatPage',
        component: StompChatPage
    },
    {
        path:'/chatrooms',
        name: 'GroupChattingList',
        component: GroupChattingList
    },
    {
        path:'/api/v1/chatrooms/list',
        name: 'MyChatPage',
        component: MyChatPage
    },
    {
        path:'/api/v1/notification',
        name: 'NotificationPage',
        component: NotificationPage
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;