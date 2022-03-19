<template>
    <div ref="MapContainerRef" class="map-container">
        <!-- 指针 -->
        <i class="iconfont oamap-north"></i>
        <!-- 放大缩小按钮 -->
        <div class="scale-btn">
            <i v-on:click="MapBoxAmplification(0.7)" class="iconfont oamap-jiahao"></i>
            <i v-on:click="MapBoxReduce(0.7)" class="iconfont oamap-jianhao"></i>
        </div>
        <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">
            <template v-for="item in mapList" :key="item.id">
                <template v-if="item.type === 1 || item.type === 2 || item.type === 3">
                    <template v-if="Object.prototype.toString.call(item.coordinate) === '[object Object]'">
                        <!-- 区域 -->
                        <div :id="item.code + item.id" :class="[item.code,{'active-area':currentAreaCode === item.code}]" :style="{
                            position: 'absolute',
                            top:item.coordinate.top / 1612 * 843 + 'px',
                            left:item.coordinate.left / 1777 * 930 + 'px',
                            width:item.coordinate.width / 1777 * 930 + 'px',
                            height: item.coordinate.height / 1612 * 843 + 'px',
                            backgroundColor: item.backgroundcolor,
                            color:'#646464',
                            fontSize:'12px'
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
                            <div :id="item.code + index" :class="[item.code,{'active-area':currentAreaCode === item.code}]" :style="{
                                position: 'absolute',
                                top:item2.top / 1612 * 843 + 'px',
                                left:item2.left / 1777 * 930 + 'px',
                                width:item2.width / 1777 * 930 + 'px',
                                height: item2.height / 1612 * 843 + 'px',
                                backgroundColor: item.backgroundcolor,
                                color:'#646464',
                                fontSize:'12px'
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
                    <div class="seat" :id="item.seat_id" :class="{'active':current === item.seat_id}" v-on:click="handleClickSeat(item,$event)" :style="seatItemStyle(item)" v-on:mouseenter="seatMouseenter(item,$event)" v-on:mouseleave="seatMouseleave">
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
export default {
    name:'Main',
    setup(){
        emitter.on('activeArea',({code, scaleX, scaleY}) => {
            // 触发了区域高亮事件时，将座位的动画停止
            seatData.current = 0
            seatData.currentAreaCode = code
            sacleX = scaleX || store.state.scale[0]
            sacleY = scaleY || store.state.scale[1]
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
        // 当前地图的信息（包括人员、座位、区域、会议室等）
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
                    top:seatItem.gRow * 9.64 + 23 +'px',
                    left:seatItem.gCol * 9.6 + 35 +'px',
                    backgroundImage: `url(/legend-image/image${seatItem.type === '0' ? '0' : seatItem.type === '0-1' ? '1' : '2'}.png)`
                }
            },
            // 鼠标进入每一个座位的处理程序
            seatMouseenter(seatItem,$event) {
                tooltipRef.value.style.top = $event.target.offsetTop - 38 + 'px'
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
            // 设置过度属性，以及过渡时间
            MapBoxRef.value.style.transition = 'all 1s'
            // 点击某一个座位将当前座位的seat_id赋值给current，将当前选中的座位高亮，再点击同一个座位取消高亮
            if(seatItem.seat_id === seatData.current){
                seatData.current = 0
                // 向兄弟组件header发布一个自定义事件form，参数为空字符串
                return emitter.emit('form','')
            }else{
                seatData.current = seatItem.seat_id
                emitter.emit('form',seatItem)
            }
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
            sacleX = 3
            sacleY = 3
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
            MapBoxRef.value.addEventListener('mousedown', mouseDown)
            // 监听鼠标的弹起事件，移除对鼠标移动事件的监听
            document.addEventListener('mouseup', mouseUp)
            // chrome and ie
            MapBoxRef.value.addEventListener('mousewheel',handleScale)
            // firefox
            MapBoxRef.value.addEventListener("DOMMouseScroll",handleScale)
            // 手动设置MapBoxRef盒子的缩放比例，根据父盒子的大小（1200 ，845）
            // scalex: MapContainerRef盒子实际的宽度 / MapContainerRef原来的盒子宽度
            // scaley: MapContainerRef盒子的实际高度 / MapContainerRef运来盒子的高度
            let scalex = (obj.width * 0.625) / 1200
            let scaley = (obj.height * 0.872) / 845
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
        // 监听鼠标滚轮滚动的事件
        function handleScale(e){
            // 阻止默认行为
            e.preventDefault()
            // 鼠标滚轮的参数
            let value = e.wheelDelta ? e.wheelDelta : e.detail
            if(value === 120 || value === -3){
                // 执行放大的逻辑
                MapBoxAmplification(0.3)
            }else{
                // 指向缩小的逻辑
                MapBoxReduce(0.25)
            }
        }
        // 定义初始的缩放值1
        let sacleX = 1
        let sacleY = 1
        // 监听切换楼层或者切换图例时发布的自定义事件initScale，将此时的缩放系数与缩放时的缩放系数同步
        emitter.on('initScale', () => {
            sacleX = store.state.scale[0]
            sacleY = store.state.scale[1]
            seatData.current = 0
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
            MapBoxStyle,
            is_show_tooltip,
            tooltipText,
            tooltipRef,
            MapBoxAmplification,
            MapBoxReduce
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
        background-color: #ffffff;
        padding: 10px;
        i{
            font-size: 25px;
            cursor: pointer;
            &:first-child{
                margin-bottom: 10px;
            }
        }
    }
    .map-box{
        position:absolute;
        width: 930px;
        height: 843px;
        background-size: cover;
        background-repeat: no-repeat;
        // 给盒子设置上一个过渡的默认值
        transition: all 1s;
        .seat{
            position: absolute;
            width: 8px;
            height: 8px;
            background-size: cover;
            background-repeat: no-repeat;
            z-index: 5;
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
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 消防前室
        #QY010103005268{
            .title{
                top: unset;
                bottom: -9px;
            }
        }
        // 法务部&公共关系与政府事务部
        #QY010103005066{
            .title{
                top: unset;
                bottom: -9px;
                left: 72px;
            }
        }
        // it支持部、冰柠工作室
        #QY010103004762,#QY010103003838{
            .title{
                top: 7px;
            }
        }
        // 冰柠（AX项目组）
        #QY010103003737{
            .title{
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                right: -11px;
                left: unset;
                span{
                    width: 2px;
                    white-space:unset;
                }
                .name{
                    margin-left: 8px;
                }
            }
        }
        // 冰柠工作室（EOS项目组）、（余烬风暴项目组）、平台技术部
        #QY010103003939,#QY010103004040,#QY010103003131{
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
        // QA部
        #QY010103003030{
            .title{
                left: 4px;
                top: 43%;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 平台技术部，it信息部
        #QY010103003131{
            .title{
                left: 2px;
            }
        }
        // 财务部
        #QY010103003232{
            .title{
                top: 4px;
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
                bottom: -9px;
            }
        }
        // 引擎平台部
        #QY01010300220{
            .title{
                left: 79%;
                top: unset;
                bottom: -12px;
            }
        }
        // 采购部&商务支持部
        #QY010103002141{
            .title{
                left: 0;
                top: -36px;
                transform: unset;
                span{
                    width: 2px;
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
                bottom: -8px;
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
                    width: 2px;
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
                right: -15px;
                span{
                    width: 2px;
                    white-space:unset;
                    transform: scale(0.85, 0.7);
                }
            }
        }
        // 陨星工作室-1
        #QY010103004558{
            .title{
                top: unset;
                bottom: -6px;
            }
        }
        // 陨星工作室-2
        #QY010103004559{
            .title{
                left: unset;
                top: 51%;
                right: 2px;
                span{
                    width: 2px;
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
                right: 8px;
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
        // 用户体验部
        #QY01010300251{
            .title{
                top: 75%;
                left: 37%;
                span{
                    width: 2px;
                    white-space:unset;
                }
            }
        }
        // 行政部
        #QY01010300260{
            .title{
                left: unset;
                right: 20px;
                span{
                    width: 2px;
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
                    width: 2px;
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
                bottom: -2px;
            }
        }
        // 北斗工作室、发行技术部
        #QY0101040039125,#QY0101040040126{
            .title{
                top: unset;
                bottom: -9px;
            }
        }
        // 龙图游戏（客服部）
        #QY0101040038124{
            .title{
                top: unset;
                bottom: -20px;
                .name{
                    transform:translate(0px,5px) scale(0.85, 0.9)
                }
            }
        }
        // 商务部
        #QY0101040036122{
            .title{
                top: unset;
                bottom: -5px;
            }
        }
        // 创新中心（动画组）
        #QY0101040035121{
            .title{
                top: unset;
                bottom: -18px;
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
    }
    // 定义动画
    @keyframes scaleAnimation {
        to {
            transform:scale(3);
        }
    }
}
</style>