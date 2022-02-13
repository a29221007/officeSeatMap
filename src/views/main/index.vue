<template>
    <div ref="MapContainerRef" class="map-container">
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <div class="seat" :id="seatItem.seat_id" :class="{'active':current === seatItem.seat_id}" v-for="seatItem in seatList" :key="seatItem.seat_id" v-on:click="handleClickSeat(seatItem,$event)" :style="seatItemStyle(seatItem)"></div>
        </div>
    </div>
</template>

<script>
import {ref,computed,onMounted,onBeforeUnmount, reactive,toRefs} from 'vue'
import { useStore } from 'vuex'
// 导入获取鼠标在盒子内的坐标函数
import getMouseX_Y from '@/utils/getmouseX_Y.js'
export default {
    name:'layout',
    setup(){
        const store = useStore()
        // 人员座位信息
        let seatData = reactive({
            // 人员信息座位集合
            seatList: computed(() => {
                return store.state.currentFloor === 'three' ? store.state.seatListOfthree : store.state.seatListOfFour
            }),
            // 当前选中的座位
            current:0,
            // 设置每一个座位的样式
            seatItemStyle(seatItem) {
                return {
                    top:seatItem.gRow * 9.64 + 23 +'px',
                    left:seatItem.gCol * 9.6 + 35 +'px',
                    backgroundImage: `url(/legend-image/image${seatItem.type === '0' ? '0' : seatItem.type === '0-1' ? '1' : '2'}.png)`
                }
            }
        })
        // MapBoxRef盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片，后面页面初始化时要加入缩放的比例
            return {
                backgroundImage: `url(/floor_image/${store.getters.floor}rd_floor_cleaned.png)`
            }
        })
        // 鼠标点击每一个座位的事件处理函数
        function handleClickSeat(seatItem,$event){
            // 点击某一个座位将当前座位的seat_id赋值给current，将当前选中的座位高亮
            seatData.current = seatItem.seat_id
            // 然后设置过度属性，以及过渡时间
            MapBoxRef.value.style.transition = `all 1s`
            // 1、首先计算点击时鼠标距离MapContainerRef盒子的距离
            let MapContainerRef_x = $event.target.offsetLeft + MapBoxRef.value.offsetLeft
            let MapContainerRef_y = $event.target.offsetTop + MapBoxRef.value.offsetTop
            // 2、得到MapContainerRef盒子的宽、高 / 2 (得到一半的值)
            MapContainerRef.value.offsetWidth / 2
            MapContainerRef.value.offsetHeight / 2
            // 3、得到了视图应该移动的距离
            let valueX = MapContainerRef_x - (MapContainerRef.value.offsetWidth / 2)
            let valueY = MapContainerRef_y - (MapContainerRef.value.offsetHeight / 2)
            // 4、设置MapBoxRef盒子的位置
            MapBoxRef.value.style.left = (MapBoxRef.value.offsetLeft - valueX) + 'px'
            MapBoxRef.value.style.top = (MapBoxRef.value.offsetTop - valueY) + 'px'
            // 5、设置缩放的中心点，放大地图
            MapBoxRef.value.style.transformOrigin = `${$event.target.offsetLeft}px ${$event.target.offsetTop}px`
            MapBoxRef.value.style.transform = `scale(3)`
            // 6、将当前的sacle变量设置为300,这样的话，点击某一个座位后，再滚动滚轮就不会出现卡顿、地图移动的bug，这样更友好
            sacle = 300
        }
        // 创建地图容器的实例对象
        const MapBoxRef = ref(null)
        const MapContainerRef = ref(null)
        // 定义鼠标在地图内的坐标
        let x = null
        let y = null
        onMounted(() => {
            // 监听鼠标在MapBoxRef盒子内的按压事件
            MapBoxRef.value.addEventListener('mousedown', mouseDown)
            // 监听鼠标的弹起事件，移除对鼠标移动事件的监听
            document.addEventListener('mouseup', mouseUp)
            // chrome and ie
            MapBoxRef.value.addEventListener('mousewheel',handleScale)
            // firefox
            MapBoxRef.value.addEventListener("DOMMouseScroll",handleScale)
        })
        // 鼠标按下事件的处理程序
        function mouseDown(e) {
            // 监听鼠标按下事件，求出鼠标在盒子内坐标
            const {x:mouseX,y:mouseY} = getMouseX_Y(e,MapBoxRef.value,MapContainerRef.value)
            x = mouseX
            y = mouseY
            document.addEventListener('mousemove',mouseMove)
        }
        // 鼠标移动的事件处理程序
        function mouseMove(e){
            // 当发生mousemove事件时，对transition的属性值设置为unset
            MapBoxRef.value.style.transition = `unset`
            // 1、计算鼠标距离MapContainerRef距离
            let mouseToMapContainerX = e.pageX - MapContainerRef.value.offsetLeft
            let mouseToMapContainerY = e.pageY - MapContainerRef.value.offsetTop
            // 2、计算MapBoxRef盒子距离父盒子的坐标
            let _x = mouseToMapContainerX - x
            let _y = mouseToMapContainerY - y
            // 3、赋值
            MapBoxRef.value.style.left = _x + 'px'
            MapBoxRef.value.style.top = _y + 'px'
        }
        // 鼠标弹起的事件处理程序
        function mouseUp() {
            document.removeEventListener('mousemove',mouseMove)
        }
        // 监听鼠标滚轮滚动的事件
        function handleScale(e){
            // 当发生滚轮滚动事件时，对transition的属性值设置为unset
            MapBoxRef.value.style.transition = `unset`
            // 阻止默认行为
            e.preventDefault()
            // 鼠标滚轮的参数
            let value = e.wheelDelta ? e.wheelDelta : e.detail
            if(value === 120 || value === -3){
                // 执行放大的逻辑
                MapBoxAmplification(e)
            }else{
                // 指向缩小的逻辑
                MapBoxReduce(e)
            }
        }
        // 定义初始的缩放值100
        let sacle = 100
        function MapBoxAmplification (e){
            // 调用设置地图中心点的函数
            setTransformOrigin(e)
            if (sacle > 700) return
            sacle += 8
            MapBoxRef.value.style.transform = `scale(${sacle/100})`
        }
        function MapBoxReduce(e){
            // 调用设置地图中心点的函数
            setTransformOrigin(e)
            if(sacle < 40) return
            sacle -= 8
            MapBoxRef.value.style.transform = `scale(${sacle/100})`
        }
        // 设置地图缩放的中心点
        function setTransformOrigin(e){

        }
        // 在组件卸载时移除一些事件的监听
        onBeforeUnmount(() => {
            MapBoxRef.value.removeEventListener('mousedown', mouseDown)
            document.removeEventListener('mouseup', mouseUp)
            MapBoxRef.value.removeEventListener('mousewheel',handleScale)
            MapBoxRef.value.removeEventListener("DOMMouseScroll",handleScale)
        })
        return {
            ...toRefs(seatData),
            handleClickSeat,
            MapBoxRef,
            MapContainerRef,
            MapBoxStyle
        }
    }
}
</script>

<style lang="less" scoped>
.map-container{
    position: relative;
    width: 1200px;
    height: 845px;
    background-color: #f3f4f6;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    .map-box{
        position:absolute;
        width: 930px;
        height: 843px;
        background-size: cover;
        background-repeat: no-repeat;
        .seat{
            position: absolute;
            width: 8px;
            height: 8px;
            background-size: cover;
            background-repeat: no-repeat;
            &.active{
                // 使用动画
                animation: scaleAnimation 1s infinite alternate;
            }
        }
    }
    // 定义动画
    @keyframes scaleAnimation {
        to {
            transform:scale(3);
        }
    }
}
</style>