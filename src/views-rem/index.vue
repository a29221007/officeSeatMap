<template>
    <!-- 设置一个版心容器，里面放地图 -->
    <div ref="BodyContainerRef" v-on:click="handleClickMap" class="body-container">
        <!-- 中间用标准流布局展示地图 -->
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <template v-for="item in mapList" :key="item.id">
                <!-- 办公分区 -->
                <template v-if="item.diff && item.diff === 2 && item.floor !== 7">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 由单个组成 -->
                        <div :id="'part' + item.id" :class="['part',item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="areaStyle(item,item.coordinate)">
                            <div class="title"><span>{{item.name === '前台' ? '' : item.name}}</span><span>({{partTotaleObject[item.code]}})</span></div>
                        </div>
                    </template>
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Array]'">
                        <template v-for="(item2,index) in item.coordinate" :key="item.id + index">
                            <!-- 有多个组成 -->
                            <div :id="'part' + item.id + index" :class="['part',item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="areaStyle(item,item2)">
                                <div class="title" v-if="item2.show_area_name"><span>{{item.name === '前台' ? '' : item.name}}</span><span>({{partTotaleObject[item.code]}})</span></div>
                            </div>
                        </template>
                    </template>
                </template>
                <!-- 部门、会议室、其他区域 -->
                <template v-if="item.diff && item.diff === 1">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 区域 -->
                        <div :id="item.code + item.id" :class="[item.code,{'active-area':currentAreaCode.includes(item.code)},'area']" :style="areaStyle(item,item.coordinate)" v-on:click="handleClickMeetingRoom(item,$event)">
                            <div class="title">
                                <span class="name">{{item.name}}</span>
                                <template v-if="item.floor == '3' || item.floor == '4'">
                                    <span v-if="item.subtitle && item.subtitle !== '（3层）' && item.subtitle !== '（4层）' && item.subtitle !== '（部门）' && item.subtitle !== '（会议室）'" class="subtitle">{{item.subtitle}}</span>
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
                            <div :id="item.code + index" :class="[item.code,{'active-area':currentAreaCode.includes(item.code)},'area']" :style="areaStyle(item,item2)" v-on:click="handleClickMeetingRoom(item,$event)">
                                <div class="title" v-if="item2.show_area_name">
                                    <span class="name">{{item.name}}</span>
                                    <template v-if="item.floor == '3' || item.floor == '4'">
                                        <span v-if="item.subtitle && item.subtitle !== '（3层）' && item.subtitle !== '（4层）' && item.subtitle !== '（部门）' && item.subtitle !== '（会议室）'" class="subtitle">{{item.subtitle}}</span>
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
                    <div :class="newSeatClassFn(item)" :id="item.seat_id" :style="seatStyle(item)" v-on:click="handleClickSeat(item,$event)">
                        <div class="desk" :style="seatDeskStyle(item)"></div>
                        <div class="chair" :style="seatChairStyle(item)"></div>
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
import {ref, computed, toRefs, reactive, onMounted, provide, onBeforeUnmount, nextTick, watch, onBeforeMount, inject} from 'vue'
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
import setTransform from '@/utils/newSeatTransform.js'
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
import URL from '@/utils/baseUrl.js'
export default {
    name:'MHome',
    components:{
        BottomBox,
        Scan
    },
    setup(){
        const partTotaleObject = inject('partTotaleObject')
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


        watch([() => store.state.seatListOfthree, () => store.state.seatListOfFour,() => store.state.seatListOfShenZhen, () => store.state.areaListOfThree, () => store.state.areaListOfFour, () => store.state.areaListOfShenZhen],() => {
            if(store.state.seatListOfthree.length && store.state.seatListOfFour.length && store.state.seatListOfShenZhen.length && store.state.areaListOfThree.length && store.state.areaListOfFour.length && store.state.areaListOfShenZhen.length){
                // let requestSearchObj = store.state.scanQRcodeObject
                // 判断当前用户的操作权限(暂时编辑按钮也隐藏起来了，暂时这个接口先不调了)
                // sendCode(requestSearchObj.code).then((res) => {
                    //     console.log(res)
                //     if(res.err !== 0) return beginToast('fail','获取用户权限配置失败',2000)
                //     store.commit('setIs_have_editor',res.data.u)
                // })

                /*
                    页面的DOM全部加载完毕，数据加载完毕后才执行
                    store.state.scanQRcode 这个数据只有扫码进入的时候才会有
                    如果用户点击图标进入地图，则根据当前用户的 usercode 找到 用户的座位以及座位的 scanQRcode
                */
                // 只有第一次扫码进入或者点击图标进入才会有自动定位的效果
                if(window.sessionStorage.getItem('uplode')) return endToast()
                if(store.state.scanQRcode){
                    // 如果有这个参数，则说明是扫码进入或者是通过分享进入的
                    if(window.sessionStorage.getItem('qr_code')){
                        // 本地存储中 qr_code 这个字段说明是通过分享进入的
                        scanCodeFn(store.state.scanQRcode,'share')
                    }else{
                        // 本地存储中没有这个字段，则说明是通过扫码进入的
                        scanCodeFn(store.state.scanQRcode)
                    }
                }else {
                    // 如果没有这个参数，则说明是正常点击图标进入的，得根据当前用户的usercode找到座位的 scanQRcode
                    let scanQRcode = store.getters.AllSeatList.find(item => store.state.UserInfo.usercode === item.id)
                    if(scanQRcode){
                        // 如果找到了当前用户座位的scanQRcode，则调用 scanCodeFn 函数
                        // 传递第二个参数，是为了区分是否为扫码进入，传递 "notSweepCode" 参数，意思就是当前调用函数不是通过扫码进入的
                        scanCodeFn(scanQRcode.qr_code,'notSweepCode')
                    }else{
                        // 没有找到的话用户座位的 scanCodeFn,则提示用户
                        endToast()
                        return beginToast('fail','没有找到您的座位，请与管理员联系',2000)
                    }
                }
                window.sessionStorage.setItem('uplode', true)
            }
        })
        // 将扫码后跳转的逻辑封装
        function scanCodeFn(scanQRcode,intoWay){
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
                    beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = setTransform(beforeSeatAnimateElement,1))
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
                            // 通过扫码进入北京办公区域则显示公共联系人，其他的不显示
                            if(item.office == '1' && !intoWay){
                                store.commit('setIs_show_public_contact_person',true)
                            }
                            if(!intoWay){
                                // 只有通过扫码进入的时候跳转到固资信息页面
                                router.push('/fixedAssets')
                            }
                        }
                    })
                }else if(item.type === 1){
                    // 如果为会议室(传第二个值为固定的，我是自己定义的,只要有值就行，此时定义的 'push',意思是要跳转)
                    if(intoWay === 'share'){
                        // 如果通过会议室分享进入的，不去跳转
                        getMeetingData(item)
                    }else {
                        // 通过会议室扫码才去跳转
                        getMeetingData(item,'push')
                    }
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
                return wx.config({beta: true, debug: false, appId, timestamp, nonceStr, signature, jsApiList: ['scanQRCode', 'invoke','onMenuShareAppMessage','onMenuShareWechat','onMenuShareTimeline']})
            }).then(() => {
                // 默认为 none
                store.commit('setShare','none')
                // 转发
                wx.onMenuShareAppMessage(store.state.share)
                // 微信
                wx.onMenuShareWechat(store.state.share)
                // 朋友圈
                wx.onMenuShareTimeline(store.state.share)
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
            let style = null
            if(store.state.currentFloor === 'three' || store.state.currentFloor === 'four'){
                style = {
                    width: 1777 + 'px',
                    height: 1612 + 'px'
                }
            }else {
                style = {
                    width: 1287 + 'px',
                    height: 571 + 'px'
                }
            }
            style.backgroundImage= `url(/floor_image/1777_1612_${store.getters.floor}层.png)`
            return style
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
            scale_init_x += 1
            scale_init_y += 1
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
                scale_init_x += (e.zoom - firstZoomValue) * 1.1
                scale_init_y += (e.zoom - firstZoomValue) * 1.1
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
            if(scale_init_x < 0.2) {
                scale_init_x = 0.2
                scale_init_y = 0.2
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
            let curentElement = document.getElementById(currentSeat_id) && document.getElementById(currentSeat_id).lastElementChild
            if(curentElement){
                // 2、如果有 curentElement 这个DOM实例，则清除定时器
                clearInterval(curentElement.timer)
                curentElement.style.transform = setTransform(curentElement,1)
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
                    // 当选中会议室图例时，对会议室所有的进行高亮显示
                    if(store.state.currentLegend === 1){
                        seatData.currentAreaCode = currentFloorSeatList.filter(item => item.type === 1).map(item => item.code).join()
                    }
                    // 3、如果有选中的图例
                    return currentFloorSeatList.filter((item) => {
                        return item.type === store.state.currentLegend || item.type === 2 || item.type === 3
                    })
                }else{
                    // 4、没有选中的图例，直接返回currentFloorSeatList
                    return currentFloorSeatList
                }
            }),
            // 动态设置座位盒子的类名
            newSeatClassFn(seatItem){
                return `${seatItem.floor == '3' ? 'three' : seatItem.floor == '4' ? 'four' : 'shenzhen'}-new-seat-${seatItem.toward}`
            },
            // 设置每一个座位总的样式
            seatStyle(seatItem) {
                return {
                    top: seatItem.gColNew + 'px',
                    left: seatItem.gRowNew + 'px'
                }
            },
            // 设置座位里面桌子的样式
            seatDeskStyle(seatItem){
                let deskstyle = null
                // 判断是否为前台
                if(seatItem.seat_id === '3A-Q-099' || seatItem.seat_id === '3A-Q-098' || seatItem.seat_id === '4A-Q-099' || seatItem.seat_id === '888') return {disPlay:'none'}
                if(seatItem.toward === 'west' || seatItem.toward === 'east'){
                    deskstyle = {
                        backgroundImage:`url(/legend-image/desk-column${seatItem.type}.png)`
                    }
                }else{
                    deskstyle = {
                        backgroundImage:`url(/legend-image/desk-row${seatItem.type}.png)`
                    }
                }
                return deskstyle
            },
            // 设置座位里面椅子的样式
            seatChairStyle(seatItem){
                let deskstyle = null
                if(seatItem.toward === 'west' || seatItem.toward === 'east'){
                    deskstyle = {
                        backgroundImage:`url(/legend-image/yizi${seatItem.type}.png)`
                    }
                }else{
                    deskstyle = {
                        backgroundImage:`url(/legend-image/yizi${seatItem.type}.png)`
                    }
                }
                // 判断是否为前台
                if(seatItem.seat_id === '3A-Q-099' || seatItem.seat_id === '4A-Q-099'){
                    deskstyle.transform = `rotate(45deg)`
                }else if(seatItem.seat_id === '3A-Q-098'){
                    deskstyle.transform = `rotate(90deg)`
                }
                return deskstyle
            },
            // 设置每一个区域的样式
            areaStyle(itemData,itemPosition){
                return {
                    position: 'absolute',
                    top:itemPosition.top + 'px',
                    left:itemPosition.left + 'px',
                    width:itemPosition.width + 'px',
                    height: itemPosition.height + 'px',
                    backgroundColor: itemData.backgroundcolor,
                    color:'#646464',
                }
            },
            // 设置当前选中座位的id
            setCurrentSeat_id(value){
                currentSeat_id = value
                beforeSeatAnimateElement = document.getElementById(value) && document.getElementById(value).lastElementChild
                scale_init_x = 2
                scale_init_y = 2
            },
            // 子组件发布的事件，切换路层后，将当前的选中座位和区域的高亮重置
            switchFloor(){
                clearCurrentElementInterval()
                seatData.currentAreaCode = ''
                nextTick(() => {
                    scale_init_x = BodyContainerRef.value.offsetHeight / parseInt(MapBoxRef.value.style.height)
                    scale_init_y = BodyContainerRef.value.offsetHeight / parseInt(MapBoxRef.value.style.height)
                })
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
                    // 设置分享的链接参数为null
                    store.commit('setShare','none')
                    return
                }
                // 设置分享的链接参数为点击座位的qr_code
                store.commit('setShare',seatItem.qr_code)
                beforeSeatAnimateElement && clearInterval(beforeSeatAnimateElement.timer)
                beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = setTransform(beforeSeatAnimateElement,1))
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
                console.log(item);
                if(code === seatData.currentAreaCode){
                    // 如果相同,则取消高亮，以及恢复底部盒子到主页（init）
                    seatData.currentAreaCode = ''
                    // 将底部操作盒子设置为初始状态
                    BottomBoxRef.value.setSearchLegendContant('init')
                    // 当点击座位相同时，判断 scaling 的值，如果 scaling 处于 true 时，不用管，当处于false时，需要将盒子提升上来
                    if(!scaling) MapBoxTapFn()
                    store.commit('setShare','none')
                    return
                }
                store.commit('setShare',item.qr_code)
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
            handleQR,
            partTotaleObject
        }
    }
}
</script>

<style lang="less" scoped>
@import '../style/StyleOfFloorThree/Area/mobile/index.less';
@import '../style/StyleOfFloorFour/Area/mobile/index.less';
@import '../style/StyleOfFloorShenZhen/Area/mobile/index.less';
@import '../style/StyleOfFloorThree/Part/mobile/index.less';
@import '../style/StyleOfFloorFour/Part/mobile/index.less';
@import '../style/StyleOfFloorThree/seat/mobile/index.less';
@import '../style/StyleOfFloorFour/seat/mobile/index.less';
@import '../style/StyleOfFloorShenZhen/seat/mobile/index.less';
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
    justify-content: center;
    background-color: #f3f4f6;
    // 地图盒子
    .map-box{
        position: absolute;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        transition: all 0.5s;
        .area,.part{
            font-size: 14px;
        }
        .part{
            z-index: 2;
            .title{
                color: rgba(0, 0, 0, 0.2);
            }
        }
        // 引用3层新座位的样式
        .threeSeatStyle-mobile;
        // 引用4层新座位样式
        .fourSeatStyle-mobile;
        // 引用深圳新座位样式
        .shenZhenSeatStyle-mobile;
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
            z-index: 5;
            span{
                display: inline-block;
                white-space:nowrap;
            }
        }
        // 引入3层移动端的区域样式
        .threeAreaStyle-mobile;
        // 引入4层移动端的区域样式
        .FourAreaStyle-mobile;
        // 引入深圳移动端的区域样式
        .ShenZhenAreaStyle-mobile;
        // 引入3层移动端的分区样式
        .threePartStyle-mobile;
        // 引入4层移动端的分区样式
        .fourPartStyle-mobile;
    }
}
</style>