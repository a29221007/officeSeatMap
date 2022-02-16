<template>
    <!-- 头部区域包括顶部的搜索栏以及图例区域 -->
    <div ref="headerContainerRef" class="header-container">
        <!-- 搜索栏 -->
        <div class="search">
            <div class="floor-switch">
                <span :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key="item.id" v-on:click="handleClickFloor(item.lable)">{{item.name}}<i v-if="item.id !== AllArea.length - 1"> | </i></span>
            </div>
            <el-autocomplete v-model="searchState" value-key='name' popper-class='autocomplete' :trigger-on-focus="false" :fetch-suggestions="querySearch" class="inline-input" clearable placeholder="请输入员工姓名或座位号" @select="handleSelect" v-on:clear="handleClearInput">
                <!-- 自定义搜索建议列表模板(当有搜索建议时) -->
                <template #default="{ item }" v-if="is_none_sugges">
                    <div class="autoCompleteTemplate">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">名称：</span><span class="content">{{item.name || '暂无数据'}}</span></span>
                            <span><span class="title">座位号：</span><span class="content">{{item.seat_id}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine"><span class="title">部门：</span><span class="content">{{item.depart || '暂无数据'}}</span></div>
                    </div>
                </template>
                <!-- 自定义搜索建议列表模板（当无搜索建议时） -->
                <template #default="{ item }" v-else>
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
    <!-- 抽屉式弹框 -->
    <el-drawer custom-class='drawer' modal-class='drawer-mask' v-model="is_show" :with-header="false" direction='ltr' :modal='false' size='15%'>
        <el-form label-width="auto">
            <el-form-item label="姓名：">{{currentSeatInfo.name || '暂无数据'}}</el-form-item>
            <el-form-item label="座位号：">{{currentSeatInfo.seat_id}}</el-form-item>
            <el-form-item label="部门：">{{currentSeatInfo.depart || '暂无数据'}}</el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
import {ref, reactive, toRefs, nextTick, onMounted, inject} from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
// 导入消息提示框组件
import { successMessage, infoMessage } from '@/utils/message.js'
// 导入事件中心
import emitter from '../eventbus'
// 导入初始化地图的方法
import initMap from '@/utils/initMap.js'
export default {
    name:'layout',
    setup(){
        // 获取浏览器可视区宽高的依赖注入
        const obj = inject('clent')
        const headerContainerRef = ref(null)
        // 组件挂载时
        onMounted(() => {
            /**
             * 0.625和0.124是开发时，当前盒子的宽度和高度除以当前可视区宽度和高度，计算出来的比值
             * 这样就实现了，简单的屏幕自适应，用户当前浏览器可视区的宽高乘以这个比例，就是合适的宽高
            */
            headerContainerRef.value.style.width = obj.width * 0.625 + 'px'
            headerContainerRef.value.style.height = obj.height * 0.124 + 'px'
        })
        // 监听兄弟组件Main发布的自定义事件from，将弹框显示
        emitter.on('form', data => {
            if(data){
                const { depart, name, seat_id } = data
                drawerData.currentSeatInfo.depart = depart
                drawerData.currentSeatInfo.seat_id = seat_id
                drawerData.currentSeatInfo.name = name
                drawerData.is_show = true
            }else{
                drawerData.currentSeatInfo.depart = ''
                drawerData.currentSeatInfo.seat_id = ''
                drawerData.currentSeatInfo.name = ''
                drawerData.is_show = false
            }
        })
        const store = useStore()
        // 切换地图区域的数据（目前只有北京地区的3楼4楼，以后说不定还有其他地区）
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
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
                const results = store.getters.AllSeatList.filter(item => {
                    return (item.name && item.name.includes(queryString)) || (item.seat_id && item.seat_id.includes(queryString.toUpperCase()))
                })
                if(results.length !== 0){
                    callback(results)
                }else{
                    callback([{name:''}])
                    searchData.is_none_sugges = false
                }
            },
            // 点击搜索建议下拉框某一项的处理程序
            handleSelect(item) {
                if(!searchData.is_none_sugges) return
                const { depart, name, seat_id } = item
                // 选中某一项，首先判断该员工的座位，是否在当前楼层
                if(item.floor == store.getters.floor){
                    // 如果相同
                    // 1、获取座位id号对应的元素DOM
                    let el = document.getElementById(item.seat_id)
                    el.click()
                    drawerData.is_show = true
                    drawerData.currentSeatInfo.depart = depart
                    drawerData.currentSeatInfo.seat_id = seat_id
                    drawerData.currentSeatInfo.name = name
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
                        // 将要切换的楼层
                        let pushFloor = store.getters.floor === 3 ? 'four' : 'three'
                        handleClickFloor(pushFloor)
                        drawerData.is_show = true
                        drawerData.currentSeatInfo.depart = depart
                        drawerData.currentSeatInfo.seat_id = seat_id
                        drawerData.currentSeatInfo.name = name
                        nextTick(() => {
                            let el = document.getElementById(item.seat_id)
                            el.click()
                            successMessage('切换成功')
                        })
                    }).catch(() => {
                        infoMessage(`您可以手动切换到${item.floor}楼查找`)
                    })
                }
            },
            // 点击搜索框中清除图标的处理程序
            handleClearInput() {
                // 点击清除按钮以后,input框需要重新获取一下焦点，要不然，搜索建议框就不显示了，这个可能是组件的一个bug吧
                let input = document.querySelector('.inline-input .el-input__inner')
                input.blur()
                input.focus()
            }
        })
        // 定义图例的数据和方法
        const legendData = reactive({
            legendList:[
                {id:0,name:'员工',lable:'employees',type:'0',url:'/legend-image/image0.png'},
                {id:1,name:'空闲',lable:'free',type:'0-1',url:'/legend-image/image1.png'},
                {id:2,name:'占用',lable:'occupation',type:'0-2',url:'/legend-image/image2.png'},
                {id:3,name:'维修',lable:'maintenance',type:'0-3',url:'/legend-image/image3.png'},
                {id:4,name:'休闲区',lable:'Recreational-area',type:'0-4',url:'/legend-image/image4.png'},
            ],
            // 点击某一个图例触发的函数
            handleClickLegend(type) {
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
            currentSeatInfo:{
                name:'',
                seat_id:'',
                depart:''
            }
        })
        return {
            AllArea,
            ...toRefs(searchData),
            ...toRefs(legendData),
            ...toRefs(drawerData),
            handleClickFloor,
            headerContainerRef
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
            span{
                cursor: pointer;
                &.active{
                    color: chocolate;
                    i{
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
            }
        }
        .legendItemActive{
            transform: scale(1.2);
        }
    }
}
</style>