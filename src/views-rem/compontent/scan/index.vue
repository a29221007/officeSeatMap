<template>
    <div class="scan" v-on:touchstart="handleTouchstart" v-on:touchmove="handleTouchmove" v-on:touchend ="handleTouchend">
        <i class="iconfont oamap-saoyisao"></i>
    </div>
</template>

<script>
import { onMounted } from 'vue'
export default {
    name:'scan',
    setup() {
        // 判断是点击还是移动
        let flag = 'click' // 默认是点击
        // 手指在元素内的坐标
        let touch_x = 0
        let touch_y = 0
        // DOM 元素 scan
        let scan = null
        onMounted(() => {
            scan = document.querySelector('.scan')
        })
        // 元素开始触摸事件
        function handleTouchstart(e) {
            // 开始触摸时，要记录手指在元素内的坐标
            touch_x = e.targetTouches[0].pageX - scan.offsetLeft
            touch_y = e.targetTouches[0].pageY - scan.offsetTop
            // 将事件恢复成 'click'
            flag = 'click'
        }
        // 元素移动事件
        function handleTouchmove(e) {
            // 如果发生了移动，则将 flag 设置为 'move'
            flag = 'move'
            scan.style.left = e.targetTouches[0].pageX - touch_x + 'px'
            scan.style.top = e.targetTouches[0].pageY - touch_y + 'px'
        }
        // 元素触摸结束事件
        function handleTouchend() {
            console.log('flag',flag)
        }
        return {
            handleTouchstart,
            handleTouchmove,
            handleTouchend
        }
    }
}
</script>

<style lang="less" scoped>
.scan{
    position: fixed;
    right: 1%;
    bottom: 40%;
    width: 1.0753rem;
    height: 1.0753rem;
    line-height: 1.0753rem;
    text-align: center;
    background-color: rgb(0, 0, 0);
    border-radius: 10px;
    opacity: 0.8;
    .oamap-saoyisao{
        color: #fff;
        font-size: .6452rem;
    }
}
</style>