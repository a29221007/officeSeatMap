<template>
    <component :is="is_PC"></component>
</template>

<script>
// 调试工具
eruda.init()
import { provide,reactive,ref,toRefs } from 'vue'
// 导入PC端布局组件PCLayOut
import PCLayOut from './views/layout'
// 导入移动端的布局组件MLayout
import MLayOut from './views-rem'
// 导入获取浏览器可视区的宽高
import getClient from './utils/getClient.js'
import { useStore } from 'vuex'
// 导入获取座位信息的接口
// import { getSeatList } from '@/api/getSeatList'
// 导入获取区域信息的接口
import { getAreaList } from '@/api/getArea.js'
export default {
    name:'App',
    components:{
        PCLayOut,
        MLayOut
    },
    setup() {
        // 在App组件中初始化store中的状态
        const store = useStore()
        store.commit('setCurrentFloor','three')
        // store.dispatch('getSeatListOfthree')
        // store.dispatch('getSeatListOfFour')
        // store.dispatch('getAreaListOfThree')
        // store.dispatch('getAreaListOfFour')
        // let Seat_Area_List = reactive({
        //     // 3层的座位信息
        //     seatListOfthree:[],
        //     // 4层的座位信息
        //     seatListOfFour:[],

        //     // 3层的区域信息
        //     areaListOfThree: [],
        //     // 4层的区域信息
        //     areaListOfFour: [],

        // })
        // // 获取数据
        // async function getSeat_Area_List(){
        //     try{
        //         const {data:data1} = await getSeatList(3)
        //         Seat_Area_List.seatListOfthree = data1
        //     }catch(error){
        //         errorMessage(error)
        //     }
        // }
        // getSeat_Area_List()
        // 获取当前浏览器可视区的大小
        const obj = getClient()
        // 依赖注入
        provide('clent',obj)
        // 判断是pc端还是移动端的变量
        const is_PC = ref('MLayOut')
        // let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        // if(flag){
        //     is_PC.value = 'MLayOut'
        // }else{
        //     is_PC.value = 'PCLayOut'
        // }
        return {
            is_PC,
        }
    }
}
</script>
