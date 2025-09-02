import { createRouter, createWebHashHistory } from "vue-router"
import MemberCreate from "@/views/MemberCreate.vue"
import LoginPage from "@/views/LoginPage.vue"


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
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;