<template>
    <div ref="MapContainerRef" class="map-container">
        <!-- 指针 -->
        <i class="iconfont oamap-north"></i>
        <!-- 放大缩小按钮 -->
        <div class="scale-btn">
            <i v-on:click="MapBoxAmplification(0.2)" class="iconfont oamap-jiahao"></i>
            <i v-on:click="initMap('huifu')" class="iconfont oamap-huifu"></i>
            <i v-on:click="MapBoxReduce(0.2)" class="iconfont oamap-jianhao"></i>
        </div>
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <template v-for="item in mapList" :key="item.id">
                <!-- 办公分区 -->
                <template v-if="item.diff && item.diff === 2 && item.floor !== 7">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 由单个组成 -->
                        <div :id="'part' + item.id" :class="['part',item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="oneAreaStyle(item)">
                            <div class="title">
                                <span>{{item.name}}</span>
                                <span>({{partTotaleObject[item.code]}})</span>
                            </div>
                        </div>
                    </template>
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Array]'">
                        <template v-for="(item2,index) in item.coordinate" :key="item.id + index">
                            <!-- 有多个组成 -->
                            <div :id="'part' + item.id + index" :class="['part',item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="multipleAreaStyle(item,item2,index)">
                                <div class="title" v-if="item2.show_area_name">
                                    <span>{{item.name}}</span>
                                    <span>({{partTotaleObject[item.code]}})</span>
                                </div>
                            </div>
                        </template>
                    </template>
                </template>
                <!-- 部门、会议室、其他区域 -->
                <template v-if="item.diff && item.diff === 1">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 由单个矩形组成 -->
                        <div :id="item.code + item.id" :class="[item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="oneAreaStyle(item)" v-on:click="handleClickMeetingRoom(item)">
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
                        <template v-for="(item2,index) in item.coordinate" :key="item.id + index">
                            <!-- 由多个矩形组成 -->
                            <div :id="item.code + index" :class="[item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="multipleAreaStyle(item,item2,index)" v-on:click="handleClickMeetingRoom(item)">
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
                <!-- 座位 -->
                <template v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                    <div class="seat" :id="item.seat_id" v-on:click="handleClickSeat(item,$event.target)" :style="seatItemStyle(item)" v-on:mouseenter="seatMouseenter(item,$event)" v-on:mouseleave="seatMouseleave">
                    </div>
                </template>
            </template>
            <!-- 鼠标经过每一个座位的提示框 -->
            <div ref="tooltipRef" class="tooltip" v-show="is_show_tooltip" v-text="tooltipText"></div>
        </div>
    </div>
</template>

<script>
import {ref,computed,onMounted,onBeforeUnmount, reactive, toRefs, inject, watch, nextTick} from 'vue'
import { useStore } from 'vuex'
// 导入获取鼠标在盒子内的坐标函数
import getMouseX_Y from '@/utils/getmouseX_Y.js'
// 导入事件中心
import emitter from '../eventbus.js'
// 导入初始化地图的方法
import initMap from '@/utils/initMap.js'

// 导入座位高亮的逻辑
import scaleSeat from '@/utils/scaleSeat.js'
// 导入区域高亮的逻辑
import searchArea from '@/utils/searchArea.js'
// 导入消息提示框组件
import { successMessage, infoMessage, errorMessage } from '@/utils/message.js'
export default {
    name:'Main',
    setup(){
        // 监听搜索区域高亮事件
        emitter.on('activeArea',({code, scaleX, scaleY}) => {
            // 触发了区域高亮事件时，将座位的动画停止
            clearCurrentElementInterval()
            seatData.currentAreaCode = code
            sacleX = scaleX || store.state.scale[0]
            sacleY = scaleY || store.state.scale[1]
        })
        // 监听搜索座位高亮事件
        emitter.on('SearchSeat', (seat_id) => {
            currentSeat_id = seat_id
            beforeSeatAnimateElement && clearInterval(beforeSeatAnimateElement.timer)
            beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = `scale(1)`)
            beforeSeatAnimateElement = document.getElementById(seat_id)
            // 将区域的高亮取消
            seatData.currentAreaCode = ''
            // 同步搜索变量
            sacleX = 3
            sacleY = 3
        })
        // 获取各分区的座位数
        const partTotaleObject = inject('partTotaleObject')
        // 获取浏览器可视区宽高的依赖注入
        const obj = inject('clent')
        const store = useStore()
        // 控制提示框的显示与隐藏
        const is_show_tooltip = ref(false)
        // 提示框的值
        const tooltipText = ref('')
        // 获取提示框的实例对象
        const tooltipRef = ref(null)

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
        // 当前地图的信息（包括人员、座位、区域、会议室等）
        let seatData = reactive({
            // 人员信息座位集合
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
            // 当前选中的区域
            currentAreaCode:'',
            // 设置每一个座位的样式
            seatItemStyle(seatItem) {
                let styleObject = {}
                if((seatItem.floor == '3' || seatItem.floor == '4') && seatItem.office == '1'){
                    styleObject = {
                        top:seatItem.gRow * 9.64 + 23 +'px',
                        left:seatItem.gCol * 9.6 + 35 +'px',
                    }
                }else if(seatItem.floor == '7' && seatItem.office == '2'){
                    styleObject = {
                        top: (seatItem.gCol / 571) * 843 +'px',
                        left: (seatItem.gRow / 1287)  * 930 +'px',
                    }
                }
                styleObject.backgroundImage = `url(/legend-image/image${seatItem.type === '0' ? '0' : seatItem.type === '0-1' ? '1' : '2'}.png)`
                return styleObject
            },
            // 设置每一个区域的样式（单个区域）
            oneAreaStyle(item){
                let styleObject = {}
                if((item.floor == '3' || item.floor == '4') && item.office == '1'){
                    styleObject = {
                        position: 'absolute',
                        top:item.coordinate.top / 1612 * 843 + 'px',
                        left:item.coordinate.left / 1777 * 930 + 'px',
                        width:item.coordinate.width / 1777 * 930 + 'px',
                        height: item.coordinate.height / 1612 * 843 + 'px',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464',
                        fontSize:'12px'
                    }
                }else if(item.floor == '7' && item.office == '2'){
                    styleObject = {
                        position: 'absolute',
                        top:item.coordinate.top / 571 * 843 + 'px',
                        left:item.coordinate.left / 1287 * 930 + 'px',
                        width:item.coordinate.width / 1287 * 930 + 'px',
                        height: item.coordinate.height / 571 * 843 + 'px',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464',
                        fontSize:'12px'
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
                        top:item2.top / 1612 * 843 + 'px',
                        left:item2.left / 1777 * 930 + 'px',
                        width:item2.width / 1777 * 930 + 'px',
                        height: item2.height / 1612 * 843 + 'px',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464',
                        fontSize:'12px'
                    }
                }else if(item.floor == '7' && item.office == '2'){
                    styleObject = {
                        position: 'absolute',
                        top:item2.top / 571 * 843 + 'px',
                        left:item2.left / 1287 * 930 + 'px',
                        width:item2.width / 1287 * 930 + 'px',
                        height: item2.height / 571 * 843 + 'px',
                        backgroundColor: item.backgroundcolor,
                        color:'#646464',
                        fontSize:'12px'
                    }
                    // 单独为深圳地区的 "其他" 区域，设置背景色
                    if((item.code + index) === 'QY02020700310'){
                        styleObject.backgroundColor = 'rgba(2, 122, 255, 0.05)'
                    }
                }
                return styleObject
            },
            // 鼠标进入每一个座位的处理程序
            seatMouseenter(seatItem,$event) {
                tooltipRef.value.style.top = $event.target.offsetTop - 34 + 'px'
                tooltipRef.value.style.left = $event.target.offsetLeft - 14 + 'px'
                is_show_tooltip.value = true
                tooltipText.value = seatItem.seat_id
            },
            // 鼠标离开每一个座位的处理程序
            seatMouseleave() {
                is_show_tooltip.value = false
                tooltipText.value = ''
            }
        })
        // MapBoxRef盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片
            return {
                backgroundImage: `url(/floor_image/1777_1612_${store.getters.floor}层.png)`,
            }
        })
        // 当前的元素
        let currentElement = null
        // 鼠标点击每一个座位的事件处理函数
        function handleClickSeat(seatItem,target){
            // 触发座位的点击事件，将区域的选中状态置空
            seatData.currentAreaCode = ''
            // 点击某一个座位将当前座位的seat_id赋值给current，将当前选中的座位高亮，再点击同一个座位取消高亮
            if(seatItem.seat_id === currentSeat_id){
                currentElement = null
                // 如果相同，则清除当前元素的定时器
                clearCurrentElementInterval()
                // 向兄弟组件header发布一个自定义事件form，参数为空字符串
                return emitter.emit('form','')
            }else{
                beforeSeatAnimateElement && clearInterval(beforeSeatAnimateElement.timer)
                beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = `scale(1)`)
                beforeSeatAnimateElement = target
                currentSeat_id = seatItem.seat_id
                emitter.emit('form',seatItem)
            }
            scaleSeat(target)
            currentElement = target
            // 将当前的sacle变量设置为300,这样的话，点击某一个座位后，再滚动滚轮就不会出现卡顿、地图移动的bug，这样更友好
            sacleX = 3
            sacleY = 3
            if(seatItem.type === '0'){
                // 点击座位时，就判断当前用户是否有权限查看被点击员工的固资信息
                store.dispatch('getPersontFixedAssetsList',{ b_usercode:seatItem.id, v_usercode:store.state.UserInfo.usercode })
            }
        }
        // 鼠标点击会议室的事件处理程序
        function handleClickMeetingRoom(item){
            // 将当前项的字段结构出来
            const {type,code} = item
            // 排出掉除会议室以外的点击
            if(type !== 1) return
            // 座位的高亮清除定时器
            clearCurrentElementInterval()
            currentElement = null
            // 判断当前点击的和已经选中的值，是否相同
            if(seatData.currentAreaCode === code){
                // 如果点前点击的和选中的一致，则取消高亮状态
                seatData.currentAreaCode = ''
                // 向兄弟组件发布事件，将弹框关闭
                return emitter.emit('form','')
            }
            seatData.currentAreaCode = code
            emitter.emit('form',item)
            // 调用区域高亮的方法
            const { scaleX, scaleY } = searchArea(code)
            sacleX = scaleX
            sacleY = scaleY
        }
        // 创建地图容器的实例对象
        const MapBoxRef = ref(null)
        const MapContainerRef = ref(null)
        // 定义鼠标在地图内的坐标
        let x = null
        let y = null
        // 窗体发生变化时，用于防抖计时器id
        let resizeTimer = null
        onMounted(() => {
            /**
             * 0.625和0.872是开发时，当时的盒子的宽高除以当时浏览器可视区的宽高，计算出来的比例
             * 这样就实现了，简单的屏幕自适应，用户当前浏览器可视区的宽高乘以这个比例，就是合适的宽高
            */
            // 手动设置MapContainerRef盒子的宽高
            MapContainerRef.value.style.width = obj.width * 0.625 + 'px'
            MapContainerRef.value.style.height = obj.height * 0.872 + 'px'
            // 监听鼠标在MapBoxRef盒子内的按压事件
            MapContainerRef.value.addEventListener('mousedown', mouseDown)
            // 监听鼠标的弹起事件，移除对鼠标移动事件的监听
            document.addEventListener('mouseup', mouseUp)
            // chrome and ie
            MapContainerRef.value.addEventListener('mousewheel',handleScale_chrome_ie)
            // firefox
            MapContainerRef.value.addEventListener("DOMMouseScroll",handleScale_firefox)
            // 手动设置MapBoxRef盒子的缩放比例，根据父盒子的大小（1200 ，845）
            // scalex: MapContainerRef盒子实际的宽度 / MapContainerRef原来的盒子宽度
            // scaley: MapContainerRef盒子的实际高度 / MapContainerRef运来盒子的高度
            let scalex = (obj.width * 0.625) / 1200
            let scaley = (obj.height * 0.872) / 845
            // 判断两个缩放系数的差值大小，如果两个比例差值的绝对值大于0.2，则将 scalex 和 scaley 值以最小的为准
            if(Math.abs(scalex - scaley) > 0.2){
                scalex = Math.min(scalex,scaley)
                scaley = Math.min(scalex,scaley)
            }
            MapBoxRef.value.style.transform = `scale(${scalex},${scaley})`
            store.commit('setScale',[scalex,scaley])
            // 监听窗口变化
            window.addEventListener('resize',function (e){
                clearTimeout(resizeTimer)
                resizeTimer = this.setTimeout(() => {
                    // 手动设置MapContainerRef盒子的宽高
                    MapContainerRef.value.style.width = e.target.innerWidth * 0.625 + 'px'
                    MapContainerRef.value.style.height = e.target.innerHeight * 0.872 + 'px'
                    // 手动设置MapBoxRef盒子的缩放比例，根据父盒子的大小（1200 ，845）
                    // scalex: MapContainerRef盒子实际的宽度 / MapContainerRef原来的盒子宽度
                    // scaley: MapContainerRef盒子的实际高度 / MapContainerRef运来盒子的高度
                    let scalex = (e.target.innerWidth * 0.625) / 1200
                    let scaley = (e.target.innerHeight * 0.872) / 845
                    // 判断两个缩放系数的差值大小，如果两个比例差值的绝对值大于0.2，则将 scalex 和 scaley 值以最小的为准
                    if(Math.abs(scalex - scaley) > 0.2){
                        scalex = Math.min(scalex,scaley)
                        scaley = Math.min(scalex,scaley)
                    }
                    
                    MapBoxRef.value.style.top = 'unset'
                    MapBoxRef.value.style.left = 'unset'
                    MapBoxRef.value.style.transformOrigin = `50% 50%`
                    MapBoxRef.value.style.transform = `scale(${scalex},${scaley})`
                    if(currentElement){
                        scaleSeat(currentElement)
                    }else if(seatData.currentAreaCode){
                        const { scaleX, scaleY } = searchArea(seatData.currentAreaCode)
                        sacleX = scaleX
                        sacleY = scaleY
                    }
                    store.commit('setScale',[scalex,scaley])
                },300)
            })
        })
        watch([() => store.state.seatListOfthree, () => store.state.seatListOfFour,() => store.state.seatListOfShenZhen, () => store.state.areaListOfThree, () => store.state.areaListOfFour, () => store.state.areaListOfShenZhen],() => {
            if(store.state.seatListOfthree.length && store.state.seatListOfFour.length && store.state.seatListOfShenZhen.length && store.state.areaListOfThree.length && store.state.areaListOfFour.length && store.state.areaListOfShenZhen.length){
                // 进入页面自动选中当前用户座位
                let currentUserItem = store.getters.AllSeatList.find(item => store.state.UserInfo.usercode === item.id)
                if(currentUserItem){
                    // 设置楼层
                    let floor = ''
                    if(currentUserItem.floor == '3' && currentUserItem.office == '1'){
                        floor = 'three'
                    }else if(currentUserItem.floor == '4' && currentUserItem.office == '1'){
                        floor = 'four'
                    }else if(currentUserItem.floor == '7' && currentUserItem.office == '2'){
                        floor = 'shenzhen'
                    }
                    store.commit('setCurrentFloor',floor)
                    nextTick(() => {
                        // 如果找到了当前用户座位的 currentUserItem，则调用 handleClickSeat 函数
                        handleClickSeat(currentUserItem,document.getElementById(currentUserItem.seat_id))
                    })
                }else{
                    // 没有找到的话用户座位的 scanCodeFn,则提示用户
                    infoMessage('没有找到您的座位，请与管理员联系')
                }
            }
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
            // store.commit('setMapBoxRef_Transition_Timer','unset')
            MapBoxRef.value.style.transition = 'all 0s'
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
        // 监听鼠标滚轮滚动的事件-谷歌IE浏览器
        function handleScale_chrome_ie(e){
            // 阻止默认行为
            e.preventDefault()
            if (e.wheelDelta > 0) {
                // 执行放大的逻辑
                MapBoxAmplification(0.1)
            } else {
                // 指向缩小的逻辑
                MapBoxReduce(0.1)
            }
        }
        // 监听鼠标滚轮滚动的事件-火狐浏览器
        function handleScale_firefox(e){
            // 阻止默认行为
            e.preventDefault()
            //上下滚轮动作判断
            if (e.detail < 0) {
                // 执行放大的逻辑
                MapBoxAmplification(0.1)
            } else {
                // 指向缩小的逻辑
                MapBoxReduce(0.1)
            }
        }
        // 定义初始的缩放值1
        let sacleX = 1
        let sacleY = 1
        // 监听切换楼层或者切换图例时发布的自定义事件initScale，将此时的缩放系数与缩放时的缩放系数同步
        emitter.on('initScale', (value) => {
            sacleX = store.state.scale[0]
            sacleY = store.state.scale[1]
            // 将座位和区域高亮取消
            if(value) return // 如果value有值，则return出去，不取消高亮状态
            seatData.currentAreaCode = ''
        })
        // 地图放大的
        function MapBoxAmplification (number){
            MapBoxRef.value.style.transition = 'all 0.25s'
            if (sacleX > 7) return
            sacleX += number
            sacleY += number
            MapBoxRef.value.style.transform = `scale(${sacleX},${sacleY})`
        }
        function MapBoxReduce(number){
            MapBoxRef.value.style.transition = 'all 0.25s'
            if(sacleX < 0.4) return
            sacleX -= number
            sacleY -= number
            MapBoxRef.value.style.transform = `scale(${sacleX},${sacleY})`
        }
        // 在组件卸载时移除一些事件的监听
        onBeforeUnmount(() => {
            MapContainerRef.value.removeEventListener('mousedown', mouseDown)
            document.removeEventListener('mouseup', mouseUp)
            MapContainerRef.value.removeEventListener('mousewheel',handleScale_chrome_ie)
            MapContainerRef.value.removeEventListener("DOMMouseScroll",handleScale_firefox)
        })
        return {
            ...toRefs(seatData),
            handleClickSeat,
            MapBoxRef,
            MapContainerRef,
            MapBoxStyle,
            is_show_tooltip,
            tooltipText,
            tooltipRef,
            MapBoxAmplification,
            MapBoxReduce,
            initMap,
            handleClickMeetingRoom,
            partTotaleObject
        }
    }
}
</script>

<style lang="less" scoped>
@import '../../style/StyleOfFloorThree/Area/pc/index.less';
@import '../../style/StyleOfFloorFour/Area/pc/index.less';
@import '../../style/StyleOfFloorShenZhen/Area/pc/index.less';
@import '../../style/StyleOfFloorThree/Part/pc/index.less';
@import '../../style/StyleOfFloorFour/Part/pc/index.less';
.map-container{
    position: relative;
    background-color: #f3f4f6;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    .oamap-north {
        position: absolute;
        z-index: 3;
        top: 20px;
        left: 20px;
        font-size: 25px;
    }
    .scale-btn{
        position: absolute;
        z-index: 3;
        right: 20px;
        top: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: #ffffff;
        padding: 5px;
        i{
            font-size: 25px;
            cursor: pointer;
            &:nth-child(2){
                margin:5px 0;
            }
        }
    }
    .map-box{
        position:absolute;
        width: 930px;
        height: 843px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        // 给盒子设置上一个过渡的默认值
        transition: all 1s;
        .part{
            z-index: 2;
        }
        .seat{
            position: absolute;
            width: 8px;
            height: 8px;
            background-size: contain;
            background-repeat: no-repeat;
            z-index: 5;
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
            z-index: 2;
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
        // 引用PC端3层区域的样式
        .threeAreaStyle-PC;
        // 引用PC端4层区域的样式
        .FourAreaStyle-PC;
        // 引用PC端深圳区域的样式
        .ShenZhenAreaStyle-PC;
        // 引入PC端3层的分区样式
        .threePartStyle-PC;
        // 引入pc端4层的分区样式
        .FourPartStyle-PC;
        // 设置提示框的样式
        .tooltip{
            position: absolute;
            color: #fff;
            background-color: black;
            padding: 3px;
            border-radius: 10px;
            min-width: 100px;
            text-align: center;
            z-index: 5;
            &::after{
                content: '';
                position: absolute;
                bottom: 1px;
                left: 8%;
                border: 10px solid transparent;
                border-top: 0px;
                border-bottom-color:black ;
                transform: rotate(180deg);
                transform-origin: bottom center;
            }
        }
    }
}
</style>