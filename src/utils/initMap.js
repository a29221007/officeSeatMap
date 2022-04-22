// 将地图切换至中心，不放大

// 导入事件中心
import emitter from '@/views/eventbus.js'
// 导入vuex
import store from '../store'
// value 参数用来区分是恢复页面的逻辑，还是切换楼层、图例的逻辑
function initMap(value) {
    // 获取地图盒子
    let MapBox = document.querySelector('.map-box')
    MapBox.style.transition = 'all 0.3s'
    // 切换楼层后将地图的的缩放比例调整1，放到正中心
    MapBox.style.top = 'unset'
    MapBox.style.left = 'unset'
    MapBox.style.transformOrigin = `50% 50%`
    MapBox.style.transform = `scale(${store.state.scale[0]},${store.state.scale[1]})`
    emitter.emit('initScale',value)
    // emitter.emit('activeArea',{
    //     code:'',
    // })
}
export default initMap