import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // 首页
    // {
    //     path: '/',
    //     name: 'App',
    //     meta:{
    //         keepAlive:false,
    //         title:'加载中'
    //     },
    //     component: () => import(/* webpackChunkName: "home" */ '@/App.vue'),
    // },
    // 登录
    {
        path: '/login',
        name: 'login',
        meta:{
            keepAlive:false,
            title:'正在登录龙图办公区地图'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/login'),
    },
    // 主页
    {
        path: '/home',
        name: 'home',
        meta:{
            keepAlive:true,
            title:'龙图办公区地图'
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
    {
        path:'/BarCode',
        name:'BarCode',
        meta:{
            keepAlive:false,
            title:'固定资产信息'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/BarCodeInfo'),
    },
    {
        path:'/BarCodeNoPermission',
        name:'BarCodeNoPermission',
        meta:{
            keepAlive:false,
            title:'固定资产信息'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views-rem/BarCodeInfo/BarCodeNoPermission'),
    },
    {
        path:'/outerNet',
        name:'outerNet',
        meta:{
            keepAlive:false,
            title:'访问出错了'
        },
        component: () => import(/* webpackChunkName: "home" */ '@/outerNet.vue'),
    },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
    document.title = to.meta.title || '加载中'
})

export default router