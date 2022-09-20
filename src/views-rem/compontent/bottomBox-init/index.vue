<template>
    <!-- 1、页面加载，显示搜索框和图例 -->
    <div class="init">
        <!-- 搜索框 -->
        <div class="search-box" v-on:click="handleClickSearchBox"><i class="iconfont oamap-sousuo"></i><span>查找座位、人员、区域信息</span></div>
        <!-- 图例 -->
        <div class="legend">
            <div class="legend-item" :class="{'legendItemActive':item.type === $store.state.currentLegend}" v-for="item in legendList" :key="item.id" v-on:click="handleClickLegend(item.type)">
                <div class="legend-image">
                    <img :src="item.url">
                </div>
                <span>{{item.name}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { useStore } from 'vuex'
import initMap from '../../hook/InitMap'
export default {
    name:'BottomBoxInit',
    emits:['setSearchLegendContant'],
    setup(prop,{ emit }) {
        const store = useStore()
        // 点击搜索盒子触发的函数
        function handleClickSearchBox(){
            // 点击搜索的盒子，向父组件发布一个事件，并传递参数
            emit('setSearchLegendContant','search')
        }
        let switchLenged = inject('switchLenged')
        // 图例相关的数据和逻辑
        let legendData = reactive({
            // 图例的数据集合
            legendList:[
                {id:0,name:'员工',lable:'employees',type:'0',url:'/legend-image/yizi0.png'},
                {id:1,name:'空闲',lable:'free',type:'0-1',url:'/legend-image/yizi0-1.png'},
                {id:2,name:'占用',lable:'occupation',type:'0-2',url:'/legend-image/yizi0-2.png'},
                {id:3,name:'会议室',lable:'meeting-room',type:1,url:'/legend-image/icon_meeting.png'},
            ],
            // 点击某一个图例触发的函数
            handleClickLegend(type){
                store.commit('setCurrentLegend',type)
                // 切换图例，重置座位高亮和区域高亮，以及终止地图位置，缩放
                switchLenged()
                initMap()
            }
        })

        return {
            handleClickSearchBox,
            ...toRefs(legendData)
        }
    }
}
</script>

<style lang="less" scoped>
.init{
    width: 100%;
    height: 100%;
    .search-box{
        width: 100%;
        height: .8602rem;
        background-color: #262729;
        border-radius: 7px;
        display: flex;
        align-items: center;
        margin-bottom: .2688rem;
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

    .legend{
        display: flex;
        justify-content: space-between;
        .legend-item{
            width: 25%;
            height: 1.0753rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            &:nth-child(-n + 3){
                img{
                    transform: rotateZ(90deg);
                }
            }
            .legend-image{
                width: .4301rem;
                height: .4301rem;
                border-radius: 50%;
                img{
                    width: 100%;
                }
            }
            span{
                color: #fff;
                font-size: .2151rem;
            }
            &.legendItemActive{
                transform: scale(1.4);
            }
            &:last-child{
                .legend-image{
                    padding-top: .0215rem;
                }
            }
        }
    }
}
</style>