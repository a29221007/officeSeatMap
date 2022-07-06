<template>
    <component :is="is_PC"></component>
</template>

<script>
import { provide, ref } from 'vue'
// 导入PC端布局组件PCLayOut
import PCLayOut from '../views/layout'
// 导入移动端的布局组件MLayout
import MLayOut from '../views-rem'
// 导入获取浏览器可视区的宽高
import getClient from '../utils/getClient.js'
import { useStore } from 'vuex'
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
            console.log('max',Math.max(10,10))
            // 3楼片区
            let partList = []
            // 3楼部门区域
            let departmentList = []
            // 对片区的数据结构改造
            store.state.areaListOfThree.filter(item => item.diff === 2).forEach(item => {
                if(Object.prototype.toString.call(item.coordinate) === '[object Array]'){
                    const {code,diff,floor,location,name,office,total} = item
                    item.coordinate.forEach(item2 => {
                        partList.push({
                            code,diff,floor,location,name,office,total,coordinate:item2
                        })
                    })
                }else if(Object.prototype.toString.call(item.coordinate) === '[object Object]'){
                    partList.push(item)
                }
            })
            // 对部门的数据结构改造
            store.state.areaListOfThree.filter(item => item.diff === 1 && item.type === 2).forEach(item => {
                if(Object.prototype.toString.call(item.coordinate) === '[object Array]'){
                    console.log(item)
                    const {code,diff,floor,location,name,office} = item
                    item.coordinate.forEach(item2 => {
                        departmentList.push({
                            code,diff,floor,location,name,office,coordinate:item2
                        })
                    })
                }else if(Object.prototype.toString.call(item.coordinate) === '[object Object]'){
                    departmentList.push(item)
                }
            })
            // 3层for循循环
            // 最外层循环的是片区
            let array = [{
                part_code:'',
                part_name:'',
                depart_code:'',
                "片区内的坐标":{"top":0,"left":0,"width":0,height:''}
            }]
            // 外层循环片
            partList.forEach(part_item => {
                // 内层循环部门
                departmentList.forEach(depart_item => {
                    // 判断当前的片和当前的部门关系
                    // 1、4个X坐标,前两个是片区的两个横坐标，后两个是部门的两个横坐标
                    const X1 = part_item.coordinate.left
                    const X2 = part_item.coordinate.left + part_item.width
                    const X3 = depart_item.coordinate.left
                    const X4 = depart_item.coordinate.left + depart_item.width
                    // 、两个区域分离，这种情况不统计

                })
            })
        })
        store.dispatch('getSeatListOfShenZhen')
        store.dispatch('getAreaListOfShenZhen')
        // 获取当前浏览器可视区的大小
        const obj = getClient()
        // 依赖注入
        provide('clent',obj)
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
