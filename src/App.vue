<template>
    <LayOut></LayOut>
</template>

<script>
import { provide } from 'vue'
// 导入布局组件layout
import LayOut from './views/layout'
// 导入获取浏览器可视区的宽高
import getClient from './utils/getClient.js'
export default {
    name:'App',
    components:{
        LayOut
    },
    setup() {
        // 获取当前浏览器可视区的大小
        const obj = getClient()
        // 依赖注入
        provide('clent',obj)
    }
}
</script>
