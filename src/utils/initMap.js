// 将地图切换至中心，不放大
function initMap() {
    // 获取地图盒子
    let MapBox = document.querySelector('.map-box')
    MapBox.style.transition = 'all 0.3s'
    // 切换楼层后将地图的的缩放比例调整1，放到挣中心
    MapBox.style.top = 'unset'
    MapBox.style.left = 'unset'
    MapBox.style.transformOrigin = `50% 50%`
    MapBox.style.transform = `scale(1)`
}
export default initMap