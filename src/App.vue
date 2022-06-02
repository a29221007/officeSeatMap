<template>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <component :is="Component" v-if="!$route.meta.keepAlive" />
    </router-view>
</template>

<script>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getUserInfo, getUserInfoFromOA } from '@/api/login.js'
// import eruda from 'eruda'
// eruda.init()
export default{
    name: 'App',
    setup() {

        const router = useRouter()
        const store = useStore()
        // 获取 search
        let search = window.location.search
        // 判断 进入的标识是否有值
        if(store.state.intoTheWay === 'OA'){
            router.push('/home?time=' + Date.now())
            return 
        }
        
        // 如果有参数的话，解析参数,最终解析成键值对的对象类型
        let SearchArray = search.slice(1).split('&')
        let searchObj = {}
        SearchArray.forEach(item => {
            searchObj[item.split('=')[0]] = item.split('=')[1]
        })

        // 如果没有参数，则跳转到 login 页面
        if(!search || (Object.keys(searchObj).length == 1 && Object.keys(searchObj)[0] == 'time')) {
            router.push('/login?time=' + Date.now())
            return
        }
        // 判断是否有state以及code参数
        if(searchObj.state && searchObj.code){
            // 如果有这两个参数,则说明是从企业微信点击应用图标过来的，或者是扫二维码进入的
            store.commit('setIntoTheWay','weixin')
            // 用 code 请求接口，返回用户个人信息
            getUserInfo(searchObj.code).then((res) => {
                if(res.code !== 0) {
                    return alert('登录失败，请重新进入或联系相关负责人')
                }
                store.commit('setUserInfo',res.data)
                if(searchObj.id){
                    store.commit('setScanQRcode',searchObj.id)
                }
                // 最后push到home页
                router.push('/home?time=' + Date.now())
            }).catch(error => {
                console.log('error',error)
            })
        }else if(searchObj.OpenAddress && searchObj.usercode && searchObj.token && searchObj.time){
            store.commit('setIntoTheWay','OA')
            // 如果有这三个参数，则说明是从 OA 进来的，要掉接口来获取用户信息
            getUserInfoFromOA(searchObj).then((res) => {
                if(res.code !== 0) {
                    return alert('登录失败，请重新进入或联系相关负责人')
                }
                store.commit('setUserInfo',res.data)
                // 最后push到home页
                router.push('/home?time=' + Date.now())
            }).catch(error => {
                console.log('error',error)
            })
        }else{
            store.commit('setIntoTheWay',null)
            // 如果没有这个两个参数，就提示登陆失败
            return alert('登录失败，请重新进入或联系相关负责人')
        }
    }
}
</script>
