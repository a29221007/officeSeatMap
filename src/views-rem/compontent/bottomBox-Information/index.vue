<template>
    <!-- 点击了搜索结果的某一项后，显示对应区域或座位的详细信息 -->
    <div class="Seat-Area-Information">
        <!-- 显示选中座位（或者区域）信息的同时，新增了显示搜索框 -->
        <div class="search-box" v-on:click="handleClickSearchBox"><i class="iconfont oamap-sousuo"></i><span>查找座位、人员、区域信息</span></div>
        <!-- 头部信息区域 -->
        <div class="header">
            <div class='title'>{{title_Code.title}}</div>
            <!-- <div class="buttons">
                <div v-if="$store.state.is_have_editor" v-on:click="handleClickEdit"><i class="iconfont oamap-xiugai"></i> 编辑</div>
            </div> -->
            <div class="code">{{title_Code.code}}</div>
        </div>
        <!-- 内容区域 -->
        <div class="content">
            <component :is="compontentType"></component>
        </div>
    </div>
</template>

<script>
import { computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
// 部门以及其他区域
import DepartmentAndOtherAreas from './compontent/department_and_otherAreas'
// 员工
import Personnel from './compontent/personnel'
// 固资占位
import TakeUp from './compontent/Take-up'
// 会议室
import MeetingRoom from './compontent/meetingRoom'
// 空座
import EmptySeat from './compontent/empty_seat'
import clearTimer from '@/views-rem/hook/clearTimer.js'
export default {
    name:'BottomBoxInformation',
    components:{
        DepartmentAndOtherAreas, Personnel, TakeUp, MeetingRoom, EmptySeat
    },
    emits:['setSearchLegendContant'],
    setup(prop,{ emit }) {
        const store = useStore()
        // 选中项的信息
        const activeInfo = computed(() => {
            return store.state.activeInfo
        })
        // 点击编辑按钮触发的事件
        function handleClickEdit() {
        }
        // 点击搜索框触发的函数
        function handleClickSearchBox(){
            // 点击搜索的盒子，向父组件发布一个事件，并传递参数
            emit('setSearchLegendContant','search')
        }
        // 切换组件变量
        let compontentType = computed(() => {
            let compontentNameValue = ''
            if(store.state.activeInfo.type === '0-2'){
                // 固资占位
                compontentNameValue = 'TakeUp'
            }else if(store.state.activeInfo.type === '0-1'){
                // 空座
                compontentNameValue = 'EmptySeat'
            }else if(store.state.activeInfo.type === '0'){
                // 人员
                compontentNameValue = 'Personnel'
            }else if(store.state.activeInfo.type === 1){
                // 会议室
                compontentNameValue = 'MeetingRoom'
            }else if(store.state.activeInfo.type === 2 || store.state.activeInfo.type === 3 || store.state.activeInfo.diff === 2){
                // 部门和其他区域
                compontentNameValue = 'DepartmentAndOtherAreas'
            }
            return compontentNameValue
        })
        // 动态切换头信息
        const title_Code = computed(() => {
            let obj = {title:'',code:''}
            if(store.state.activeInfo.type === '0' || store.state.activeInfo.type === '0-2' || store.state.activeInfo.type === 1){
                // 人员 || 资产占位 || 会议室
                obj.title = store.state.activeInfo.name
                if(store.state.activeInfo.type === '0'){
                    obj.code = '工号：' + store.state.activeInfo.id
                }else if(store.state.activeInfo.type === '0-2'){
                    obj.code = '编号：' + store.state.activeInfo.id
                }else if(store.state.activeInfo.type === 1){
                    obj.code = '编号：' + store.state.activeInfo.code
                }
            }else if(store.state.activeInfo.type === '0-1'){
                // 空座
                obj.title = '空座'
                obj.code = ''
            }else if(store.state.activeInfo.type === 2 || store.state.activeInfo.type === 3 || store.state.activeInfo.diff === 2){
                // 区域信息
                obj.title = '已选区域'
                obj.code = ''
            }
            return obj
        })
        // 组件卸载阶段
        onBeforeUnmount(() => {
            clearTimer()
        })
        return {
            activeInfo,
            handleClickEdit,
            compontentType,
            title_Code,
            handleClickSearchBox
        }
    }
}
</script>

<style lang="less" scoped>
.Seat-Area-Information{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #f8f9fa;
    .search-box{
        width: 100%;
        height: .8602rem;
        background-color: #262729;
        border-radius: 7px;
        display: flex;
        align-items: center;
        .oamap-sousuo{
            color: #f8f9fa;
            font-size: .4301rem;
            margin: 0 .3226rem 0 .3226rem;
        }
        span{
            color: #b1b2b4;
            font-size: .4301rem;
        }
    }
    .header{
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom:1px solid #30322f;
        padding: .2151rem 0;
        .title{
            font-size: .4301rem;
        }
        .oamap-dongtaijiantoucopy{
            transform:translateY(-0.3575rem) rotate(-90deg);
        }
        .buttons{
            div{
                display: flex;
                align-items: center;
            }
        }
    }
    .content{
        flex: 3;
    }

}
</style>