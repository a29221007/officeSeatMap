<template>
    <!-- 指针 -->
    <i class="iconfont oamap-north"></i>
    <!-- 地图 -->
    <div ref="MapBoxRef" class="map-box" :style="MapBoxStyle">

    </div>
</template>

<script>
import {ref,computed} from 'vue'
import { useStore } from 'vuex'
export default {
    name:'M-Main',
    setup(){
        const store = useStore()
        // MapBoxRef盒子的行内样式设置为计算属性
        const MapBoxStyle = computed(() => {
            // MapBoxRef盒子的行内样式暂时只有背景图片
            return {
                backgroundImage: `url(/floor_image/1777_1612_${store.getters.floor}层.png)`,
            }
        })

        return {
            MapBoxStyle
        }
    }
}
</script>

<style lang="less" scoped>
.oamap-north {
    position: absolute;
    z-index: 3;
    top: 1.9333rem;
    left: .2667rem;
    font-size: .3333rem;
}
.map-box{
    position:absolute;
    width: 12.4rem;
    height: 11.24rem;
    background-size: cover;
    background-repeat: no-repeat;
    // 给盒子设置上一个过渡的默认值
    transition: all 1s;
}
</style>