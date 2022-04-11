import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // 首页
    {
        path: '/',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '@/view-home'),
    },
    // 移动端 - 会议室预约预定记录页面
    {
        path:'/meetingRoomHistory',
        name:'meetingRoomHistory',
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/MeetingRoomHistory'),
    },
    // 移动端 - 个人固资信息展示
    {
        path:'/fixedAssets',
        name:'fixedAssets',
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/FixedAssets'),
    },
    // 移动端 - 会议室空闲时，没有预定记录
    {
        path:'/meetingRoomFree',
        name:'meetingRoomFree',
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/MeetingRoomHistory/meetingRoomFree'),
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router