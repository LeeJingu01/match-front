import { createRouter, createWebHashHistory } from "vue-router"
import MemberCreate from "@/views/MemberCreate.vue"
import LoginPage from "@/views/LoginPage.vue"
import FriendList from "@/views/FriendList.vue"


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
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;