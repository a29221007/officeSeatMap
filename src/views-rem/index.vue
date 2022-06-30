<template>
    <!-- 设置一个版心容器，里面放地图 -->
    <div ref="BodyContainerRef" v-on:click="handleClickMap" class="body-container">
        <!-- 中间用标准流布局展示地图 -->
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <template v-for="item in mapList" :key="item.id">
                <template v-if="item.type === 1 || item.type === 2 || item.type === 3">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 区域 -->
                        <div :id="item.code + item.id" :class="[item.code,{'active-area':currentAreaCode === item.code},'area']" :style="oneAreaStyle(item)" v-on:click="handleClickMeetingRoom(item,$event)">
                            <div class="title">
                                <span class="name">{{item.name}}</span>
                                <template v-if="item.floor == '3' || item.floor == '4'">
                                    <span v-if="item.subtitle && item.type !== 3 && item.subtitle !== '（部门）' && item.subtitle !== '（会议室）'" class="subtitle">{{item.subtitle}}</span>
                                </template>
                                <template v-else>
                                    <span v-if="item.subtitle && item.subtitle !== '（深圳）'" class="subtitle">{{item.subtitle}}</span>
                                </template>
                            </div>
                        </div>
                    </template>
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Array]'">
                        <template v-for="(item2,index) in item.coordinate" :key="item2.id">
                            <!-- 区域 -->
                            <div :id="item.code + index" :class="[item.code,{'active-area':currentAreaCode === item.code},'area']" :style="multipleAreaStyle(item,item2,index)" v-on:click="handleClickMeetingRoom(item,$event)">
                                <div class="title" v-if="item2.show_area_name">
                                    <span class="name">{{item.name}}</span>
                                    <template v-if="item.floor == '3' || item.floor == '4'">
                                        <span v-if="item.subtitle && item.type !== 3 && item.subtitle !== '（部门）' && item.subtitle !== '（会议室）'" class="subtitle">{{item.subtitle}}</span>
                                    </template>
                                    <template v-else>
                                        <span v-if="item.subtitle && item.subtitle !== '深圳'" class="subtitle">{{item.subtitle}}</span>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </template>
                </template>
                <template v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                    <!-- 座位 -->
                    <div class="seat" v-on:click="handleClickSeat(item,$event)" :id="item.seat_id" :style="seatItemStyle(item)">
                    </div>
                </template>
            </template>
        </div>
    </div>
    <!-- 底部搜索相关组件 -->
    <BottomBox ref="BottomBoxRef" v-on:switchFloor="switchFloor"></BottomBox>
    <!-- 扫一扫按钮 -->
    <Scan v-on:scanBarCode="handleQR"></Scan>
</template>

<script>
import {ref, computed, toRefs, reactive, onMounted, provide, onBeforeUnmount, nextTick, watch, onBeforeMount} from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AlloyFinger from 'alloyfinger'
// 导入底部搜索组件
import BottomBox from './compontent/bottomBox.vue'
// 导入扫一扫子组件
import Scan from './compontent/scan'

// 导入发送code的接口
import { sendCode } from '@/api/mobile.js'
// 座位设置高亮的公共方法
import searchSeat from './hook/searchSeat'
// 区域设置高亮的公共方法
import searchArea from '@/views-rem/hook/searchArea.js'
import { beginToast, endToast } from '@/views-rem/hook/toast.js'

import transtionFn from '@/views-rem/hook/bottomBoxTranstion.js'

// 导入获取会议室相关数据的接口
import { getMeeting } from '@/api/getMeeting.js'

// 导入对会议室排序的公共方法
import sortMeetingList from '@/views-rem/hook/sortArray.js'

// 导入获取微信配置项的api
import { getQrConfig } from '@/api/jumpWX.js'
// 导入根据条形码获取固资信息的api
import { getAssetInfoByQR } from '@/api/getAssetInfo.js'
export default {
    name:'MHome',
    components:{
        BottomBox,
        Scan
    },
    setup(){
        console.log();
        // 获取vuex实例
        const store = useStore()
        const router = useRouter()
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


        watch([() => store.state.seatListOfthree, () => store.state.seatListOfFour, () => store.state.areaListOfThree, () => store.state.areaListOfFour],() => {
            if(store.state.seatListOfthree.length && store.state.seatListOfFour.length && store.state.areaListOfThree.length && store.state.areaListOfFour.length){
                // let requestSearchObj = store.state.scanQRcodeObject
                scanCodeFn(store.state.scanQRcode)
                // 判断当前用户的操作权限(暂时编辑按钮也隐藏起来了，暂时这个接口先不调了)
                // sendCode(requestSearchObj.code).then((res) => {
                //     console.log(res)
                //     if(res.err !== 0) return beginToast('fail','获取用户权限配置失败',2000)
                //     store.commit('setIs_have_editor',res.data.u)
                // })
            }
        })
        // 将扫码后跳转的逻辑封装
        function scanCodeFn(scanQRcode){
            // 判断有没有 scanQRcode 这个参数
            if(!scanQRcode) return endToast() // 如果没有这个参数，则直接停止 toast 提示
            // 如果有这个 scanQRcode 这个参数，则根据这个字段查找对应项
            let item = store.getters.AllSeatList.find(item => item.qr_code === scanQRcode)
            // 判断是否有 item 项
            if(!item){
                // 如果没找到，则先关闭加载的提示，然后再弹框提示没有找到对应座位或区域
                endToast()
                return beginToast('fail','没有找到相关的座位或区域',2000)
            }
            // 设置扫码的楼层
            let floor = ''
            if(item.floor == '3' && item.office == '1'){
                floor = 'three'
            }else if(item.floor == '4' && item.office == '1'){
                floor = 'four'
            }else if(item.floor == '7' && item.office == '2'){
                floor = 'shenzhen'
            }
            store.commit('setCurrentFloor',floor)
            nextTick(() => {
                // 判断找到的 item 的类型
                if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                    // 如果扫码结果是座位
                    store.commit('setActiveInfo',item)
                    // 每一次扫码之前确定上一次有没有高亮做动画的元素
                    beforeSeatAnimateElement && clearInterval(beforeSeatAnimateElement.timer)
                    beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = `scale(1)`)
                    // 如果为座位
                    seatData.setCurrentSeat_id(item.seat_id)
                    // 点击座位要将底部盒子升上来
                    scaling = false
                    MapBoxTapFn()
                    // 调用座位高亮的函数
                    searchSeat(item.seat_id)
                    BottomBoxRef.value.setSearchLegendContant('information')
                    if(item.type !== '0') return endToast()
                    // 调用获取个人固资列表的函数
                    store.dispatch('getPersontFixedAssetsList',{ b_usercode:item.id,v_usercode:store.state.UserInfo.usercode }).then(() => {
                        if(store.state.is_have_ckeck_persontFixedAssets) {
                            // 通过扫码进入则显示公共联系人
                            store.commit('setIs_show_public_contact_person',true)
                            // 跳转到固资信息页面
                            router.push('/fixedAssets')
                        }
                    })
                }else if(item.type === 1){
                    // 如果为会议室(传第二个值为固定的，我是自己定义的,只要有值就行，此时定义的 'push',意思是要跳转)
                    getMeetingData(item,'push')
                }
                // 如果是扫码跳转进来的最后要关闭提示框
                endToast()
            })
        }
        // onBeforeMount 中开启加载提示
        onBeforeMount(() => {
            beginToast('loading','加载中',0)
            // 首先要获取当前页面的url
            const url = window.location.href
            getQrConfig(url).then(res => {
                const { appId, timestamp, nonceStr, signature } = res.data
                wx.config({beta: true, debug: false, appId, timestamp, nonceStr, signature, jsApiList: ['scanQRCode', 'invoke'] })
            })
        })
        // 将实例化的对象从 onMounted 钩子函数中提取出来，用于卸载阶段解绑事件
        let BodyContainer = null
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
            // 2.2 监听 MapBox 盒子的 tap 事件
            BodyContainer.on('touchStart', MapBoxTouchStartFn)
            // 2.5 监听 MapBox 盒子的 pinch 事件
            BodyContainer.on('pinch', MapBoxPinchFn)
            // 2.6 监听 MapBox 盒子的 pressMove 事件
            BodyContainer.on('pressMove', MapBoxPressMoveFn)
            // 2.7 监听 MapBox 盒子的 touchEnd 事件
            BodyContainer.on('touchEnd', MapBoxTouchEndFn)

            // ------------------------------------------------------------
            // 获取 searchLegend 、 floorSwitch 两个盒子的初始top值
            let searchLegend = document.querySelector('.search-legend')
            searchLegendTop = searchLegend.offsetTop
            let floorSwitch = document.querySelector('.floor-switch')
            floorSwitchTop = floorSwitch.offsetTop
        })
        // MapBox 盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片
            return {
                backgroundImage: `url(/floor_image/1777_1612_${store.getters.floor}层.png)`
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
            }, 250)
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
        // searchLegend 盒子的初始 top 值
        let searchLegendTop = 0
        // floorSwitch 盒子的初始 top 值
        let floorSwitchTop = 0
        // MapBox盒子点击事件的处理函数
        function MapBoxTapFn() {
            // 实时获取这两个 DOM 元素
            let searchLegend = document.querySelector('.search-legend')
            let floorSwitch = document.querySelector('.floor-switch')
            // 这一步还是要清除一下过渡
            searchLegend.style.transition = 'unset'
            if(floorSwitch) floorSwitch.style.transition = 'unset'
            // 定义动画数据
            let obj1 = {}
            let obj2 = {}
            if(scaling){
                // 如果为true, 则是向下运动
                obj1 = {
                    top:document.documentElement.clientHeight + 30,
                    bottom: 0 
                }
                obj2 = {
                    top:document.documentElement.clientHeight + 30,
                    bottom: 0
                }
            }else{
                // 否则为向上运动
                obj1 = {
                    top:searchLegendTop,
                    bottom:0
                }
                obj2 = {
                    top:floorSwitchTop,
                    bottom: 0
                }
            }
            // 调用动画函数
            transtionFn(searchLegend,obj1)
            if(floorSwitch) transtionFn(floorSwitch,obj2)
            // 将控制上升下降的变量取反
            scaling = !scaling
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
            MapBoxRef.value.style['-webkit-transition'] = `all ${timer}s`
            MapBoxRef.value.style['-webkit-transform'] = `scale(${scale_init_x},${scale_init_y})`
        }
        // 获取 BottomBoxRef 实例
        const BottomBoxRef = ref(null)

        // 记录选中的座位id
        let currentSeat_id = 0
        // 存储上一个元素，用来清除上一个元素的定时器
        let beforeSeatAnimateElement = null

        // 清除当前元素的动画定时器函数
        function clearCurrentElementInterval(){
            // 1、获取当前的元素实例 DOM
            let curentElement = document.getElementById(currentSeat_id)
            if(curentElement){
                // 2、如果有 curentElement 这个DOM实例，则清除定时器
                clearInterval(curentElement.timer)
                curentElement.style.transform = `scale(1)`
                currentSeat_id = 0
            }
        }

        let seatData = reactive({
            mapList: computed(() => {
                // 3层的座位人员信息和区域会议室信息集合
                let seatAndAreaListOfThree = store.state.seatListOfthree.concat(store.state.areaListOfThree)
                // 4层的座位人员信息和区域会议室信息集合
                let seatAndAreaListOfFour = store.state.seatListOfFour.concat(store.state.areaListOfFour)
                // 深圳地区的人员信息和区域会议室信息集合
                let seatAndAreaListOfShenZhen = store.state.seatListOfShenZhen.concat(store.state.areaListOfShenZhen)
                // 点击图例筛选后的座位信息
                // 1、判断当前的楼层，选择出要做筛选的数组
                let currentFloorSeatList = []
                if(store.state.currentFloor === 'three'){
                    currentFloorSeatList = seatAndAreaListOfThree
                }else if(store.state.currentFloor === 'four'){
                    currentFloorSeatList = seatAndAreaListOfFour
                }else if(store.state.currentFloor === 'shenzhen'){
                    currentFloorSeatList = seatAndAreaListOfShenZhen
                }
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
            // 设置每一个区域的样式（单个区域）
            oneAreaStyle(item){
                let styleObject = {}
                if((item.floor == '3' || item.floor == '4') && item.office == '1'){
                    styleObject = {
                        position: 'absolute',
                        top:(item.coordinate.top / 1612 * 843) / 93 + 'rem',
                        left:(item.coordinate.left / 1777 * 930) / 93 + 'rem',
                        width:(item.coordinate.width / 1777 * 930) / 93 + 'rem',
                        height: (item.coordinate.height / 1612 * 843) / 93 + 'rem',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464'
                    }
                }else if(item.floor == '7' && item.office == '2'){
                    styleObject = {
                        position: 'absolute',
                        top:(item.coordinate.top / 571 * 843) / 93 + 'rem',
                        left:(item.coordinate.left / 1287 * 930) / 93 + 'rem',
                        width:(item.coordinate.width / 1287 * 930) / 93 + 'rem',
                        height: (item.coordinate.height / 571 * 843) / 93 + 'rem',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464',
                    }
                }
                return styleObject
            },
            // 设置每一个区域的样式（多个区域）
            multipleAreaStyle(item,item2,index){
                let styleObject = {}
                if((item.floor == '3' || item.floor == '4') && item.office == '1'){
                    styleObject = {
                        position: 'absolute',
                        top:(item2.top / 1612 * 843) / 93 + 'rem',
                        left:(item2.left / 1777 * 930) / 93 + 'rem',
                        width:(item2.width / 1777 * 930) / 93 + 'rem',
                        height: (item2.height / 1612 * 843) / 93 + 'rem',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464'
                    }
                }else if(item.floor == '7' && item.office == '2'){
                    styleObject = {
                        position: 'absolute',
                        top:(item2.top / 571 * 843) / 93 + 'rem',
                        left:(item2.left / 1287 * 930) / 93 + 'rem',
                        width:(item2.width / 1287 * 930) / 93 + 'rem',
                        height: (item2.height / 571 * 843) / 93 + 'rem',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464',
                    }
                    // 单独为深圳地区的 "其他" 区域，设置背景色
                    if((item.code + index) === 'QY02020700310'){
                        styleObject.backgroundColor = 'rgba(2, 122, 255, 0.05)'
                    }
                }
                return styleObject
            },
            // 设置当前选中座位的id
            setCurrentSeat_id(value){
                currentSeat_id = value
                beforeSeatAnimateElement = document.getElementById(value)
                scale_init_x = 4
                scale_init_y = 4
            },
            // 子组件发布的事件，切换路层后，将当前的选中座位和区域的高亮重置
            switchFloor(){
                clearCurrentElementInterval()
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
                clearCurrentElementInterval()
            },
            // 设置每一个座位的样式
            seatItemStyle(seatItem) {
                let styleObject = {}
                if((seatItem.floor == '3' || seatItem.floor == '4') && seatItem.office == '1'){
                    styleObject = {
                        top:(seatItem.gRow * 9.64 + 23) / 93 +'rem',
                        left:(seatItem.gCol * 9.6 + 35) / 93 +'rem',
                    }
                }else if(seatItem.floor == '7' && seatItem.office == '2'){
                    styleObject = {
                        top: ((seatItem.gCol / 571) * 843) / 93 + 'rem',
                        left: ((seatItem.gRow / 1287)  * 930) / 93 +'rem',
                    }
                }
                styleObject.backgroundImage = `url(/legend-image/image${seatItem.type === '0' ? '0' : seatItem.type === '0-1' ? '1' : '2'}.png)`
                return styleObject
            },
            // 点击每一个座位
            handleClickSeat(seatItem,$event){
                // 阻止冒泡
                $event.stopPropagation()
                // 判断当前选中的座位是否有seat_id这个字段，以及值不为null
                if(!seatItem.seat_id) return
                // 点击座位，将区域的高亮色，取消
                seatData.currentAreaCode = ''
                // 点击某一个座位将当前座位的seat_id赋值给current，将当前选中的座位高亮，再点击同一个座位取消高亮
                if(seatItem.seat_id === currentSeat_id){
                    clearCurrentElementInterval()
                    // 将底部盒子设置为初始状态
                    BottomBoxRef.value.setSearchLegendContant('init')
                    // 当点击座位相同时，判断 scaling 的值，如果 scaling 处于 true 时，不用管，当处于false时，需要将盒子提升上来
                    if(!scaling) MapBoxTapFn()
                    return
                }
                beforeSeatAnimateElement && clearInterval(beforeSeatAnimateElement.timer)
                beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = `scale(1)`)
                beforeSeatAnimateElement = $event.target
                // 点击座位要将底部盒子升上来
                scaling = false
                MapBoxTapFn()
                // 设置座位的高亮状态
                seatData.setCurrentSeat_id(seatItem.seat_id)
                store.commit('setActiveInfo', seatItem)
                BottomBoxRef.value.setSearchLegendContant('information')
                // 调用座位高亮的函数
                searchSeat(seatItem.seat_id)
                if(seatItem.type === '0'){
                    // 点击座位时，就判断当前用户是否有权限查看被点击员工的固资信息
                    store.dispatch('getPersontFixedAssetsList',{ b_usercode:seatItem.id, v_usercode:store.state.UserInfo.usercode })
                }
            },
            // 点击每一个会议室
            handleClickMeetingRoom(item,$event){
                // 将当前项的字段解构出来
                const {type,code} = item
                // 排出掉除会议室以外的点击
                if(type !== 1) return
                // 阻止点击会议室事件的冒泡行为
                $event.stopPropagation()
                if(code === seatData.currentAreaCode){
                    // 如果相同,则取消高亮，以及恢复底部盒子到主页（init）
                    seatData.currentAreaCode = ''
                    // 将底部操作盒子设置为初始状态
                    BottomBoxRef.value.setSearchLegendContant('init')
                    // 当点击座位相同时，判断 scaling 的值，如果 scaling 处于 true 时，不用管，当处于false时，需要将盒子提升上来
                    if(!scaling) MapBoxTapFn()
                    return
                }
                // 点击会议室确保底部的盒子处于升起来的状态
                scaling = false
                MapBoxTapFn()
                // 获取当前会议室相关的信息
                getMeetingData(item)
            }
        })
        // 获取会议室相关数据以及预定记录函数
        // flag 参数是为了区分是否为扫码进入项目，如果flag参数为undefind，则说明不是扫码进入时调用
        function getMeetingData(item,flag) {
            const { code, name, subtitle } = item
            getMeeting(code).then(res => {
                if(res.code !== 0){
                    // 在 code 不等于 0 的情况下，继续判断当前区域是否为会议室，如果不为会议室也会发生报错
                    if(res.code === 2013){
                        // code 为2013时，则当前选中的会议室（区域）不是会议室，只是当时路数据库时，写成了会议室，要单独处理一下
                        store.commit('setActiveInfo',{
                            type: 1,
                            code,
                            name,
                            subtitle,
                            is_meeting:false,
                        })
                    }else{
                        // 设置会议室的相关信息
                        store.commit('setActiveInfo',{
                            type: 1,
                            code,
                            name,
                            subtitle,
                            is_meeting:true,
                        })
                    }
                    searchArea(code,seatData.setCurrentAreaCode)
                    BottomBoxRef.value.setSearchLegendContant('information')
                    if(!scaling) MapBoxTapFn()
                    endToast()
                    return beginToast('fail', res.message, 2000)
                }
                res.data.code = code
                res.data.type = 1
                res.data.HistoryList = sortMeetingList(res.data.HistoryList)
                // 设置会议室的相关信息
                store.commit('setActiveInfo',res.data)
                searchArea(code,seatData.setCurrentAreaCode)
                // 将底部操作盒子设置为 'information' 状态
                BottomBoxRef.value.setSearchLegendContant('information')
                // 如果有flag参数，并且查询也没有报错的情况下，跳转到会议室预约记录展示页面
                if(flag){
                    // 继续判断会议室是否有预约记录
                    if(res.data.HistoryList.length){
                        // 如果有则push到预约记录详情页
                        router.push('/meetingRoomHistory')
                    }else{
                        // 如果没有，则push到无预约记录页面
                        router.push('/meetingRoomFree')
                    }
                }
            }).catch( error => {
                store.commit('setActiveInfo',{
                    type: 1,
                    code,
                    name
                })
                BottomBoxRef.value.setSearchLegendContant('information')
                if(!scaling) MapBoxTapFn()
                beginToast('fail', '查询失败' + error, 2000)
            })
        }
        // 向子组件传递 switchFloor 事件，在切换图例时，也要触发该事件，将高亮的座位和区域重置
        provide('switchLenged',seatData.switchFloor)

        // 向子组件传递设置区域高亮的方法
        provide('upCurrentAreaCode',seatData.setCurrentAreaCode)
        // 向子组件传递设置高亮的方法
        provide('upCurrentSeat_id',seatData.setCurrentSeat_id)
        // 向子组件传递获取会议室相关的数据方法
        provide('getMeetingRoomData',getMeetingData)
        // 卸载阶段，事件解绑
        onBeforeUnmount(() => {
            // 1 卸载 MapBox 盒子的 tap 事件
            BodyContainer.off('touchStart', MapBoxTouchStartFn)
            // 2 卸载 MapBox 盒子的 pinch 事件
            BodyContainer.off('pinch', MapBoxPinchFn)
            // 3 卸载 MapBox 盒子的 pressMove 事件
            BodyContainer.off('pressMove', MapBoxPressMoveFn)
            // 4 卸载 MapBox 盒子的 touchEnd 事件
            BodyContainer.off('touchEnd', MapBoxTouchEndFn)

            // 清除延时器id
            clearTimeout(timer1)
            clearTimeout(timer2)
        })
        // 监听子组件的扫码行为
        function handleQR(){
            // 点击扫码开始提示
            beginToast('success', '正在打开扫一扫。。。', 1500)
            wx.scanQRCode({
                desc: 'scanQRCode desc',
                needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
                scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是条形码（一维码），默认二者都有
                success: function(res) {
                    beginToast('loading','加载中',0)
                    var result = res.resultStr
                    // 拿到扫码成功的结果后，判断扫描的是条形码还是二维码
                    // 判断返回的字符串是否以 http 开头
                    var is_url = result.startsWith('http')
                    if(is_url){
                        // 是一个 url 路径
                        // 如果是扫二维码得到的连接，则截取连接中的 redirect_uri 字段值
                        let obj1 = formatURL(result)
                        let obj2 = formatURL(decodeURIComponent(obj1.redirect_uri + ''))
                        // 如果走这个方法，则 关闭提示框函数调用在 这个 scanCodeFn 方法内
                        scanCodeFn(obj2.id)
                    }else{
                        // 不是一个 url 路径
                        // 则调接口获取固资信息
                        getAssetInfoByQR({asset_code:result,v_usercode:store.state.UserInfo.usercode}).then( res => {
                            // 如果扫条形码，扫描完成后，关闭提示框
                            endToast()
                            if(res.code !== 0) return router.push('/BarCodeNoPermission')
                            // 保存扫码得到的数据
                            store.commit('setScanBarcodeInfoObject', res.data)
                            // 跳转到固定资产信息展示页面
                            router.push('/BarCode')
                        }).catch((error) => {
                            endToast()
                            beginToast('fail', '获取条形码信息失败' + error, 2000)
                        })
                    }
                },
                error: function(res) {
                    // 如果扫码失败，发生错误，则关闭提示框
                    if (res.errMsg.indexOf('function_not_exist') > 0) {
                        return beginToast('fail', '版本过低请升级', 2000)
                    }
                    beginToast('fail', res.errMsg, 2000)
                }
            })
        }
        function formatURL(url){
            var searchObj = {}
            // 找出 url 中的 ? 字符所在的位置
            var index = url.indexOf('?')
            if(index !== -1){
                // 说明有参数，则格式化参数
                var searchString = url.slice(index + 1) // 截取 ? 之后所有的字符
                var searchArray = searchString.split('&') // 将字符串转化为数组
                searchArray.forEach(item => {
                    searchObj[item.split('=')[0]] = item.split('=')[1]
                })
            }else{
                beginToast('fail', '链接中没有参数信息', 2000)
                searchObj = ''
            }
            return searchObj
        }
        return {
            ...toRefs(seatData),
            MapBoxStyle,
            MapBoxRef,
            BodyContainerRef,
            handleClickMap,
            BottomBoxRef,
            handleQR
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
        background-size: 100% 100%;
        background-repeat: no-repeat;
        transition: all 0.5s;
        .area{
            font-size: 8px;
        }
        .seat{
            position: absolute;
            z-index: 5;
            width: .086rem;
            height: .086rem;
            background-size:100%;
            background-repeat: no-repeat;
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
                transform: scale(0.55,0.55);
            }
            .subtitle{
                transform: scale(0.38,0.38);
            }
        }
        // 单独的样式覆盖掉之前的公共样式（3层）
        // 采购库房（法务部旁边的）
        #QY010103004865{
            .title{
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 平台技术部（it信息部）
        #QY010103005268{
            .title{
                width: 100%;
                height: 100%;
                top: unset;
                bottom: -0.8125rem;
                left: .2875rem;
                .subtitle{
                    transform: translateY(-0.1452rem) scale(0.38, 0.38);
                }
            }
        }
        // 法务部&公共关系与政府事务部
        #QY010103005066{
            .title{
                top: unset;
                bottom: -0.1613rem;
                left: .5914rem;
                .name{
                    transform: scale(0.39,0.55);
                }
            }
        }
        // 用户体验部（音频音效）
        #QY010103004762{
            .title{
                top: .0753rem;
                .subtitle{
                    transform: translateY(-0.1452rem) scale(0.38, 0.38);
                }
            }
        }
        // 热江3D&余烬风暴美术
        #QY010103003838{
            .title{
                top: .2688rem;
                .subtitle{
                    transform: translateY(-0.1452rem) scale(0.38, 0.38);
                }
            }
        }
        // 热江3D&我叫MT-1（亚山世界会议室旁）
        #QY010103006037{
            .title{
                right: .1075rem;
                left: unset;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 热江3D&我叫MT-2（该区域的标题暂时删除）
        // 热江3D&我叫MT-3
        #QY01010300600{
            .title{
                top: unset;
                bottom: -0.2258rem;
            }
        }
        // 热江项目组-1、余烬风暴项目组、平台技术部（it信息部）、平台技术部（QA部）
        #QY010103002639,#QY010103004040,#QY010103003131,#QY010103003030{
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
        // 热江项目组-1
        #QY010103002639{
            .title{
                .name{
                    transform: scale(0.55,0.45);
                }
            }
        }
        // 热江项目组-2
        #QY01010300260{
            .title{
                left: unset;
                right: .2151rem;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 余烬风暴项目组
        #QY010103004040{
            .title{
                top: 0;
            }
        }
        // 平台技术部(it信息部）、平台信息部(QA部)
        #QY010103003131,#QY010103003030{
            .title{
                left: .0215rem;
                .name{
                    transform: scale(0.55,0.48);
                }
            }
        }
        // 财务部、人力资源部
        #QY010103003232,#QY010103003435{
            .title{
                top: unset;
                bottom: -0.1613rem;
            }
        }
        // 行政小仓库
        #QY010103002727{
            .title{
                .name{
                    transform: scale(0.3, 0.55);
                }
            }
        }
        // HR咨询服务办公室
        #QY010103002828{
            .title{
                top: -0.0753rem;
                left: -0.3763rem;
                transform: unset;
            }
        }
        // 用户体验部（本地化）
        #QY010103002424{
            .title{
                top: unset;
                bottom: -0.5161rem;
                .subtitle{
                    transform: translateY(-0.1828rem) scale(0.38, 0.38);
                }
            }
        }
        // 证券部
        #QY010103002020{
            .title{
                top: -0.1075rem;
                .name{
                    transform: scale(0.4,0.55);
                }
            }
        }
        // 市场部-1
        #QY01010300641{
            .title{
                top: 78%;
            }
        }
        // 总裁办(小)、市场部-2、视觉创意部
        #QY0101030019179,#QY010103006416,#QY010103001818{
            .title{
                top: .0538rem;
            }
        }
        // 总裁办(小)
        #QY0101030019179{
            .title{
                .name{
                    transform: scale(0.4,0.55);
                }
            }
        }
        // 新SLG、市场部-3、运营部
         #QY010103002252,#QY0101030064180,#QY010103005376{
            .title{
                top: unset;
                bottom: -0.1613rem;
            }
        }
        // 用户体验部（用研）、视觉创意部（视频组）
        #QY0101030066181,#QY010103001717{
            .title{
                top: unset;
                bottom: -0.5376rem;
                .name{
                    transform: scale(0.4,0.55);
                }
                .subtitle{
                    transform: translateY(-0.1183rem) scale(0.38, 0.38);
                }
            }
        }
        // 媒介管理部、采购部
        #QY01010300210,#QY0101030065178{
            .title{
                top: 65%;
            }
        }
        // 媒介管理部
        #QY01010300210{
            .title{
                .name{
                    transform: scale(0.4,0.55);
                }
            }
        }
        // 英雄无敌&新SLG
        #QY01010300431{
            .title{
                top: 40%;
            }
        }
        // 引擎平台部
        #QY0101030067182{
            .title{
                left: unset;
                right: .0215rem;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 无神之界-1
        #QY010103004455{
            .title{
                top: unset;
                bottom: -0.1075rem;
                left: 55%;
            }
        }
        // 无神之界-2
        #QY01010300440{
            .title{
                left: unset;
                top: 40%;
                right: -0.2258rem;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 行政部
        #QY0101030068183{
            .title{
                top: unset;
                bottom: -101%;
                left: 30%;
                span{
                    width: 2px;
                    white-space:unset;
                }
                .name{
                    transform: scale(0.55,0.4);
                }
            }
        }
        // 用户体验设计部
        #QY01010300450{
            .title{
                left: -0.0538rem;
                span{
                    width: 2px;
                    white-space:unset;
                }
                .name{
                    transform: scale(0.55,0.4);
                }
            }
        }
        // 电梯样式-1
        #QY010103005580{
            .title{
                left: unset;
                right: -0.6452rem;
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
        // 阳光走廊(3层和4层的)
        #QY0101030061174,#QY0101040066185{
            .title{
                left: 17%;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 洗手台
        #QY010103006277{
            .title{
                top: 54%;
                left: 45%;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 移动端的 英雄擂
        #QY01010300150{
            .title{
                .subtitle{
                    transform: translateY(-0.1452rem) scale(0.38, 0.38);
                }
            }
        }
        // 单独的样式覆盖掉之前的公共样式（4层）
        // 空
        #QY010104000270{
            .title{
                top: unset;
                bottom: 0;
            }
        }
        // 奥尔坦西亚
        #QY010104000472{
            .title{
                .name{
                    transform: scale(0.3,0.55);
                }
            }
        }
        // ROOBO会议室
        #QY010104000787{
            .title{
                .name{
                    transform: scale(0.3,0.55);
                }
            }
        }
        // 微传播（部门）
        #QY0101040030116{
            .title{
                top: 55%;
            }
        }
        // 灵回诗社
        #QY0101040028114{
            .title{
                top: 5%;
                left: 35%;
            }
        }
        // 商务部、盾勇项目组、优格资本（部门）
        #QY0101040032118,#QY0101040031117,#QY0101040042131{
            .title{
                left: 20%;
                span{
                    width: .0215rem;
                    white-space:unset;
                }
            }
        }
        // 盾勇项目组
        #QY0101040031117{
            .title{
                left: 10%;
            }
        }
        // 美术部-1、美术部-2
        #QY0101040036123,#QY0101040036122{
            .title{
                top: unset;
                bottom: -0.172rem;
            }
        }
        // 行政部、一点咨询
        #QY0101040039125,#QY0101040070189{
            .title{
                top: unset;
                bottom: -0.1828rem;
            }
        }
        // 发行技术部
        #QY0101040040126{
            .title{
                left: 0;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 客服部
        #QY0101040038124{
            .title{
                top: unset;
                bottom: -0.1075rem;
            }
        }
        // 创新中心（Heyyo工作室）
        #QY0101040035121{
            .title{
                top: unset;
                bottom: -0.4731rem;
                .subtitle{
                    transform:translate(0px,-6px) scale(0.38, 0.38)
                }
            }
        }
        // 运营部（盾勇&苍骑）
        #QY0101040034120{
            .title{
                top: unset;
                bottom: -0.5054rem;
                .subtitle{
                    transform:translate(0px,-6.5px) scale(0.38, 0.38)
                }
            }
        }
        // 渠道部
        #QY0101040033119{
            .title{
                top: 20%;
                left: 65%;
            }
        }
        // 发行技术部（产品部）
        #QY0101040043132{
            .title{
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                right: .0108rem;
                left: unset;
                span{
                    width: 2px;
                    white-space:unset;
                }
                .name{
                    margin-left: .043rem;
                    transform: scale(0.55, 0.4);
                }
            }
        }
        // 空16
        #QY0101040044133{
            .title{
                left: unset;
                right: 29%;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 格尔威森林
        #QY010104001696{
            .name{
                transform:scale(0.4, 0.55)
            }
        }
        // 监控室
        #QY0101040048144{
            .name{
                transform:scale(0.4, 0.55)
            }
        }
        // ROOBO库房
        #QY0101040047143{
            .name{
                transform:scale(0.3, 0.55)
            }
        }
        // ROOBO如布
        #QY01010400412{
            .title{
                top: 48%;
                left: 20%;
            }
        }
        // 直播间1
        #QY01010400510{
            .title{
                left: .1935rem;
            }
        }
        // 直播间1、3、5
        #QY01010400510,#QY0101040056154,#QY0101040057155{
            .name{
                transform:scale(0.5, 0.55)
            }
        }
        // 直播间2、4、6、7、9、10
        #QY01010400521,#QY0101040058156,#QY01010400530,#QY01010400540,#QY0101040059157,#QY0101040060158{
            .name{
                transform:scale(0.35, 0.55)
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
        // 4层女卫生间-1
        #QY0101040068161{
            .title{
                top: 10%;
                left: 40%;
            }
        }
        // 4层男卫生间-1
        #QY0101040061160{
            .title{
                top: 38%;
                left: 40%;
            }
        }
        // 前台
        #QY0101040065165{
            .title{
                top: 70%;
                left: unset;
                right: -0.4301rem;
            }
        }
        // 4层洗手台
        #QY0101040067159{
            .title{
                top: 55%;
                span{
                    width: 2px;
                    white-space:unset;
                }
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
        // 星悦轩、格尔威森林，去除 title 的 line-height
        #QY010104001595,#QY010104001696{
            .title{
                line-height: 0;
            }
        }
        // 深圳地区，区域样式
        // CBR 1
        #QY02020700241{
            .title{
                top: unset;
                left: unset;
                bottom: .3375rem;
                right: -0.525rem;
            }
        }
        // CBR 2
        #QY02020700243{
            .title{
                top:2.3125rem;
                left: unset;
                right: -0.525rem;
            }
        }
        // CBR 3
        #QY02020700246{
            .title{
                top: -0.075rem;
                left: .2375rem;
            }
        }
        // CBR 4
        #QY02020700247{
            .title{
                top: unset;
                left: .25rem;
                bottom: -0.3125rem;
            }
        }
        // CBR 5
        #QY02020700248{
            .title{
                top: unset;
                left: .65rem;
                bottom: -0.3125rem;
            }
        }
        // CBR 6
        #QY020207002413{
            .title{
                top: unset;
                left: .1625rem;
                bottom: -0.3125rem;
            }
        }
        // CBR 7
        #QY020207002415{
            .title{
                top: unset;
                left: .275rem;
                bottom: -0.3125rem;
            }
        }
        // CBR 8
        #QY020207002419{
            .title{
                top: -0.0625rem;
                left: .125rem;
            }
        }
        // 用户体验部
        #QY0202070029219{
            .title{
                top: -0.0625rem;
            }
        }
        // S&G
        #QY02020700300{
            .title{
                top: unset;
                bottom: -0.3125rem;
                left: .3125rem;
            }
        }
        // 其他 1
        #QY02020700311{
            .title{
                left: 0;
                top: unset;
                bottom: -0.2375rem;
                transform: unset;
            }
        }
        // 其他 2
        #QY02020700312{
            .title{
                left: -0.325rem;
                transform: translate(0, -50%);
            }
        }
        // 其他 3
        #QY02020700310{
            .title{
                top: -0.0625rem;
            }
        }
        // 职能部门
        #QY0202070028218{
            .title{
                top: -0.1875rem;
                left: -0.0875rem;
                transform: unset;
            }
        }
        // 渠道 1
        #QY02020700272{
            .title{
                left: -0.3375rem;
                transform: translate(0, -50%);
            }
        }
        // 渠道 2
        #QY02020700271{
            .title{
                top: -0.1875rem;
                left: .025rem;
                transform: unset;
            }
        }
        // 视频
        #QY02020700260{
            .title{
                top: -0.1875rem;
                left: .0875rem;
                transform: unset;
            }
        }
        // 投放
        #QY02020700251{
            .title{
                top: -0.1875rem;
                left: .0375rem;
                transform: unset;
            }
        }
        // 零食柜
        #QY0202070009199{
            .title{
                top: unset;
                bottom: -0.2125rem;
                transform: translate( -50%, 0);
            }
        }
        // 1# 货梯
        #QY0202070018208{
            .title{
                top: .05rem;
                left: -0.6rem;
                transform: unset;
            }
        }
        // 2# 货梯
        #QY0202070019209{
            .title{
                top: .5rem;
                left: -0.6125rem;
                transform: unset;
            }
        }
        // 大门 1
        #QY02020700160{
            .title{
                top: -0.25rem;
                transform: translate( -50%, 0);
            }
        }
        // 大门 2
        #QY02020700161{
            .title{
                top: unset;
                bottom: -0.25rem;
                transform: translate( -50%, 0);
            }
        }
        // 洗手台
        #QY0202070023213{
            .title{
                left: .875rem;
            }
        }
        // 深圳地区会议室和库房的单独布局样式
        #QY0202070005189,#QY0202070006190,#QY0202070001185,#QY0202070002186,#QY0202070007191,#QY0202070003187,#QY0202070008192,#QY0202070004188{
            .title{
                display: flex;
                flex-direction: column;
            }
        }
        // 前台
        #QY0202070032222{
            .title{
                top: -0.175rem;
                left: .4rem;
                transform: unset;
            }
        }
    }
}
</style>