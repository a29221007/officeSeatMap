<template>
    <!-- 3、点击了搜索结果的某一项后，显示对应区域或座位的详细信息 -->
    <div class="Seat-Area-Information">
        <!-- 头部区域 -->
        <div class="header">
            <div class='title'>{{title}}</div>
            <!-- <i v-on:click="handleClickBackSearch" class="iconfont oamap-dongtaijiantoucopy"></i> -->
            <div class="buttons">
                <div v-on:click="handleClickEdit"><i class="iconfont oamap-xiugai"></i> 编辑</div>
            </div>
        </div>
        <!-- 内容区域 -->
        <div class="content">
            <component :is="compontentType"></component>
        </div>
    </div>
</template>

<script>
import { computed,inject,onBeforeUnmount,onMounted } from 'vue'
import { useStore } from 'vuex'

import Area from './compontent/area'
import Personnel from './compontent/personnel'
import TakeUp from './compontent/Take-up'

// 导入事件中心
import emitter from '@/views/eventbus.js'
export default {
    name:'BottomBoxInformation',
    components:{
        Area, Personnel, TakeUp
    },
    setup(prop,{ emit }) {
        const store = useStore()
        // 选中项的信息
        const activeInfo = computed(() => {
            return store.state.activeInfo
        })
        // 点击编辑按钮触发的事件
        function handleClickEdit() {
            
        }
        // 切换组件变量
        let compontentType = computed(() => {
            let compontentNameValue = ''
            if(store.state.activeInfo.type === '0-2'){
                // 固资占位
                compontentNameValue = 'TakeUp'
            }else if(store.state.activeInfo.type === '0' || store.state.activeInfo.type === '0-1'){
                // 人员 || 空座
                compontentNameValue = 'Personnel'
            }else if(store.state.activeInfo.type === 1 || store.state.activeInfo.type === 2 || store.state.activeInfo.type === 3){
                // 区域信息
                compontentNameValue = 'Area'
            }
            return compontentNameValue
        })
        // 动态切换头信息
        const title = computed(() => {
            let title = ''
            if(store.state.activeInfo.type === '0' || store.state.activeInfo.type === '0-1' || store.state.activeInfo.type === '0-2'){
                // 固资占位
                title = '已选工位'
            }else if(store.state.activeInfo.type === 1 || store.state.activeInfo.type === 2 || store.state.activeInfo.type === 3){
                // 区域信息
                title = '已选区域'
            }
            return title
        })
        // 点击上箭头，返回到搜索页
        function handleClickBackSearch(){
            // 点击搜索的盒子，向父组件发布一个事件，并传递参数
            emit('setSearchLegendContant','search')
        }
        let cleartime = inject('clear')
        // 组件卸载阶段
        onBeforeUnmount(() => {
            cleartime()
            emitter.emit('clearAreaTimer')
        })
        return {
            activeInfo,
            handleClickEdit,
            compontentType,
            title,
            handleClickBackSearch
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
    .header{
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom:1px solid #30322f;
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