import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // 首页
    {
        path: '/',
        name: 'home',
        meta:{
            keepAlive:true,
            title:'OA-MAP-首页'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/view-home'),
    },
    // 移动端 - 会议室预约预定记录页面
    {
        path:'/meetingRoomHistory',
        name:'meetingRoomHistory',
        meta:{
            keepAlive:false,
            title:'预约记录'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/MeetingRoomHistory'),
    },
    // 移动端 - 个人固资信息展示
    {
        path:'/fixedAssets',
        name:'fixedAssets',
        meta:{
            keepAlive:false,
            title:'员工信息'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/FixedAssets'),
    },
    // 移动端 - 会议室空闲时，没有预定记录
    {
        path:'/meetingRoomFree',
        name:'meetingRoomFree',
        meta:{
            keepAlive:false,
            title:'预约记录'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/MeetingRoomHistory/meetingRoomFree'),
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
    document.title = to.meta.title
})

export default router