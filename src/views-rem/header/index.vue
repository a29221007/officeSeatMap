<template>
    <!-- 头部区域包括顶部的搜索栏以及图例区域 -->
    <div class="header-container">
        <!-- 搜索栏 -->
        <div class="search">
            <div class="floor-switch">
                <span :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key="item.id" v-on:click="handleClickFloor(item.lable)">{{item.name}}<i v-if="item.id !== AllArea.length - 1"> | </i></span>
            </div>
            <!-- 搜索框 -->
            <div class="search-button" v-on:touchstart="handleClickSearch">
                <i class="iconfont oamap-sousuo"></i>
                <span>搜索</span>
            </div>
        </div>
        <!-- 图例 -->
        <div class="legend">
            <div class="legend-item" :class="{'legendItemActive':item.type === $store.state.currentLegend}" v-for="item in legendList" :key="item.id" v-on:click="handleClickLegend(item.type)">
                <img :src="item.url"><span>{{item.name}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import {ref, reactive, toRefs, nextTick, onMounted} from 'vue'
import { useStore } from 'vuex'
export default {
    name:'M-Header',
    setup(){
        const store = useStore()
        // 切换地图区域的数据（目前只有北京地区的3楼4楼，以后说不定还有其他地区）
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
        ]
        // 点击搜索框跳转到搜索页面
        function handleClickSearch() {
        }
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
                store.commit('setCurrentLegend',type)
            }
        })
        return {
            AllArea,
            ...toRefs(legendData),
            handleClickSearch
        }
    }
}
</script>

<style lang="less" scoped>
.header-container{
    width: 100%;
    height: 1.6rem;
    font-size: 16px;
    .search{
        width: 100%;
        height: .5333rem;
        display: flex;
        padding: 0 5px;
        margin: 5px 0;
        align-items: center;
        justify-content: space-between;
        .search-button{
            width: 3.3333rem;
            height: 100%;
            border: 1px solid #ccc;
            border-radius: .2667rem;
            display: flex;
            align-items: center;
            i,span{
                color: #ccc;
                font-size: .2133rem;
            }
            i{
                padding: 0 9px;
            }
        }
    }
    .legend{
        width: 100%;
        height: 1.0667rem;
        background-color: #f3f4f6;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .legend-item{
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            img{
                width: .4267rem;
                height: .4267rem;
            }
        }
    }
}
</style>
