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
                <template v-if="item.type === 1 || item.type === 2 || item.type === 3">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 区域 -->
                        <div :id="item.code + item.id" :class="[item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="oneAreaStyle(item)" v-on:click="handleClickMeetingRoom(item)">
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
                            <div :id="item.code + index" :class="[item.code,{'active-area':currentAreaCode.includes(item.code)}]" :style="multipleAreaStyle(item,item2,index)" v-on:click="handleClickMeetingRoom(item)">
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
                    <div class="seat" :id="item.seat_id" v-on:click="handleClickSeat(item,$event)" :style="seatItemStyle(item)" v-on:mouseenter="seatMouseenter(item,$event)" v-on:mouseleave="seatMouseleave">
                    </div>
                </template>
            </template>
            <!-- 鼠标经过每一个座位的提示框 -->
            <div ref="tooltipRef" class="tooltip" v-show="is_show_tooltip" v-text="tooltipText"></div>
        </div>
    </div>
</template>

<script>
import {ref,computed,onMounted,onBeforeUnmount, reactive, toRefs, inject} from 'vue'
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
        // 鼠标点击每一个座位的事件处理函数
        function handleClickSeat(seatItem,$event){
            // 触发座位的点击事件，将区域的选中状态置空
            seatData.currentAreaCode = ''
            // 点击某一个座位将当前座位的seat_id赋值给current，将当前选中的座位高亮，再点击同一个座位取消高亮
            if(seatItem.seat_id === currentSeat_id){
                // 如果相同，则清除当前元素的定时器
                clearCurrentElementInterval()
                // 向兄弟组件header发布一个自定义事件form，参数为空字符串
                return emitter.emit('form','')
            }else{
                beforeSeatAnimateElement && clearInterval(beforeSeatAnimateElement.timer)
                beforeSeatAnimateElement && (beforeSeatAnimateElement.style.transform = `scale(1)`)
                beforeSeatAnimateElement = $event.target
                currentSeat_id = seatItem.seat_id
                emitter.emit('form',seatItem)
            }
            scaleSeat($event.target)
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
            handleClickMeetingRoom
        }
    }
}
</script>

<style lang="less" scoped>
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
        // 法务部旁边的采购库房
        #QY010103004865{
            .title{
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 平台技术部（it支持部）
        #QY010103005268{
            .title{
                top: unset;
                bottom: -33px;
                left: 34px;
            }
        }
        // 法务部&公共关系与政府事务部
        #QY010103005066{
            .title{
                top: unset;
                bottom: -9px;
                left: 45px;
                .name{
                    transform: scale(0.5,0.9);
                }
            }
        }
        // 热江3D&余烬风暴美术
        #QY010103003838{
            .title{
                top: 18px;
            }
        }
        // 用户体验部（音频音效）
        #QY010103004762{
            .title{
                top: -2px;
            }
        }
        // 热江3D&我叫MT-1
        #QY010103006037{
            .title{
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                right:7px;
                left: unset;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 热江3D&我叫MT-2（该区域的标题暂时删除）
        // 热江3D&我叫MT-3
        #QY01010300600{
            .title{
                top: unset;
                bottom: -12px;
            }
        }
        // 热江项目组-1、余烬风暴项目组、平台技术部(it信息部)、平台技术部(QA部)
        #QY010103002639,#QY010103004040,#QY010103003131,#QY010103003030{
            .title{
                display: flex;
                align-items: center;
                left: -7px;
                span{
                    width: 2px;
                    white-space:unset;
                }
                .name{
                    margin-right: 8px;
                }
            }
        }
        // 热江项目组-1
        #QY010103002639{
            .title{
                .name{
                    transform: scale(0.85,0.7);
                }
            }
        }
        // 热江项目组-2
        #QY01010300260{
            .title{
                left: unset;
                right: 25px;
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
        // 平台技术部(it信息部)、平台技术部(QA部)
        #QY010103003131,#QY010103003030{
            .title{
                left: 2px;
            }
        }
        // 财务部、人力资源部
        #QY010103003232,#QY010103003435{
            .title{
                top: unset;
                bottom: -5px;
            }
        }
        // 人力资源部、薪酬福利咨询处
        #QY010103003434,#QY010103003333{
            .title{
                top: unset;
                bottom: -9px;
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
                top: -7px;
                left: -8px;
                transform: unset;
            }
        }
        // 用户体验部（本地化）
        #QY010103002424{
            .title{
                top: unset;
                bottom: -28px;
                .subtitle{
                    transform: translateY(-8px) scale(0.65, 0.65);
                }
            }
        }
        // 证券部
        #QY010103002020{
            .title{
                top: -10px;
                .name{
                    transform: scale(0.6,0.9);
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
                top: 5px;
            }
        }
        // 总裁办(小)
        #QY0101030019179{
            .title{
                .name{
                    transform: scale(0.6,0.9);
                }
            }
        }
        // 新SLG、市场部-3、运营部
         #QY010103002252,#QY0101030064180,#QY010103005376{
            .title{
                top: unset;
                bottom: -8px;
            }
        }
        // 用户体验部（用研）、视觉创意部（视频组）
        #QY0101030066181,#QY010103001717{
            .title{
                top: unset;
                bottom: -32px;
                .name{
                    transform: scale(0.6,0.9);
                }
                .subtitle{
                    transform: translateY(-5px) scale(0.5, 0.5);
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
                    transform: scale(0.6,0.9);
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
                right: 4px;
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
                bottom: -7px;
                left: 55%;
            }
        }
        // 无神之界-2
        #QY01010300440{
            .title{
                left: unset;
                top: 40%;
                right: -21px;
                span{
                    width: 2px;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 行政部
        #QY0101030068183{
            .title{
                top: unset;
                bottom: -55px;
                left: 24%;
                span{
                    width: 2px;
                    white-space:unset;
                    transform: scale(0.85, 0.5);
                }
            }
        }
        // 用户体验设计部
        #QY010103004560{
            .title{
                left: -2px;
                span{
                    width: 2px;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 电梯样式-1
        #QY010103005580{
            .title{
                left: unset;
                right: -44px;
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
                    transform: scale(0.45,0.9);
                }
            }
        }
        // ROOBO会议室
        #QY010104000787{
            .title{
                .name{
                    transform: scale(0.45,0.9);
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
            }
        }
        // 商务部、盾勇项目组、优格资本（部门）
        #QY0101040032118,#QY0101040031117,#QY0101040042131{
            .title{
                left: 20%;
                span{
                    width: 2px;
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
                bottom: -3px;
            }
        }
        // 行政部、一点咨询
        #QY0101040039125,#QY0101040070189{
            .title{
                top: unset;
                bottom: -9px;
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
                bottom: -5px;
            }
        }
        // 创新中心（Heyyo工作室）
        #QY0101040035121{
            .title{
                top: unset;
                bottom: -18px;
                .name{
                    transform:translate(0px,5px) scale(0.85, 0.9)
                }
            }
        }
        // 运营部（盾勇&苍骑）
        #QY0101040034120{
            .title{
                top: unset;
                bottom: -21px;
                .name{
                    transform:translate(0px,5px) scale(0.85, 0.9)
                }
            }
        }
        // 渠道部
        #QY0101040033119{
            .title{
                top: 10px;
                left: 65%;
            }
        }
        // 发行技术部（产品部）
        #QY0101040043132{
            .title{
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                right: 9px;
                left: unset;
                span{
                    width: 2px;
                    white-space:unset;
                }
                .name{
                    margin-left: 8px;
                    transform: scale(0.85, 0.6);
                }
                .subtitle{
                    transform: scale(0.65,0.45);
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
                transform:scale(0.65, 0.9)
            }
        }
        // 监控室
        #QY0101040048144{
            .name{
                transform:scale(0.5, 0.9)
            }
        }
        // ROOBO库房
        #QY0101040047143{
            .name{
                transform:scale(0.35, 0.9)
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
                left: 18px;
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
                right: 9px;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 男浴室、女浴室
        #QY01010400621,#QY01010400631{
            .title{
                left: 42%;
                span{
                    width: 2px;
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
        // 前台
        #QY0101040065165{
            .title{
                top: 60%;
                left: unset;
                right: -30px;
            }
        }
        // 鬼武
        #QY01010400450{
            .title{
                top: 30%;
                left: 10%;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 聚礼1/4半圆
        #QY01010400220{
            border-radius: 5px 0 0 0;
        }
        // 聚英1/4半圆
        #QY01010400230{
            border-radius:0 5px 0 0;
        }
        // 微传播（会议室）1/4半圆
        #QY01010400030{
            border-radius:14px 0 0 0;
        }
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
        // 深圳地区，区域样式
        // CBR 1
        #QY02020700241{
            .title{
                top: unset;
                left: unset;
                bottom: 27px;
                right: -42px;
            }
        }
        // CBR 2
        #QY02020700243{
            .title{
                top: 60%;
                left: unset;
                right: -42px;
            }
        }
        // CBR 3
        #QY02020700246{
            .title{
                top: -12%;
                left: 26%;
            }
        }
        // CBR 4
        #QY02020700247{
            .title{
                top: unset;
                left: 76%;
                bottom: -20%;
            }
        }
        // CBR 5
        #QY02020700248{
            .title{
                top: unset;
                left: 103%;
                bottom: -14%;
            }
        }
        // CBR 6
        #QY020207002413{
            .title{
                top: unset;
                left: 33%;
                bottom: -16%;
            }
        }
        // CBR 7
        #QY020207002415{
            .title{
                top: unset;
                left: 68%;
                bottom: -15%;
            }
        }
        // CBR 8
        #QY020207002419{
            .title{
                top: -8%;
                left: 11%;
            }
        }
        // 用户体验部
        #QY0202070029219{
            .title{
                top: -10%;
            }
        }
        // S&G
        #QY02020700300{
            .title{
                top: unset;
                bottom: -13%;
                left: 80%;
            }
        }
        // 其他 1
        #QY02020700311{
            .title{
                left: 0;
                top: unset;
                bottom: -19px;
                transform: unset;
            }
        }
        // 其他 2
        #QY02020700312{
            .title{
                left: -24px;
                transform: translate(0, -50%);
            }
        }
        // 其他 3
        #QY02020700310{
            .title{
                top: -20%;
            }
        }
        // 职能部门
        #QY0202070028218{
            .title{
                top: -14%;
                left: -3px;
                transform: unset;
            }
        }
        // 渠道 1
        #QY02020700272{
            .title{
                left: -24px;
                transform: translate(0, -50%);
            }
        }
        // 渠道 2
        #QY02020700271{
            .title{
                top: -17px;
                left: 12px;
                transform: unset;
            }
        }
        // 视频
        #QY02020700260{
            .title{
                top: -17px;
                left: 16px;
                transform: unset;
            }
        }
        // 投放
        #QY02020700251{
            .title{
                top: -17px;
                left: 11px;
                transform: unset;
            }
        }
        // 零食柜
        #QY0202070009199{
            .title{
                top: unset;
                bottom: -17px;
                transform: translate( -50%, 0);
            }
        }
        // 1# 货梯
        #QY0202070018208{
            .title{
                top: 4px;
                left: -45px;
                transform: unset;
            }
        }
        // 2# 货梯
        #QY0202070019209{
            .title{
                top: 59px;
                left: -45px;
                transform: unset;
            }
        }
        // 大门 1
        #QY02020700160{
            .title{
                top: -23px;
                transform: translate( -50%, 0);
            }
        }
        // 大门 2
        #QY02020700161{
            .title{
                top: unset;
                bottom: -23px;
                transform: translate( -50%, 0);
            }
        }
        // 洗手台
        #QY0202070023213{
            .title{
                left: 82%;
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
                top: -14px;
                left: 42px;
                transform: unset;
            }
        }
    }
}
</style>