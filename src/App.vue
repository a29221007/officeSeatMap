<template>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <component :is="Component" v-if="!$route.meta.keepAlive" />
    </router-view>
</template>

<script>
// 调试工具
eruda.init()
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getUserInfo } from '@/api/login.js'
export default{
    name: 'App',
    setup() {
        // const router = useRouter()
        // const store = useStore()
        // // 获取 search
        // let search = window.location.search
        // // 如果没有参数，则跳转到 login 页面
        // if(!search) {
        //     router.push('/login')
        //     return
        // }
        // 如果有参数的话，解析参数,最终解析成键值对的对象类型
        // let SearchArray = search.slice(1).split('&')
        // let searchObj = {}
        // SearchArray.forEach(item => {
        //     searchObj[item.split('=')[0]] = item.split('=')[1]
        // })
        // // 判断是否有state以及code参数 
        // if(searchObj.state && searchObj.code){
        //     // 如果有这两个参数,则用 code 请求接口，返回用户个人信息
        //     getUserInfo(searchObj.code).then((res) => {
        //         console.log('res',res)
        //         if(res.code !== 0) {
        //             return alert('登录失败，请重新进入或联系相关负责人')
        //         }
        //         store.commit('setUserInfo',res.data)
        //         // 判断是否有type、floor、seat_id这3个参数
        //         if(searchObj.type || searchObj.floor || searchObj.seat_id){
        //             // 如果有座位区域信息
        //             let obj = {
        //                 type: searchObj.type,
        //                 floor: searchObj.floor,
        //                 seat_id: searchObj.seat_id
        //             }
        //             store.commit('setScanQRcodeObject',obj)
        //         }
        //         // 最后push到home页
        //         router.push('/home')
        //     }).catch(error => {
        //         console.log('error',error)
        //     })
        // }else{
        //     // 如果没有这个两个参数，就提示登陆失败
        //     return alert('登录失败，请重新进入或联系相关负责人')
        // }
    }
}
</script>
