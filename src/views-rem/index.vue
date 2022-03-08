<template>
    <!-- 设置一个版心容器 -->
    <div ref="BodyContainerRef" class="body-container">
        <!-- 中间用标准流布局展示地图 -->
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <template v-for="item in mapList" :key="item.id">
                <!-- 座位 -->
                <div class="seat" v-on:touchstart="handleTapSeat" :id="item.seat_id" :style="seatItemStyle(item)">
                </div>
            </template>
        </div>
        <!-- 底部用固定定位的盒子展示楼层图例还有搜索 -->
    </div>
</template>

<script>
import {ref, computed, toRefs, reactive, onMounted} from 'vue'
import { useStore } from 'vuex'
import AlloyFinger from 'alloyfinger'
export default {
    name:'M-Home',
    setup(){
        // 获取vuex实例
        const store = useStore()
        // 获取 MapBoxRef DOM 对象
        const MapBoxRef = ref(null)
        // 获取 BodyContainer DOM 对象
        const BodyContainerRef = ref(null)
        // MapBox 盒子的初始坐标
        let MapBox_X = null
        let MapBox_Y = null
        // 初始手指的坐标
        let finger_X = null
        let finger_Y = null
        // MapBox 盒子的初始缩放比例1
        let scale_init_x = 1
        let scale_init_y = 1
        // 在mounted函数中对地图盒子注册监听事件
        onMounted(() => {
            // 1、将地图铺满整个屏幕
            // 1.1计算出高度的缩放比例 = 屏幕的高度 / 盒子的高度
            const scale = BodyContainerRef.value.offsetHeight / MapBoxRef.value.offsetHeight
            MapBoxRef.value.style.transition = 'all 0.5s'
            scale_init_x = scale
            scale_init_y = scale
            MapBoxRef.value.style.transform = `scale(${scale_init_x},${scale_init_y})`
            // 2、监听 MapBox 地图盒子的各种事件
            // 2.1 实例化 AlloyFinger 这个构造函数，并将地图盒子的DOM元素传递进去
            let MapBox = new AlloyFinger(MapBoxRef.value,{})
            // 2.2 监听 MapBox 盒子的 tap 事件
            MapBox.on('touchStart', MapBoxTouchStartFn)
            // 2.3 监听 MapBox 盒子的 touchStart 事件
            MapBox.on('tap', MapBoxTapFn)
            // 2.4 监听 MapBox 盒子的 doubleTap 事件
            MapBox.on('doubleTap', MapBoxDoubleTapFn)
            // 2.5 监听 MapBox 盒子的 pinch 事件
            MapBox.on('pinch', MapBoxPinchFn)
            // 2.6 监听 MapBox 盒子的 pressMove 事件
            MapBox.on('pressMove', MapBoxPressMoveFn)
            // 2.7 监听 MapBox 盒子的 touchEnd 事件
            MapBox.on('touchEnd', MapBoxTouchEndFn)
        })
        // MapBox 盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片
            return {
                backgroundImage: `url(/floor_image/1777_1612_${store.getters.floor}层.png)`,
            }
        })
        // MapBox盒子 touchStart 事件的处理函数
        function MapBoxTouchStartFn(e) {
            // 记录 MapBox 盒子的初始位置 offsetLeft 和 offsetTop
            MapBox_X = e.target.offsetLeft
            MapBox_Y = e.target.offsetTop
            // 记录手指触摸时的初始坐标
            finger_X = e.targetTouches[0].pageX
            finger_Y = e.targetTouches[0].pageY
        }
        // MapBox盒子 tap 事件的处理函数
        function MapBoxTapFn() {

        }
        // MapBox盒子 doubleTap 事件的处理函数
        function MapBoxDoubleTapFn() {

        }
        // 触发 pinch 事件时首次 zoom 的值
        let firstZoomValue = 0
        // 触发 pinch 事件的次数
        let pinchCount = 0
        // MapBox盒子 pinch 事件的处理函数
        function MapBoxPinchFn(e) {
            if(timer) return
            pinchCount++
            if(pinchCount === 1){
                firstZoomValue = e.zoom
            }else{
                if(e.zoom > firstZoomValue){
                    scale_init_x += 0.5
                    scale_init_y += 0.5
                }else{
                    scale_init_x -= 0.5
                    scale_init_y -= 0.5
                }
                firstZoomValue = e.zoom
                if(scale_init_x < 0.75 || scale_init_x > 8) return
                MapBoxRef.value.style.transition = 'all 0.3s'
                MapBoxRef.value.style.transform = `scale(${scale_init_x},${scale_init_y})`
            }
        }
        // MapBox盒子 pressMove 事件的处理函数
        function MapBoxPressMoveFn(e) {
            // 取消元素的过渡效果
            MapBoxRef.value.style.transition = 'none'
            // 移动时要阻止浏览器的默认行为
            e.preventDefault()
            MapBoxRef.value.style.left = MapBox_X + (e.targetTouches[0].pageX - finger_X) + 'px'
            MapBoxRef.value.style.top = MapBox_Y + (e.targetTouches[0].pageY - finger_Y) + 'px'
        }
        // MapBox盒子 touchEnd 事件
        function MapBoxTouchEndFn() {
            firstZoomValue = 0
            pinchCount = 0
        }
        let seatData = reactive({
            // 人员信息座位集合
            mapList: computed(() => store.getters.FilterSeatListByLegend),
            // 当前选中的座位
            current:0,
            // 当前选中的区域
            currentAreaCode:'',
            // 设置每一个座位的样式
            seatItemStyle(seatItem) {
                return {
                    top:(seatItem.gRow * 9.64 + 23) / 93 +'rem',
                    left:(seatItem.gCol * 9.6 + 35) / 93 +'rem',
                    backgroundImage: `url(/legend-image/image${seatItem.type === '0' ? '0' : seatItem.type === '0-1' ? '1' : '2'}.png)`
                }
            },
            // 点击每一个座位
            handleTapSeat(e){
                e.stopPropagation()
            }
        })
        return {
            ...toRefs(seatData),
            MapBoxStyle,
            MapBoxRef,
            BodyContainerRef
        }
    }
}
</script>

<style lang="less" scoped>

// 设置版心的样式
.body-container{
    min-width: 320px;
    max-width: 930px;
    width: 10rem;
    margin: 0 auto;
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    background-color: #fff;
    // 地图盒子
    .map-box{
        position: absolute;
        width: 10rem;
        height: 9.0645rem;
        background-size: cover;
        background-repeat: no-repeat;
        transition: all 1s;
        .seat{
            position: absolute;
            z-index: 5;
            width: .086rem;
            height: .086rem;
            background-size: cover;
            background-repeat: no-repeat;
        }
    }
}
</style>