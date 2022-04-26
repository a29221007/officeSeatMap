<template>
    <div class="scan" v-on:touchstart="handleTouchstart" v-on:touchmove="handleTouchmove" v-on:touchend ="handleTouchend">
        <i class="iconfont oamap-saoyisao"></i>
    </div>
</template>

<script>
import { onMounted } from 'vue'
export default {
    name:'scan',
    setup(prop,{ emit }) {
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
        // 屏幕的宽度
        let clientWidth = document.documentElement.clientWidth
        // 屏幕的高度
        let clientHeight = document.documentElement.clientHeight
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
            // 计算出右边的最大值
            const maxRightValue = clientWidth - scan.offsetWidth
            // 计算出下面的最大值
            const maxBottomValue = clientHeight - scan.offsetHeight
            // 如果发生了移动，则将 flag 设置为 'move'
            flag = 'move'
            // 判断左右是否出界
            if((e.targetTouches[0].pageX - touch_x) <= 0){
                scan.style.left = 0
            }else if((e.targetTouches[0].pageX - touch_x) >= maxRightValue){
                scan.style.left = maxRightValue + 'px'
            }else{
                scan.style.left = e.targetTouches[0].pageX - touch_x + 'px'
            }

            // 判断上下是否出界
            if((e.targetTouches[0].pageY - touch_y) <= 0){
                scan.style.top = 0
            }else if((e.targetTouches[0].pageY - touch_y) >= maxBottomValue){
                scan.style.top = maxBottomValue + 'px'
            }else{
                scan.style.top = e.targetTouches[0].pageY - touch_y + 'px'
            }
        }
        // 元素触摸结束事件
        function handleTouchend() {
            // 触摸结束时，判断事件类型
            if(flag === 'click'){
                // 如果是点击事件,向父组件传递扫码事件
                emit('scanBarCode')
            }
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