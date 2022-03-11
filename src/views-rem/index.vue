<template>
    <!-- 设置一个版心容器，里面放地图 -->
    <div ref="BodyContainerRef" class="body-container">
        <!-- 中间用标准流布局展示地图 -->
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <template v-for="item in mapList" :key="item.id">
                <template v-if="item.type === 1 || item.type === 2 || item.type === 3">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 区域 -->
                        <div :id="item.code + item.id" :class="[item.code,{'active-area':currentAreaCode === item.code},'area']" :style="{
                            position: 'absolute',
                            top:(item.coordinate.top / 1612 * 843) / 93 + 'rem',
                            left:(item.coordinate.left / 1777 * 930) / 93 + 'rem',
                            width:(item.coordinate.width / 1777 * 930) / 93 + 'rem',
                            height: (item.coordinate.height / 1612 * 843) / 93 + 'rem',
                            backgroundColor: item.backgroundcolor,
                            color:'#646464'
                        }">
                            <div class="title">
                                <span class="name">{{item.name}}</span>
                                <span v-if="item.subtitle && item.type !== 3 && item.subtitle !== '（部门）' && item.subtitle !== '（会议室）'" class="subtitle">{{item.subtitle}}</span>
                            </div>
                        </div>
                    </template>
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Array]'">
                        <template v-for="(item2,index) in item.coordinate">
                            <!-- 区域 -->
                            <div :id="item.code + index" :class="[item.code,{'active-area':currentAreaCode === item.code},'area']" :style="{
                                position: 'absolute',
                                top:(item2.top / 1612 * 843) / 93 + 'rem',
                                left:(item2.left / 1777 * 930) / 93 + 'rem',
                                width:(item2.width / 1777 * 930) / 93 + 'rem',
                                height: (item2.height / 1612 * 843) / 93 + 'rem',
                                backgroundColor: item.backgroundcolor,
                                color:'#646464'
                            }">
                                <div class="title" v-if="item2.show_area_name">
                                    <span class="name">{{item.name}}</span>
                                    <span v-if="item.subtitle && item.type !== 3 && item.subtitle !== '（部门）' && item.subtitle !== '（会议室）'" class="subtitle">{{item.subtitle}}</span>
                                </div>
                            </div>
                        </template>
                    </template>
                </template>
                <template v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                    <!-- 座位 -->
                    <div class="seat" v-on:touchstart="handleTapSeat" :id="item.seat_id" :style="seatItemStyle(item)">
                    </div>
                </template>
            </template>
        </div>
    </div>
    <!-- 底部搜索组件 -->
    <Search></Search>
</template>

<script>
import {ref, computed, toRefs, reactive, onMounted} from 'vue'
import { useStore } from 'vuex'
import AlloyFinger from 'alloyfinger'
// 导入底部搜索组件
import Search from './compontent/scarch.vue'
export default {
    name:'M-Home',
    components:{
        Search
    },
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

        // 互锁变量
        let a = true
        // 在mounted函数中对地图盒子注册监听事件
        onMounted(() => {
            // 1、将地图铺满整个屏幕
            // 1.1计算出高度的缩放比例 = 屏幕的高度 / 盒子的高度
            const scale = BodyContainerRef.value.offsetHeight / MapBoxRef.value.offsetHeight
            scale_init_x = scale
            scale_init_y = scale
            MapBoxScaleFn(0.5)
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
            MapBox_X = MapBoxRef.value.offsetLeft
            MapBox_Y = MapBoxRef.value.offsetTop
            // 记录手指触摸时的初始坐标
            finger_X = e.targetTouches[0].pageX
            finger_Y = e.targetTouches[0].pageY
        }
        // MapBox盒子 tap 事件的处理函数
        function MapBoxTapFn() {
        }
        // MapBox盒子 doubleTap 事件的处理函数
        function MapBoxDoubleTapFn() {
            scale_init_x += 2
            scale_init_y += 2
            MapBoxScaleFn(0.3)
        }
        // 触发 pinch 事件时首次 zoom 的值
        let firstZoomValue = 0
        // 触发 pinch 事件的次数
        let pinchCount = 0
        // MapBox盒子 pinch 事件的处理函数
        function MapBoxPinchFn(e) {
            if(!a) return
            pinchCount++
            if(pinchCount === 1){
                firstZoomValue = e.zoom
            }else{
                scale_init_x += (e.zoom - firstZoomValue) * 2 
                scale_init_y += (e.zoom - firstZoomValue) * 2
                firstZoomValue = e.zoom
                MapBoxScaleFn(0.5)
            }
        }
        // MapBox盒子 pressMove 事件的处理函数
        function MapBoxPressMoveFn(e) {
            if(!a) return
            // 取消元素的过渡效果
            MapBoxRef.value.style.transition = 'none'
            // 移动时要阻止浏览器的默认行为
            e.preventDefault()
            MapBoxRef.value.style.left = MapBox_X + (e.targetTouches[0].pageX - finger_X) + 'px'
            MapBoxRef.value.style.top = MapBox_Y + (e.targetTouches[0].pageY - finger_Y) + 'px'
        }
        // MapBox盒子 touchEnd 事件
        function MapBoxTouchEndFn() {
            a = false
            firstZoomValue = 0
            pinchCount = 0
            setTimeout(() => {a = true},200)
        }
        //  MapBox盒子缩放的函数
        function MapBoxScaleFn(timer){
            if(scale_init_x < 0.75) {
                scale_init_x = 0.75
                scale_init_y = 0.75
            }
            if(scale_init_x > 8) {
                scale_init_x = 8
                scale_init_y = 8
            }
            MapBoxRef.value.style.transition = `all ${timer}s`
            MapBoxRef.value.style.transform = `scale(${scale_init_x},${scale_init_y})`
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
                // 阻止冒泡
                e.stopPropagation()
                // 1、首先计算出触摸时当前盒子距离 BodyContainerRef 盒子的距离
                let MapContainerRef_x = e.target.offsetLeft + MapBoxRef.value.offsetLeft
                let MapContainerRef_y = e.target.offsetTop + MapBoxRef.value.offsetTop
                // 2、得到MapContainerRef盒子的宽、高 / 2 (得到一半的值)
                BodyContainerRef.value.offsetWidth / 2
                BodyContainerRef.value.offsetHeight / 2
                // 3、得到了视图应该移动的距离
                let valueX = MapContainerRef_x - (BodyContainerRef.value.offsetWidth / 2)
                let valueY = MapContainerRef_y - (BodyContainerRef.value.offsetHeight / 2)
                // 4、设置MapBoxRef盒子的位置
                MapBoxRef.value.style.left = (MapBoxRef.value.offsetLeft - valueX) + 'px'
                MapBoxRef.value.style.top = (MapBoxRef.value.offsetTop - valueY) + 'px'
                // 5、设置缩放的中心点，放大地图
                MapBoxRef.value.style.transformOrigin = `${e.target.offsetLeft}px ${e.target.offsetTop}px`
                scale_init_x = 4
                scale_init_y = 4
                MapBoxScaleFn(0.5)
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
    background-color: #f3f4f6;
    // 地图盒子
    .map-box{
        position: absolute;
        width: 10rem;
        height: 9.0645rem;
        background-size: cover;
        background-repeat: no-repeat;
        transition: all 0.5s;
        .area{
            font-size: .129rem;
        }
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