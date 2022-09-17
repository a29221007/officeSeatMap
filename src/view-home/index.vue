<template>
    <component :is="is_PC"></component>
</template>

<script>
import { provide, ref } from 'vue'
// 导入PC端布局组件PCLayOut
import PCLayOut from '../views/layout'
// 导入移动端的布局组件MLayout
import MLayOut from '../views-rem'
import { useStore } from 'vuex'
import statistical from '@/utils/statistical.js'
export default {
    name:'App',
    components:{
        PCLayOut,
        MLayOut
    },
    setup() {
        // 在App组件中初始化store中的状态
        const store = useStore()
        store.dispatch('getSeatListOfthree').then(() => {
            return store.dispatch('getSeatListOfFour')
        }).then(() => {
            return store.dispatch('getAreaListOfThree')
        }).then(() => {
            return store.dispatch('getAreaListOfFour')
        }).then(() => {
            return store.dispatch('getSeatListOfShenZhen')
        }).then(() => {
            return store.dispatch('getAreaListOfShenZhen')
        }).then(() => {
            const array = statistical(store.state.areaListOfThree,store.state.seatListOfthree,3).concat(statistical(store.state.areaListOfFour,store.state.seatListOfFour,4))
            array.forEach(item => {
                if(!partTotaleObject.value[item.part_code]){
                    partTotaleObject.value[item.part_code] = item.currentPartTotalSeat
                }
            })
        })
        const partTotaleObject = ref({})
        provide('partTotaleObject',partTotaleObject.value)
        // 判断是pc端还是移动端的变量
        const is_PC = ref('MLayOut')
        let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        if(flag){
            is_PC.value = 'MLayOut'
        }else{
            is_PC.value = 'PCLayOut'
        }
        return {
            is_PC
        }
    }
}
</script>
