<template>
    <!-- 头部区域包括顶部的搜索栏以及图例区域 -->
    <div ref="headerContainerRef" class="header-container">
        <!-- 搜索栏 -->
        <div class="search">
            <div class="floor-switch">
                <span :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key="item.id" v-on:click="handleClickFloor(item.lable)">{{item.name}}<span class="separator" v-if="item.id !== AllArea.length - 1"> / </span></span>
            </div>
            <el-autocomplete v-model="searchState" value-key='name' popper-class='autocomplete' :prefix-icon="Search" :trigger-on-focus="false" :fetch-suggestions="querySearch" class="inline-input" clearable placeholder="请输入员工姓名或座位号" @select="handleSelect" v-on:clear="handleClearInput">
                <!-- 自定义搜索建议列表模板(当有搜索建议时) -->
                <template #default="{ item }" v-if="is_none_sugges">
                    <div class="autoCompleteTemplate" v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">座位人员名称：</span><span class="content">{{item.name || '暂无数据'}}</span></span>
                            <span><span class="title">座位号：</span><span class="content">{{item.seat_id}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine"><span class="title">部门：</span><span class="content">{{item.depart || '暂无数据'}}</span></div>
                    </div>
                    <div class="autoCompleteTemplate" v-if="item.diff === 1 || item.diff === 2">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">区域名称：</span><span class="content">{{item.name + (item.subtitle ? item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") : '') || '暂无数据'}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine">
                            <span><span class="title">区域编号：</span><span class="content">{{item.code}}</span></span>
                        </div>
                    </div>
                </template>
                <!-- 自定义搜索建议列表模板（当无搜索建议时） -->
                <template #default v-else>
                    <div class="is_none_sugges">暂无匹配项</div>
                </template>
            </el-autocomplete>
        </div>
        <!-- 图例 -->
        <div class="legend">
            <div class="legend-item" :class="{'legendItemActive':item.type === $store.state.currentLegend}" v-for="item in legendList" :key="item.id" v-on:click="handleClickLegend(item.type)">
                <img :src="item.url"><span>{{item.name}}</span>
            </div>
        </div>
    </div>
    <!-- 抽屉式弹框、展示选中信息 -->
    <el-drawer custom-class='drawer' modal-class='drawer-mask' v-model="is_show" :with-header="false" direction='btt' :modal='false'>
        <!-- 选中员工座位 -->
        <div class="container" v-if="currentInfo.type === '0'">
            <!-- 第一行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">姓名：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.name || '暂无数据'}}</div>
                </div>
                <!-- 第二列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">座位号：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.seat_id}}</div>
                </div>
            </div>
            <!-- 第二行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">部门：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.depart || '暂无数据'}}</div>
                </div>
                <!-- 第二列 -->
                <div class="col" v-if="$store.state.is_have_ckeck_persontFixedAssets">
                    <!-- 标题 -->
                    <div class="title">资产信息：</div>
                    <!-- 内容 -->
                    <div class="content"><div class="check_button" v-on:click="handleClickAssetsMessage">查看</div></div>
                </div>
            </div>
        </div>
        <!-- 选中资产座位 -->
        <div class="container" v-if="currentInfo.type === '0-2'">
            <!-- 第一行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">资产名称：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.name || '暂无数据'}}</div>
                </div>
                <!-- 第二列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">状态：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.equipment_status}}</div>
                </div>
            </div>
            <!-- 第二行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">座位号：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.seat_id}}</div>
                </div>
                <!-- 第二列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">部门：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.depart || '暂无数据'}}</div>
                </div>
            </div>
        </div>
        <!-- 选中会议室 -->
        <div class="container" v-if="currentInfo.type === 1">
            <!-- 第一行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">会议室名称：</div>
                    <!-- 内容 -->
                    <div class="content">{{ currentInfo.name || '暂无数据' }}</div>
                </div>
                <!-- 第二列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">编号：</div>
                    <!-- 内容 -->
                    <div class="content">{{ currentInfo.code }}</div>
                </div>
            </div>
            <!-- 第二行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">会议室设备：</div>
                    <!-- 内容 -->
                    <div class="content">{{ currentInfo.setting }}</div>
                </div>
                <!-- 第二列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">预定信息：</div>
                    <!-- 内容 -->
                    <div :class="{'content':true, '_content':is_curentMeeting_active}">
                        <template v-if="is_curentMeeting_active">
                            <div class="line">
                                <div class="title">当前预定：</div>
                                <div :class="{'jump':is_curentMeeting_active,'content':true}" v-on:click="handleClickJumpWX(currentInfo.current.USERID)">{{is_curentMeeting_active ? currentInfo.current.USERNAME : '无'}}</div>
                            </div>
                            <div class="line" v-if="is_curentMeeting_active">
                                <div class="title">预定时间：</div>
                                <div class="content">{{currentInfo.current.MDate + ' ' + currentInfo.current.STARTTIME + '-' + currentInfo.current.ENDTIME }}</div>
                            </div>
                        </template>
                        <template v-else>无</template>
                    </div>
                </div>
            </div>
            <!-- 第三行 -->
            <div class="row" v-if="is_have_MeetingHistory">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">预定记录：</div>
                    <!-- 内容 -->
                    <div class="content"><el-button type="text" v-on:click="handleClickMeetingMessage">查看</el-button></div>
                </div>
            </div>
            <!-- 第四行 -->
            <div class="make-btn">
                <button :class="{'disable':is_curentMeeting_active}" type="button" :disabled='is_curentMeeting_active' v-on:click="handleClickJumpOA">预约</button>
            </div>
        </div>
        <!-- 选中空位 -->
        <div class="container" v-if="currentInfo.type === '0-1'">
            <!-- 第一行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">空座</div>
                    <!-- 内容 -->
                    <div class="content"></div>
                </div>
            </div>
            <!-- 第二行 -->
            <div class="row">
                <!-- 第一列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">座位号：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.seat_id}}</div>
                </div>
                <!-- 第二列 -->
                <div class="col">
                    <!-- 标题 -->
                    <div class="title">部门：</div>
                    <!-- 内容 -->
                    <div class="content">{{currentInfo.depart || '暂无数据'}}</div>
                </div>
            </div>
        </div>
    </el-drawer>
    <!-- 展示员工固定资产信息 -->
    <FixedAssets ref="FixedAssetsRef" :FixedAssetsUserName='FixedAssetsUserName' :FixedAssetsList='FixedAssetsList'></FixedAssets>
    <!-- 展示会议室预约记录 -->
    <MeetingRoom ref="MeetingRoomRef" :MeetingRoomName='MeetingRoomName' :MeetingRoomHistoryList='MeetingRoomHistoryList'></MeetingRoom>
</template>

<script>
import {ref, reactive, toRefs, nextTick, onMounted, inject, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox,ElLoading } from 'element-plus'
// 导入消息提示框组件
import { successMessage, infoMessage, errorMessage } from '@/utils/message.js'
// 导入事件中心
import emitter from '../eventbus'
// 导入初始化地图的方法
import initMap from '@/utils/initMap.js'
import { Search } from '@element-plus/icons-vue'

// 导入座位高亮的逻辑
import scaleSeat from '@/utils/scaleSeat.js'
// 导入区域高亮的逻辑
import searchArea from '@/utils/searchArea.js'
// 导入获取会议室相关信息的api
import { getMeeting } from '@/api/getMeeting.js'
// 导入固资信息的子组件
import FixedAssets from '../compontent/FixedAssets'
// 导入会议室预定记录的子组件
import MeetingRoom from '../compontent/meetingRoom'

// 导入与企业微信通讯相关的接口
import { getLaunchCode, getAgentConfig, getQrConfig } from '@/api/jumpWX.js'

// 导入对会议室排序的公共方法
import sortMeetingList from '@/views-rem/hook/sortArray.js'
export default {
    name:'Header',
    components:{
        FixedAssets,MeetingRoom
    },
    setup(){
        // 判断当前的版本 agentConfig 配置是否成功
        let is_agentConfig_success = true
        onBeforeMount(() => {
            // 首先要获取当前页面的url
            const url = window.location.href
            getQrConfig(url).then(res => {
                const { appId, timestamp, nonceStr, signature } = res.data
                return wx.config({beta: true, debug: false, appId, timestamp, nonceStr, signature, jsApiList: ['scanQRCode', 'invoke', 'closeWindow'] })
            }).then(() => {
                if(store.state.intoTheWay !== 'weixin') return
                getAgentConfig(url).then(res => {
                    const { timestamp, nonceStr, signature } = res.data
                    wx.agentConfig({
                        corpid: 'wwf52dc03299bc0260', // 必填，企业微信的corpid，必须与当前登录的企业一致
                        agentid: store.state.UserInfo.appid, // 必填，企业微信的应用id （e.g. 1000247）
                        timestamp, // 必填，生成签名的时间戳
                        nonceStr, // 必填，生成签名的随机串
                        signature,// 必填，签名，见附录-JS-SDK使用权限签名算法
                        jsApiList: ['openDefaultBrowser'], //必填，传入需要使用的接口名称
                        fail: function(res) {
                            if(res.errMsg.indexOf('function not exist') > -1){
                                return errorMessage('版本过低请升级')
                            }
                            is_agentConfig_success = false
                            errorMessage(res.errMsg)
                        }
                    })
                })
            })
        })
        // 获取浏览器可视区宽高的依赖注入
        const obj = inject('clent')
        const headerContainerRef = ref(null)// 窗体发生变化时，用于防抖计时器id
        let resizeTimer = null
        // 组件挂载时
        onMounted(() => {
            /**
             * 0.625和0.124是开发时，当前盒子的宽度和高度除以当前可视区宽度和高度，计算出来的比值
             * 这样就实现了，简单的屏幕自适应，用户当前浏览器可视区的宽高乘以这个比例，就是合适的宽高
            */
            headerContainerRef.value.style.width = obj.width * 0.625 + 'px'
            headerContainerRef.value.style.height = obj.height * 0.124 + 'px'
            window.addEventListener('resize',function (e){
                clearTimeout(resizeTimer)
                resizeTimer = this.setTimeout(() => {
                    headerContainerRef.value.style.width = e.target.innerWidth * 0.625 + 'px'
                    headerContainerRef.value.style.height = e.target.innerHeight * 0.124 + 'px'
                },300)
            })
        })
        // 监听兄弟组件Main发布的自定义事件from，将弹框显示
        emitter.on('form', data => {
            if(data){
                // 需要判断传递过来的类型
                if(data.type === 1){
                    // 1为会议室，需要调接口，来获取会议室信息
                    getMeetingInfo(data.code)
                }else{
                    // 其他的类型直接赋值即可
                    drawerData.currentInfo = data
                    drawerData.is_show = true
                }
            }else{
                drawerData.currentInfo = {}
                drawerData.is_show = false
            }
        })
        const store = useStore()
        // 切换地图区域的数据
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'},
            {id:2,name:'深圳',lable:'shenzhen'}
        ]
        // 切换楼层（或地区）的处理函数
        function handleClickFloor(floor){
            if(floor === store.state.currentFloor) return
            // 设置当前选中的楼层（或地区）
            store.commit('setCurrentFloor',floor)
            // 将弹框关闭
            drawerData.is_show = false
            // 切换楼层（或地区）时，将地图初始化
            initMap()
        }
        // 定义模糊搜索框的相关数据与方法
        const searchData = reactive({
            // 模糊搜索的关键字
            searchState:'',
            // 是否有匹配项
            is_none_sugges:true, // 默认是有匹配项
            // 搜索建议
            querySearch(queryString, callback) {
                searchData.is_none_sugges = true
                let searchArray = store.getters.AllSeatList
                const results = searchArray.filter(item => {
                    return (item.name && item.name.toString().replace(/\s/g,"").toUpperCase().includes(queryString.toUpperCase())) || (item.seat_id && item.seat_id.includes(queryString.toUpperCase())) || (item.code && item.code.toUpperCase().includes(queryString.toUpperCase())) || (item.subtitle && item.subtitle.replace(/\s/g,"").toUpperCase().includes(queryString.toUpperCase()))
                })
                // 去除多个重复的项
                // 保存关于座位的(这里面的值都是唯一的)
                let array_seat = []
                // 保存关于区域的(这里面的值可能是有重复的)
                let array_area = []
                results.forEach(item => {
                    if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                        array_seat.push(item)
                    }else{
                        array_area.push(item)
                    }
                })
                let obj = {}
                array_area.forEach(item => {
                    if(!obj[item.code]) obj[item.code] = []
                    obj[item.code].push(item)
                })
                for(let key in obj){
                    array_seat.push(obj[key][0])
                }
                if(array_seat.length !== 0){
                    callback(array_seat)
                }else{
                    callback([{name:''}])
                    searchData.is_none_sugges = false
                }
            },
            // 点击搜索建议下拉框某一项的处理程序
            handleSelect(item) {
                if(!searchData.is_none_sugges) return
                // 如果是触发某一项搜索，首先要把当前的图例复原，全部的dom渲染出来
                store.commit('setCurrentLegend','')
                // 要使用 nextTick 函数获取更新后的dom元素
                nextTick(() => {
                    // 判断搜索的类型，是座位还是区域
                    if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                        // 如果搜索的是座位，则执行下面的逻辑
                        // 选中某一项，首先判断该员工的座位，是否在当前楼层
                        if(item.floor == store.getters.floor){
                            // 如果相同
                            // 1、获取座位id号对应的元素DOM
                            let el = document.getElementById(item.seat_id)
                            emitter.emit('SearchSeat',item.seat_id)
                            scaleSeat(el)
                            drawerData.is_show = true
                            drawerData.currentInfo = item
                            if(item.type === '0'){
                                // 搜索座位时，就判断当前用户是否有权限查看被点击员工的固资信息
                                store.dispatch('getPersontFixedAssetsList',{ b_usercode:item.id, v_usercode:store.state.UserInfo.usercode })
                            }
                        }else{
                            // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                            ElMessageBox.confirm(
                                `查找的员工座位不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                                '提示',
                                {
                                    cancelButtonText: '取消',
                                    confirmButtonText: '跳转',
                                    type: 'info',
                                }
                            ).then(() => {
                                // 判断将要切换的楼层
                                let pushFloor = null
                                if(item.floor == 3 && item.office == '1'){
                                    pushFloor = 'three'
                                }else if(item.floor == 4 && item.office == '1'){
                                    pushFloor = 'four'
                                }else if(item.floor == 7 && item.office == '2'){
                                    pushFloor = 'shenzhen'
                                }
                                handleClickFloor(pushFloor)
                                drawerData.is_show = true
                                drawerData.currentInfo = item
                                if(item.type === '0'){
                                    // 搜索座位时，就判断当前用户是否有权限查看被点击员工的固资信息
                                    store.dispatch('getPersontFixedAssetsList',{ b_usercode:item.id, v_usercode:store.state.UserInfo.usercode })
                                }
                                nextTick(() => {
                                    let el = document.getElementById(item.seat_id)
                                    emitter.emit('SearchSeat',item.seat_id)
                                    scaleSeat(el)
                                    successMessage('切换成功')
                                })
                            }).catch(() => {
                                infoMessage(`您可以手动切换到${item.floor}楼查找`)
                            })
                        }
                    }else{
                        // 判断搜索的项是否在当前楼层
                        if(item.floor == store.getters.floor){
                            // 如果相同
                            const obj = searchArea(item.code)
                            emitter.emit('activeArea',obj)
                            // 如果搜索的不是会议室，则不需要将弹框显示出来
                            if(item.type !== 1) return drawerData.is_show = false
                            getMeetingInfo(item.code) // 调接口获取会议室相关信息
                        }else{
                            // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                            ElMessageBox.confirm(
                                `查找的员工座位不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                                '提示',
                                {
                                    cancelButtonText: '取消',
                                    confirmButtonText: '跳转',
                                    type: 'info',
                                }
                            ).then(() => {
                                // 判断将要切换的楼层
                                let pushFloor = null
                                if(item.floor == 3 && item.office == '1'){
                                    pushFloor = 'three'
                                }else if(item.floor == 4 && item.office == '1'){
                                    pushFloor = 'four'
                                }else if(item.floor == 7 && item.office == '2'){
                                    pushFloor = 'shenzhen'
                                }
                                handleClickFloor(pushFloor)
                                nextTick(() => {
                                    const obj = searchArea(item.code)
                                    emitter.emit('activeArea',obj)
                                    successMessage('切换成功')
                                    // 如果搜索的不是会议室，则不需要将弹框显示出来
                                    if(item.type !== 1) return drawerData.is_show = false
                                    getMeetingInfo(item.code) // 调接口获取会议室相关信息
                                })
                            }).catch(() => {
                                infoMessage(`您可以手动切换到${item.floor}楼查找`)
                            })
                        }
                        searchData.searchState = item.name + (item.subtitle ? item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") : '')
                    }
                })
            },
            // 点击搜索框中清除图标的处理程序
            handleClearInput() {
                // 点击清除按钮以后,input框需要重新获取一下焦点，要不然，搜索建议框就不显示了，这个可能是组件的一个bug吧
                let input = document.querySelector('.inline-input .el-input__inner')
                input.blur()
                input.focus()
            },
        })
        // 定义图例的数据和方法
        const legendData = reactive({
            legendList:[
                {id:0,name:'员工',lable:'employees',type:'0',url:'/legend-image/image0.png'},
                {id:1,name:'空闲',lable:'free',type:'0-1',url:'/legend-image/image1.png'},
                {id:2,name:'占用',lable:'occupation',type:'0-2',url:'/legend-image/image2.png'},
                {id:3,name:'会议室',lable:'meeting-room',type:1,url:'/legend-image/icon_meeting.png'},
            ],
            // 点击某一个图例触发的函数
            handleClickLegend(type) {
                wx.closeWindow()
                store.commit('setCurrentLegend',type)
                // 将弹框关闭
                drawerData.is_show = false
                // 切换图例时，初始化地图
                initMap()
            }
        })
        // 定义抽屉式弹框的相关数据
        const drawerData = reactive({
            // 控制弹框的显示隐藏
            is_show:false,
            // 当前座位人员的信息集合
            currentInfo:{},
            // 点击查看固资信息
            handleClickAssetsMessage(){
                if(!store.state.is_have_ckeck_persontFixedAssets) return errorMessage('没有权限查看')
                // 赋值姓名
                FixedAssetsUserName.value = store.state.PersontFixedAssetsList.UserName
                // 赋值固资列表
                FixedAssetsList.value = store.state.PersontFixedAssetsList.FixedChildList
                // 将弹框显示出来
                FixedAssetsRef.value.setFixedAssets_dialog(true)
            },
            // 点击查看会议室预约记录
            handleClickMeetingMessage(){
                MeetingRoomRef.value.setMeetingRoom_dialog(true)
            },
            // 点击当前预约人，跳转到企业微信个人聊天窗口
            handleClickJumpWX(USERID){
                if(!is_curentMeeting_active.value) return
                const loading = ElLoading.service({
                    lock: true,
                    text: '跳转中请稍等',
                    background: 'rgba(0, 0, 0, 0.7)',
                })
                // 然后执行跳转的逻辑
                // 1、获取 launch_code
                const obj = {
                    operator_userid:store.state.UserInfo.userid,
                    single_chat:{
                        userid:USERID
                    }
                }
                getLaunchCode(obj).then( res => {
                    loading.close()
                    if(res.err !== 0) return errorMessage(res.msg)
                    // 3、跳转到企业微信新个人对话窗口
                    window.location.href = 'wxwork://launch?launch_code=' + res.launch_code
                }).catch((error) => {
                    loading.close()
                    errorMessage('跳转失败,请重试或者手动打开')
                })
            }
        })
        // 当前固资信息的员工名称
        let FixedAssetsUserName = ref('')
        // 固资信息集合
        let FixedAssetsList = ref([])
        // 获取固资信息组件的实例
        const FixedAssetsRef = ref(null)

        
        // 定义一个变量，判断会议室当前是否有预约
        let is_curentMeeting_active = ref(true) // 默认是有预约记录的
        // 会议室的名称
        let MeetingRoomName = ref('')
        // 会议室预定预约记录
        let MeetingRoomHistoryList = ref([])
        // 获取会议室预定预约子组件的实例
        const MeetingRoomRef = ref(null)
        // 当前会议室是否有预约记录
        let is_have_MeetingHistory = ref(true)
        // 获取会议室的名称、设备、当前预约、历史预约记录
        function getMeetingInfo(code){
            getMeeting(code).then(res => {
                if(res.code !== 0) {
                    drawerData.is_show = false
                    return infoMessage(res.message)
                }
                // 将 res.data 结构出来
                const { name, setting, current, HistoryList } = res.data
                // 选中会议室的相关信息赋值
                drawerData.currentInfo = {
                    // 类型为1
                    type:1,
                    // 会议室名称
                    name,
                    // 会议室编号
                    code,
                    // 会议室设备
                    setting,
                    // 当前预约记录
                    current
                }
                // 判断当前会议室有没有人预定
                // 要判断 current 这个字段值类型
                if(typeof current === 'string' && current === ''){
                    // 如果 current 值类型为字符串并且值为空
                    is_curentMeeting_active.value = false
                }else if(Object.prototype.toString.call(current) === '[object Object]'){
                    // 如果为对象，则继续判断是否为空数组
                    if(Object.getOwnPropertyNames(current).length === 0){
                        // 如果长度为0，则当前没有人预定会议室
                        is_curentMeeting_active.value = false
                    }else{
                        is_curentMeeting_active.value = true
                    }
                }else if(Object.prototype.toString.call(current) === '[object Array]'){
                    // 如果为数组，则判断是否为空数组
                    if(current.length === 0){
                        // 如果长度为0，则当前没有人预定会议室
                        is_curentMeeting_active.value = false
                    }else{
                        is_curentMeeting_active.value = true
                    }
                }else{
                    is_curentMeeting_active.value = true
                }
                drawerData.is_show = true
                // 赋值会议室名称、预定预约记录
                MeetingRoomName.value = name
                MeetingRoomHistoryList.value = sortMeetingList(HistoryList)
                if(HistoryList.length){
                    // 如果 HistoryList 的长度不等于0
                    is_have_MeetingHistory.value = true
                }else{
                    //如果等于0
                    is_have_MeetingHistory.value = false
                }
            }).catch(error => {
                errorMessage(error)
            })
        }
        // 点击预约 跳转 OA 
        function handleClickJumpOA(){
            if(is_curentMeeting_active.value === false){
                if(store.state.intoTheWay === 'weixin'){
                    if(!is_agentConfig_success) return errorMessage('当前企业微信版本太低或者agentConfig配置失败，请确认！')
                    const loading = ElLoading.service({
                        lock: true,
                        text: '跳转中请稍等',
                        background: 'rgba(0, 0, 0, 0.7)',
                    })
                    wx.invoke('openDefaultBrowser', {
                        'url': `https://oabak.longtubas.com/Default.aspx?Type=100000;103000;200202&usercode=${store.state.UserInfo.usercode}&clickid=meeting`
                    }, function(res){
                        loading.close()
                        if(res.err_msg != "openDefaultBrowser:ok") errorMessage('跳转失败，请重试')
                    })
                }else if(store.state.intoTheWay === 'OA'){
                    window.open(`https://oabak.longtubas.com/Default.aspx?Type=100000;103000;200202&usercode=${store.state.UserInfo.usercode}&clickid=meeting`)
                }
            }
        }
        return {
            AllArea,
            ...toRefs(searchData),
            ...toRefs(legendData),
            ...toRefs(drawerData),
            handleClickFloor,
            headerContainerRef,
            Search,
            FixedAssetsRef,
            FixedAssetsUserName,
            FixedAssetsList,
            is_curentMeeting_active,
            MeetingRoomHistoryList,
            MeetingRoomName,
            MeetingRoomRef,
            is_have_MeetingHistory,
            handleClickJumpOA,
        }
    }
}
</script>

<style lang="less" scoped>
.header-container{
    // width: 1200px; // 0.625
    // height: 120px; // 0.124
    margin: 0 auto;
    .search{
        width: 100%;
        height: 41.66666667%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px;
        .floor-switch{
            font-size: 16px;
            span{
                cursor: pointer;
                &.active{
                    color: chocolate;
                    .separator{
                        color: #000;
                    }
                }
            }
        }
    }
    .legend{
        width: 100%;
        height: 58.33333333%;
        background-color: #f3f4f6;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .legend-item{
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.15s;
            img{
                height: 32px;
                width: 32px;
                margin-right: 5px;
            }
        }
        .legendItemActive{
            transform: scale(1.2);
        }
    }
}
</style>