// 初始化移动端地图函数

import { nextTick } from 'vue'
function initMap() {
    nextTick(() => {
        // 获取地图容器的父盒子
        let bodyContainer = document.querySelector('.body-container')
        // 获取地图盒子
        let MapBox = document.querySelector('.map-box')
        const scale = bodyContainer.offsetHeight / parseInt(MapBox.style.height)
        MapBox.style.transition = 'all 0.3s'
        // 切换楼层后将地图的的缩放比例调整1，放到正中心
        MapBox.style.top = 'unset'
        MapBox.style.left = 'unset'
        MapBox.style.transformOrigin = `50% 50%`
        MapBox.style.transform = `scale(${scale},${scale})`
    })
}

export default initMap