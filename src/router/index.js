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
        path:'/Login',
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
        path:'/chatrooms/list',
        name: 'MyChatPage',
        component: MyChatPage
    },
    {
        path:'/notification',
        name: 'NotificationPage',
        component: NotificationPage
    },
    {
      path: '/chat',
      component: MyChatPage,
    }
    
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;