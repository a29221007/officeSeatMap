<template>
    <!-- 搜索和图例区域 -->
    <div class="search-legend">
        <div class="search"></div>
        <div class="legend">
            
        </div>
    </div>
    <!-- 切换楼层 -->
    <div class="floor-switch">
        <div :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key='item.id' v-on:touchstart="handleTouchFloor(item.lable)">{{item.name}}</div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
export default {
    name:'search',
    setup() {
        // 创建 store 实例
        const store = useStore()
        // 楼层或地区的数据
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
        ]
        // 触摸切换楼层（或地区）触发的函数
        function handleTouchFloor(floor) {
            // 设置当前选中的楼层（或地区）
            store.commit('setCurrentFloor',floor)
        }
        return {
            AllArea,
            handleTouchFloor
        }
    }
}
</script>

<style lang="less" scoped>
.search-legend,.floor-switch{
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 10rem;
    background-color: rgba(0, 0, 0, 0.8);

}
.search-legend{
    bottom: 8%;
    height: 15%;
    border-radius: 10px 10px 0 0;
}
.floor-switch{
    bottom: 0;
    height: 8%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    div{
        flex: 1;
        text-align: center;
        color: #ccc;
        font-size: .3871rem;
        line-height: 2.2;
        position: relative;
        &::after{
            content: '';
            display: inline-block;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: .3871rem;
            height: 1px;
            background-color: #fff;
        }
        &.active{
            color: pink;
            &::after{
                background-color: pink;
            }
        }
    }
}
</style>