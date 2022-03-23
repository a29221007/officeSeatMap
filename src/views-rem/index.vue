<template>
    <!-- 设置一个版心容器，里面放地图 -->
    <div ref="BodyContainerRef" v-on:click="handleClickMap" class="body-container">
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
                        <template v-for="(item2,index) in item.coordinate" :key="item2.id">
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
                    <div class="seat" :class="{'active':current === item.seat_id}" v-on:click="handleClickSeat(item,$event)" :id="item.seat_id" :style="seatItemStyle(item)">
                    </div>
                </template>
            </template>
        </div>
    </div>
    <!-- 底部搜索相关组件 -->
    <BottomBox ref="BottomBoxRef" v-on:switchFloor="switchFloor"></BottomBox>
</template>

<script>
import {ref, computed, toRefs, reactive, onMounted, provide, onBeforeUnmount, nextTick, watch} from 'vue'
import { useStore } from 'vuex'
import AlloyFinger from 'alloyfinger'
// 导入底部搜索组件
import BottomBox from './compontent/bottomBox.vue'
export default {
    name:'M-Home',
    components:{
        BottomBox
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

        // 将实例化的对象从 onMounted 钩子函数中提取出来，用于卸载阶段解绑事件
        let BodyContainer = null
        let MapBox = null 
        watch([() => store.state.seatListOfthree, () => store.state.seatListOfFour, () => store.state.areaListOfThree, () => store.state.areaListOfFour],() => {
            if(store.state.seatListOfthree.length && store.state.seatListOfFour.length && store.state.areaListOfThree.length && store.state.areaListOfFour.length){
                // 3、根据 url 中的参数跳转到对应区域
                // 3.1 获取url中的参数
                let requestSearch = window.location.search
                // 3.2 判断是否有参数
                if(!requestSearch) return // 没有参数说明不是扫码进的项目,则不执行后续的逻辑
                let requestSearchArray = requestSearch.slice(1).split('&')
                let requestSearchObj = {
                    floor:3,
                    type:2,
                    seat_id:'QY0101030004'
                }
                // requestSearchArray.forEach(item => {
                //     requestSearchObj[item.split('=')[0]] = item.split('=')[1]
                // })
                // 3.3 设置扫码的楼层 (目前只有3层4层，如果以后，增加的话，这的逻辑得改)
                const floor = requestSearchObj.floor === 3 ? 'three' : 'four'
                store.commit('setCurrentFloor',floor)
                // 3.4 找出当前扫码查找的项，并向 vuex 设置
                let value = requestSearchObj.type === 1 ? 'seat_id' : 'code' // 匹配的字段
                // 3.5 找出当前项
                let FindArray = []
                if(requestSearchObj.floor === 3 && requestSearchObj.type === 1){
                    // 3层的座位
                    FindArray = store.state.seatListOfthree
                }else if(requestSearchObj.floor === 3 && requestSearchObj.type === 2){
                    // 3层的区域
                    FindArray = store.state.areaListOfThree
                }else if(requestSearchObj.floor === 4 && requestSearchObj.type === 1){
                    // 4层的座位
                    FindArray = store.state.seatListOfFour
                }else if(requestSearchObj.floor === 4 && requestSearchObj.type === 2){
                    // 4层的区域
                    FindArray = store.state.areaListOfFour
                }
                let item = FindArray.find(item => item[value] === requestSearchObj.seat_id)
                // 3.6 将当前项设置到 vuex 中
                store.commit('setActiveInfo',item)
                let searchLegend = document.querySelector('.search-legend')
                searchLegend.style.display = 'none'
                // 3.7 调用子组件的方法，将seaech组件显示出来
                BottomBoxRef.value.setSearchLegendContant('search')
                nextTick(() => {
                    BottomBoxRef.value.setSearchLegendContant('information')
                    BottomBoxRef.value.componentRef.searchArea(requestSearchObj.seat_id)
                    searchLegend.style.display = 'block'
                })
            }
        })
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
            // 将地图盒子的移动扩大到整个屏幕，不在是之前的手指放到地图上才能移动
            BodyContainer = new AlloyFinger(BodyContainerRef.value,{}) 
            MapBox = new AlloyFinger(MapBoxRef.value,{})
            // 2.2 监听 MapBox 盒子的 tap 事件
            BodyContainer.on('touchStart', MapBoxTouchStartFn)
            // 2.5 监听 MapBox 盒子的 pinch 事件
            MapBox.on('pinch', MapBoxPinchFn)
            // 2.6 监听 MapBox 盒子的 pressMove 事件
            BodyContainer.on('pressMove', MapBoxPressMoveFn)
            // 2.7 监听 MapBox 盒子的 touchEnd 事件
            BodyContainer.on('touchEnd', MapBoxTouchEndFn)
        })
        // MapBox 盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片
            return {
                backgroundImage: `url(/floor_image/1777_1612_${store.getters.floor}层.png)`,
            }
        })
        
        // 点击地图盒子触发的函数
        //点击次数
        let times = 0
        // 延时器二的id
        let timer2 = null
        function handleClickMap() {
            times++
            timer2 = setTimeout(() => {
                if(1 == times){
                    MapBoxTapFn()
                }else if(2 == times){
                    MapBoxDoubleTapFn()
                }
                times = 0
            }, 150)
        }
        // MapBox盒子 touchStart 事件的处理函数
        function MapBoxTouchStartFn(e) {
            // 记录 MapBox 盒子的初始位置 offsetLeft 和 offsetTop
            MapBox_X = MapBoxRef.value.offsetLeft
            MapBox_Y = MapBoxRef.value.offsetTop
            // 记录手指触摸时的初始坐标
            finger_X = e.targetTouches[0].pageX
            finger_Y = e.targetTouches[0].pageY
        }
        // 控制盒子伸缩的变量
        let scaling = true
        // MapBox盒子点击事件的处理函数
        function MapBoxTapFn() {
            let searchLegend = document.querySelector('.search-legend')
            let floorSwitch = document.querySelector('.floor-switch')

            let searchLegendHeight = searchLegend.offsetHeight
            let floorSwitchHeight = floorSwitch ? floorSwitch.offsetHeight : 0
            // 确定伸缩量
            let value1 = scaling ? searchLegendHeight + floorSwitchHeight : 0
            let value2 = scaling ? floorSwitchHeight : 0
            searchLegend.style.transition = `all 0.5s`
            if(floorSwitchHeight){
                floorSwitch.style.transition = `all 0.5s`
            }
            searchLegend.style.transform = `translate(-50%,${value1 + 'px'})`
            if(floorSwitchHeight){
                floorSwitch.style.transform = `translate(-50%,${value2 + 'px'})`
            }
            scaling = scaling ? false : true
        }
        // MapBox盒子双击事件的处理函数
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
        // 延时器一的id
        let timer1 = null
        // MapBox盒子 touchEnd 事件
        function MapBoxTouchEndFn() {
            a = false
            firstZoomValue = 0
            pinchCount = 0
            timer1 = setTimeout(() => {a = true},200)
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
        // 储存可见区域的高度
        let ClentHeight = ref(0)
        function setHeight(value) {
            ClentHeight.value = value
        }
        provide('upDataHeight',setHeight)
        // 获取 BottomBoxRef 实例
        const BottomBoxRef = ref(null)
        let seatData = reactive({
            mapList: computed(() => {
                // 3层的座位人员信息和区域会议室信息集合
                let seatAndAreaListOfThree = store.state.seatListOfthree.concat(store.state.areaListOfThree)
                // 4层的座位人员信息和区域会议室信息集合
                let seatAndAreaListOfFour = store.state.seatListOfFour.concat(store.state.areaListOfFour)
                // 点击图例筛选后的座位信息
                // 1、判断当前的楼层，选择出要做筛选的数组
                const currentFloorSeatList = store.state.currentFloor === 'three' ? seatAndAreaListOfThree : seatAndAreaListOfFour
                // 2、判断当前是否有选中的图例
                if(store.state.currentLegend){
                    // 3、如果有选中的图例
                    return currentFloorSeatList.filter((item) => {
                        return item.type === store.state.currentLegend || item.type === 2 || item.type === 3
                    })
                }else{
                    // 4、没有选中的图例，直接返回currentFloorSeatList
                    return currentFloorSeatList
                }
            }),
            // 当前选中的座位
            current:0,
            // 子组件发布的事件，切换路层后，将当前的选中座位和区域的高亮重置
            switchFloor(){
                seatData.current = 0
                seatData.currentAreaCode = ''
            },
            // 当前选中的区域
            currentAreaCode:'',
            // 设置当前选中的区域
            setCurrentAreaCode({code, scaleX, scaleY}) {
                seatData.currentAreaCode = code
                scale_init_x = scaleX
                scale_init_y = scaleY
                // 搜索区域时，将座位的高亮取消
                seatData.current = 0
            },
            // 设置每一个座位的样式
            seatItemStyle(seatItem) {
                return {
                    top:(seatItem.gRow * 9.64 + 23) / 93 +'rem',
                    left:(seatItem.gCol * 9.6 + 35) / 93 +'rem',
                    backgroundImage: `url(/legend-image/image${seatItem.type === '0' ? '0' : seatItem.type === '0-1' ? '1' : '2'}.png)`
                }
            },
            // 点击每一个座位
            handleClickSeat(seatItem,$event){
                // 阻止冒泡
                $event.stopPropagation()
                // 点击座位，将区域的高亮色，取消
                seatData.currentAreaCode = ''
                // 点击某一个座位将当前座位的seat_id赋值给current，将当前选中的座位高亮，再点击同一个座位取消高亮
                if(seatItem.seat_id === seatData.current){
                    return seatData.current = 0
                }else{
                    seatData.current = seatItem.seat_id
                }
                // 1、首先计算出触摸时当前盒子距离 BodyContainerRef 盒子的距离
                let MapContainerRef_x = $event.target.offsetLeft + MapBoxRef.value.offsetLeft
                let MapContainerRef_y = $event.target.offsetTop + MapBoxRef.value.offsetTop
                // 2、得到MapContainerRef盒子的宽、高 / 2 (得到一半的值)
                BodyContainerRef.value.offsetWidth / 2
                BodyContainerRef.value.offsetHeight / 2
                // 3、得到了视图应该移动的距离
                let valueX = MapContainerRef_x - (BodyContainerRef.value.offsetWidth / 2)
                let valueY = MapContainerRef_y - (ClentHeight.value / 2)
                // 4、设置MapBoxRef盒子的位置
                MapBoxRef.value.style.left = (MapBoxRef.value.offsetLeft - valueX) + 'px'
                MapBoxRef.value.style.top = (MapBoxRef.value.offsetTop - valueY) + 'px'
                // 5、设置缩放的中心点，放大地图
                MapBoxRef.value.style.transformOrigin = `${$event.target.offsetLeft}px ${$event.target.offsetTop}px`
                scale_init_x = 4
                scale_init_y = 4
                MapBoxScaleFn(0.5)
                // 6、调用子组件的方法，设置子组件的状态变量
                BottomBoxRef.value.setSearchLegendContant('information')
                // 7、设置选中项的数据
                store.commit('setActiveInfo',seatItem)
                // 8、修改之前的bug，（之前在 bottomBox-Information 信息展示组件中的 onMounted 钩子中，判断数据是否超过父盒子，如果超过，则做往复动画），现在将逻辑放到点击事件中，修复一些bug
                nextTick(() => {
                    // 关于元素滚动的逻辑
                    clearTimer()
                    obj = []
                    timer123 = null
                    let content = document.querySelectorAll('.scroll')
                    content.forEach((item) => {
                        // 当前节点的宽度
                        let currentNodeWidth = item.offsetWidth
                        // 当前节点父元素的宽度
                        let curentParentNdoeWidth = item.parentNode.offsetWidth
                        // 子元素和父元素的差值
                        let value = curentParentNdoeWidth - currentNodeWidth
                        if(value < 0){
                            timer123 = setTimeout(() => {
                                clearInterval(item.timer)
                                let target = Math.floor(value)
                                let leader = 0
                                item.timer = setInterval(() => {
                                    let step = 1
                                    if(Math.abs(leader - target) >= Math.abs(step)){
                                        step = leader > target ? -step : step
                                        leader = leader + step
                                        item.style.left = leader + 'px'
                                    }else{
                                        item.style.left = target + 'px'
                                        target = leader === 0 ? value : 0
                                    }
                                },200)
                                obj.push(item)
                            },1000)
                        }else{
                            item.style.left = 0
                        }
                    })
                    el = null
                    // 元素做展开、收回
                    el = document.querySelector('.over')
                    if(!el) return
                    if(el.scrollWidth > el.offsetWidth){
                        // 如果内容的宽度比盒子的宽度大，则向最后添加一个展开按钮
                        let span = document.createElement('span')
                        span.innerHTML = '展开'
                        span.style.float = 'right'
                        span.style.marginTop = '2px'
                        span.style.backgroundColor = '#f8f9fa'
                        span.style.color = '#1b1b1d'
                        span.style.borderRadius = '2px'
                        span.style.padding = '0.0538rem'
                        el.appendChild(span)
                        span.addEventListener('click',show)
                    }else{
                        el.style.overflow = 'hidden'
                    }
                })
            }
        })
        // 向子组件传递 switchFloor 事件，在切换图例时，也要触发改事件，将高亮的座位和区域重置
        provide('switchLenged',seatData.switchFloor)
        // 储存做动画元素，将来要清除元素上的定时器
        let obj = []
        // 这个是延时器的id
        let timer123 = null
        // 储存做展开、收起的元素
        let el = null
        // 展开、收起的函数
        function show(e){
            let value = e.target.innerHTML
            if(value === '展开'){
                el.style.whiteSpace = 'unset'
                e.target.innerHTML = '收起'
                el.style.overflow = 'auto'
            }else{
                el.style.whiteSpace = 'nowrap'
                e.target.innerHTML = '展开'
                el.style.overflow = 'hidden'
            }
        }
        // 定义一个清除定时器的函数，并通过 provide 传递给子组件，将来信息展示组件的销毁阶段要清除定时器，防止内存泄漏
        function clearTimer(){
            obj.forEach(item => {
                clearInterval(item.timer)
            })
            clearTimeout(timer123)
            if(el){
                el.querySelector('span') && el.querySelector('span').remove()
            }
        }
        // 向子组件传递清除定时器的方法
        provide('clear',clearTimer)

        // 向子组件传递设置区域高亮的方法
        provide('upCurrentAreaCode',seatData.setCurrentAreaCode)

        // 卸载阶段，事件解绑
        onBeforeUnmount(() => {
            // 1 卸载 MapBox 盒子的 tap 事件
            BodyContainer.off('touchStart', MapBoxTouchStartFn)
            // 2 卸载 MapBox 盒子的 pinch 事件
            MapBox.off('pinch', MapBoxPinchFn)
            // 3 卸载 MapBox 盒子的 pressMove 事件
            BodyContainer.off('pressMove', MapBoxPressMoveFn)
            // 4 卸载 MapBox 盒子的 touchEnd 事件
            BodyContainer.off('touchEnd', MapBoxTouchEndFn)

            // 清除延时器id
            clearTimeout(timer1)
            clearTimeout(timer2)
        })
        return {
            ...toRefs(seatData),
            MapBoxStyle,
            MapBoxRef,
            BodyContainerRef,
            handleClickMap,
            BottomBoxRef
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
            // 座位选中的高亮样式
            &.active{
                // 使用动画
                animation: scaleAnimation 1s infinite alternate;
            }
        }
        // 区域选中的高亮样式
        .active-area{
            background-color:rgba(255, 165, 0, 0.5)!important;
        }
        .title{
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
            text-align: center;
            span{
                display: inline-block;
                white-space:nowrap;
            }
            .name{
                transform: scale(0.85,0.9);
            }
            .subtitle{
                transform: scale(0.65,0.65);
            }
        }
        // 单独的样式覆盖掉之前的公共样式（3层）
        // 采购部库房、采购库房
        #QY010103004661,#QY010103004865{
            .title{
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 消防前室
        #QY010103005268{
            .title{
                top: unset;
                bottom: -0.0968rem;
            }
        }
        // 法务部&公共关系与政府事务部
        #QY010103005066{
            .title{
                top: unset;
                bottom: -0.0968rem;
                left: .7742rem;
            }
        }
        // it支持部、冰柠工作室
        #QY010103004762,#QY010103003838{
            .title{
                top: .0753rem;
            }
        }
        // 冰柠（AX项目组）
        #QY010103003737{
            .title{
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                right: -0.1183rem;
                left: unset;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
                .name{
                    margin-left: .086rem;
                }
            }
        }
        // 冰柠工作室（EOS项目组）、（余烬风暴项目组）、平台技术部
        #QY010103003939,#QY010103004040,#QY010103003131{
            .title{
                display: flex;
                align-items: center;
                left: -0.0753rem;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
                .name{
                    margin-right: .086rem;
                }
            }
        }
        // QA部
        #QY010103003030{
            .title{
                left: .043rem;
                top: 43%;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 平台技术部，it信息部
        #QY010103003131{
            .title{
                left: .0215rem;
            }
        }
        // 财务部
        #QY010103003232{
            .title{
                top: .043rem;
            }
        }
        // 人力资源部、薪酬福利咨询处
        #QY010103003434,#QY010103003333{
            .title{
                top: unset;
                bottom: -0.0968rem;
            }
        }
        // 行政小仓库
        #QY010103002727{
            .title{
                .name{
                    transform: scale(0.6, 0.7);
                }
            }
        }
        // HR咨询服务办公室
        #QY010103002828{
            .title{
                top: -0.0753rem;
                left: -0.086rem;
                transform: unset;
            }
        }
        // 媒介市场行政仓库
        #QY010103002323{
            .title{
                .name{
                    transform: scale(0.75,0.8);
                }
            }
        }
        // 一点咨询
        #QY010103002424{
            .title{
                top: unset;
                bottom: -0.0968rem;
            }
        }
        // 引擎平台部
        #QY01010300220{
            .title{
                left: 79%;
                top: unset;
                bottom: -0.129rem;
            }
        }
        // 采购部&商务支持部
        #QY010103002141{
            .title{
                left: 0;
                top: -0.3871rem;
                transform: unset;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
                .name{
                    transform: scale(0.85, 0.5);
                }
            }
        }
        // 媒介部、采购部&商务支持部
        #QY010103002020,#QY010103002121{
            .title{
                top: 64%;
            }
        }
        // 公司市场部、产品市场部、视觉创意部
        #QY010103001616,#QY010103001717,#QY010103001818{
            .title{
                top: 13%;
            }
        }
        // Frebird工作室(小)、运营部
        #QY010103004352,#QY010103005376{
            .title{
                top: unset;
                bottom: -0.086rem;
            }
        }
        // Frebird工作室(大)
        #QY01010300430{
            .title{
                top: 46%;
            }
        }
        // 平行工作室-1
        #QY010103004455{
            .title{
                span{
                    width: .0215rem;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 平行工作室-2
        #QY01010300440{
            .title{
                left: unset;
                top: 40%;
                right: -0.1613rem;
                span{
                    width: .0215rem;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 陨星工作室-1
        #QY010103004558{
            .title{
                top: unset;
                bottom: -0.0645rem;
            }
        }
        // 陨星工作室-2
        #QY010103004559{
            .title{
                left: unset;
                top: 51%;
                right: .0215rem;
                span{
                    width: .0215rem;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 陨星工作室-3
        #QY010103004560{
            .title{
                left: unset;
                top: 55%;
                right: .086rem;
                span{
                    width: .0215rem;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 电梯样式-1
        #QY010103005580{
            .title{
                left: unset;
                right: -0.4731rem;
            }
        }
        // 楼梯样式-1
        #QY010103005681{
            .title{
                top: 15%;
            }
        }
        // 货梯厅
        #QY010103005782{
            .title{
                top: 30%;
            }
        }
        // 前台
        #QY010103005986{
            .title{
                top: 80%;
            }
        }
        // 用户体验部
        #QY01010300251{
            .title{
                top: 75%;
                left: 37%;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 行政部
        #QY01010300260{
            .title{
                left: unset;
                right: .2151rem;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 单独的样式覆盖掉之前的公共样式（4层）
        // ATC + 引擎
        #QY010104000270{
            .title{
                top: unset;
                bottom: 0;
            }
        }
        // 微传播（会议室-顶部）
        #QY010104000371{
            .title{
                .name{
                    transform: scale(0.7,0.9);
                }
                .subtitle{
                    transform: scale(0.5,0.65);
                }
            }
        }
        // 奥尔坦西亚、金银岛
        #QY010104000472,#QY01010400050{
            .title{
                .name{
                    transform: scale(0.45,0.9);
                }
            }
        }
        // 儒博会议室
        #QY010104000787{
            .title{
                .name{
                    transform: scale(0.7,0.9);
                }
            }
        }
        // 异界
        #QY0101040029115{
            .title{
                top: 6%;
            }
        }
        // 微传播（部门）
        #QY0101040030116{
            .title{
                top: 45%;
            }
        }
        // 灵回诗社
        #QY0101040028114{
            .title{
                top: 5%;
                left: 35%;
            }
        }
        // 蓝图救援中心、琥珀工作室、优格资本（部门）、卫生间-1
        #QY0101040032118,#QY0101040031117,#QY0101040042131,#QY0101040061159{
            .title{
                left: 20%;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 琥珀工作室
        #QY0101040031117{
            .title{
                left: 10%;
            }
        }
        // Heyyo工作室
        #QY0101040037123{
            .title{
                top: unset;
                bottom: -0.0215rem;
            }
        }
        // 北斗工作室、发行技术部
        #QY0101040039125,#QY0101040040126{
            .title{
                top: unset;
                bottom: -0.0968rem;
            }
        }
        // 龙图游戏（客服部）
        #QY0101040038124{
            .title{
                top: unset;
                bottom: -0.2151rem;
                .name{
                    transform:translate(0px,5px) scale(0.85, 0.9)
                }
            }
        }
        // 商务部
        #QY0101040036122{
            .title{
                top: unset;
                bottom: -0.0538rem;
            }
        }
        // 创新中心（动画组）
        #QY0101040035121{
            .title{
                top: unset;
                bottom: -0.1935rem;
                .name{
                    transform:translate(0px,5px) scale(0.85, 0.9)
                }
            }
        }
        // 格尔威森林
        #QY010104001696{
            .name{
                transform:scale(0.65, 0.9)
            }
        }
        // 儒博库房、监控室
        #QY0101040047143,#QY0101040048144{
            .name{
                transform:scale(0.5, 0.9)
            }
        }
        // 未知部门-5
        #QY01010400411{
            .title{
                top: 45%;
            }
        }
        // 未知部门-5
        #QY01010400412{
            .title{
                top: 48%;
            }
        }
        // 直播间1
        #QY01010400510{
            .title{
                left: .1935rem;
            }
        }
        // 直播间2、4、6、7、9、10
        #QY01010400521,#QY0101040058156,#QY01010400530,#QY01010400540,#QY0101040059157,#QY0101040060158{
            .name{
                transform:scale(0.5, 0.9)
            }
        }
        // 直播间8
        #QY01010400550{
            .title{
                top: 61%;
            }
        }
        // 机房
        #QY0101040064164{
            .title{
                top: 20%;
            }
        }
        // 微传播（部门-底部）
        #QY01010400300{
            .title{
                left: unset;
                right: .0968rem;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 男浴室、女浴室
        #QY01010400621,#QY01010400631{
            .title{
                left: 42%;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 卫生间-2
        #QY0101040061161{
            .title{
                top: 10%;
                left: 40%;
            }
        }
        // 卫生间-3
        #QY0101040061160{
            .title{
                top: 38%;
                left: 40%;
            }
        }
        // 前台
        #QY0101040065165{
            .title{
                top: 60%;
                left: unset;
                right: -0.3226rem;
            }
        }
        // 鬼武
        #QY01010400450{
            .title{
                top: 30%;
                left: 10%;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 聚礼1/4半圆
        #QY01010400220{
            border-radius: .0538rem 0 0 0;
        }
        // 聚英1/4半圆
        #QY01010400230{
            border-radius:0 .0538rem 0 0;
        }
        // 微传播（会议室）1/4半圆
        #QY01010400030{
            border-radius:.1505rem 0 0 0;
        }
    }
    // 定义动画
    @keyframes scaleAnimation {
        to {
            transform:scale(3);
        }
    }
    // transform: translateY();
}
</style>