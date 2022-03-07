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
export default {
    name:'M-Home',
    setup(){
        // 获取vuex实例
        const store = useStore()
        // 获取 MapBoxRef DOM 对象
        const MapBoxRef = ref(null)
        // 获取 BodyContainer DOM 对象
        const BodyContainerRef = ref(null)
        // MapBoxRef 盒子的初始坐标
        let MapBoxRef_X = null
        let MapBoxRef_Y = null
        // 初始手指的坐标
        let finger_X = null
        let finger_Y = null
        // 判断是否是点击事件
        let is_click = null
        // 点击事件的开始事件和结束时间
        let startTimer = null
        let endTimer = null
        // 在mounted函数中对地图盒子注册监听事件
        onMounted(() => {
            // 1、注册 touchstart 事件
            MapBoxRef.value.addEventListener('touchstart',(e) => {
                // 是一个点击事件
                is_click = true
                // 记录开始事件
                MapBoxRef_X = e.target.offsetLeft
                MapBoxRef_Y = e.target.offsetTop
                finger_X = e.targetTouches[0].pageX
                finger_Y = e.targetTouches[0].pageY
            })
            // 2、注册 touchmove 事件
            MapBoxRef.value.addEventListener('touchmove',(e) => {
                // 如果触发了 touchmove，则不是一个点击事件
                is_click = false
                // 在 touchmove 事件中取消元素的过渡效果
                MapBoxRef.value.style.transition = 'none'
                MapBoxRef.value.style.left = MapBoxRef_X + (e.targetTouches[0].pageX - finger_X) + 'px'
                MapBoxRef.value.style.top = MapBoxRef_Y + (e.targetTouches[0].pageY - finger_Y) + 'px'
            })
            // 3、注册 touchend 事件
            MapBoxRef.value.addEventListener('touchend',(e) => {
                console.log('touchend')
            })
            // 4、将地图铺满整个屏幕
            // 4.1计算出高度的缩放比例 = 屏幕的高度 / 盒子的高度
            const scale = BodyContainerRef.value.offsetHeight / MapBoxRef.value.offsetHeight
            MapBoxRef.value.style.transition = 'all 0.5s'
            MapBoxRef.value.style.transform = `scale(${scale},${scale})`
        })
        // MapBoxRef盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片
            return {
                backgroundImage: `url(/floor_image/1777_1612_${store.getters.floor}层.png)`,
            }
        })
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