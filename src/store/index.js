import { createStore } from 'vuex'
// 导入本地存储的函数
import { setItem, getItem } from '@/utils/storage.js'
// 导入获取座位信息的接口
import { getSeatList } from '@/api/getSeatList'
// 导入获取区域信息的接口
import { getAreaList } from '@/api/getArea.js'
// 导入消息提示框组件
import { errorMessage } from '@/utils/message.js'
// 导入结束提示框的方法
import { endToast, beginToast } from '@/views-rem/hook/toast.js'
import router from '@/router'
// 导入获取个人固资的api-移动端
import { getFixedassets_Mobile } from '@/api/getFixedassets_Mobile.js'
export default createStore({
    state: {
        // 当前选中的楼层（或地区）
        currentFloor:getItem('currentFloor'),
        // 3层的座位信息
        seatListOfthree: [],
        // 4层的座位信息
        seatListOfFour: [],
        // 当前选中的图例(此项不做本地缓存)
        currentLegend:'', // 默认是空字符串
        // 当前的地图的初始缩放系数
        scale:getItem('scale') || [1,1], // 默认是1

        // 3层的区域信息
        areaListOfThree: [],
        // 4层的区域信息
        areaListOfFour: [],
        // ---------------------------------------------
        // 移动端中的数据，当前选中的项
        activeInfo: getItem('activeInfo'),
        // 移动端需要清理的定时器id集合
        timerArray: [],
        // 这个是延时器的id
        timer: null,
        // span 元素变量
        spanElement: null,
        // 移动端可视区的高度
        ClentHeight: 0,
        // 当前用户是否有编辑的权限
        is_have_editor: false, // 默认是false，没有编辑权限
        // 移动端的个人固资列表
        PersontFixedAssetsList: getItem('PersontFixedAssetsList'),

        // 当前登录人的 code
        // 如果是通过OA平台进入的项目，需要设置这个 code
        // 如果是扫码进入的项目，也需要设置这个code
        UserInfo: getItem('UserInfo'),
        // 扫码跳转时，座位或者区域的唯一标识
        scanQRcode: getItem('scanQRcode') || '',
        // 扫条形码得到的数据（移动端）
        scanBarcodeInfoObject: getItem('scanBarcodeInfoObject') || {},
        // 通过 OA 进入项目或者通过企业微信进入项目标识
        intoTheWay: getItem('intoTheWay') || null
    },
    mutations: {
        // 设置当前选中的楼层（或地区）
        setCurrentFloor(state,data) {
            state.currentFloor = data
            setItem('currentFloor',state.currentFloor)
        },
        // 设置3层的座位信息
        setSeatListOfthree(state,data) {
            state.seatListOfthree = data
        },
        // 设置4层的座位信息
        setSeatListOfFour(state,data) {
            state.seatListOfFour = data
        },
        // 设置currentLegend图例
        setCurrentLegend(state,data) {
            // 判断currentLegend的值与传递过来的data是否相同，相同的话，就是取消，不相同就是设置
            state.currentLegend = state.currentLegend === data ? '' : data
        },
        // 设置低于初始化缩放系数
        setScale(state,data) {
            state.scale = data
            setItem('scale',state.scale)
        },

        // 设置3层的区域信息列表
        setAreaListOfThree(state,data){
            state.areaListOfThree = data
        },
        // 设置4层的区域信息列表
        setAreaListOfFour(state,data){
            state.areaListOfFour = data
        },



        // 设置当前操作用户的个人信息 (移动端和PC端都会用到)
        setUserInfo(state,data){
            state.UserInfo = data
            setItem('UserInfo',state.UserInfo)
        },

        // 设置移动端中选中项的数据
        setActiveInfo(state,data) {
            state.activeInfo = data
            setItem('activeInfo',state.activeInfo)
        },

        // 设置定时器的id集合
        setTimerArray(state,data) {
            state.timerArray = data
        },
        // 设置延时器的id
        setTimer(state,data) {
            state.timer = data
        },
        // 设置span元素变量
        setSpanElement(state,data) {
            state.spanElement = data
        },
        // 设置浏览器可视区高度
        setClentHeight(state,data) {
            state.ClentHeight = data
        },
        // 设置当前用户是否有编辑的权限
        setIs_have_editor(state,data){
            state.is_have_editor = data == 1 ? true : false
        },
        // 设置个人固资列表
        setPersontFixedAssetsList(state, data) {
            // 添加一个工位号信息
            data.seat_id = state.activeInfo.seat_id
            state.PersontFixedAssetsList = data
            setItem('PersontFixedAssetsList',state.PersontFixedAssetsList)
        },
        // 设置移动端扫码跳转时唯一标识
        setScanQRcode(state, data){
            state.scanQRcode = data
            setItem('scanQRcode',state.scanQRcode)
        },
        // 设置移动端扫条形码得到的数据
        setScanBarcodeInfoObject(state, data){
            state.scanBarcodeInfoObject = data
            setItem('scanBarcodeInfoObject',state.scanBarcodeInfoObject)
        },

        // 设置 进入方式
        setIntoTheWay(state, data) {
            state.intoTheWay = data
            setItem('intoTheWay',state.intoTheWay)
        }
    },
    actions: {
        // 获取3层的座位信息
        async getSeatListOfthree(context) {
            try{
                const {data} = await getSeatList(3)
                context.commit('setSeatListOfthree',data)
            }catch(error){
                endToast()
                errorMessage(error)
            }
        },
        // 获取4层的座位信息
        async getSeatListOfFour(context) {
            try{
                const {data} = await getSeatList(4)
                context.commit('setSeatListOfFour',data)
            }catch(error){
                endToast()
                errorMessage(error)
            }
        },
        // 获取3层的区域信息
        async getAreaListOfThree(context){
            try{
                const {data} = await getAreaList(3)
                context.commit('setAreaListOfThree',data)
            }catch(error){
                endToast()
                errorMessage(error)
            }
        },
        // 获取4层的区域信息
        async getAreaListOfFour(context){
            try{
                const {data} = await getAreaList(4)
                context.commit('setAreaListOfFour',data)
            }catch(error){
                endToast()
                errorMessage(error)
            }
        },
        // 获取个人固资列表数据(移动端)
        async getPersontFixedAssetsList(context,code) {
            try{
                const res = await getFixedassets_Mobile(code)
                if(res.code !== 0) return beginToast('fail', res.message, 2000)
                context.commit('setPersontFixedAssetsList',res.data)
                // 跳转到固资信息页面
                router.push('/fixedAssets')
            }catch(error){
                endToast()
                errorMessage('获取个人固资失败',error)
            }
        }
    },
    getters: {
        // 3层的座位人员信息和区域会议室信息集合
        seatAndAreaListOfThree(state){
            return state.seatListOfthree && state.seatListOfthree.concat(state.areaListOfThree)
        },
        // 4层的座位人员信息和区域会议室信息集合
        seatAndAreaListOfFour(state){
            return state.seatListOfFour && state.seatListOfFour.concat(state.areaListOfFour)
        },
        // 全部座位人员以及区域信息集合
        AllSeatList(state,getter){
            return getter.seatAndAreaListOfThree && getter.seatAndAreaListOfThree.concat(getter.seatAndAreaListOfFour)
        },
        // 根据currentFloor得到当前的楼层（或地区）的数值
        floor(state) {
            return state.currentFloor === 'three' ? 3 : 4
        }
    }
})
