/**
 * 清除在选中座位或者区域后，详细信息页面可能会有的动画中用到的定时器或者延时器id
 * 
*/
import store from '@/store'
function clearTimer() {
  store.state.timerArray.forEach(item => {
    clearInterval(item.timer)
  })
  clearTimeout(store.state.timer)
  if(store.state.spanElement){
    store.state.spanElement.querySelector('span') && store.state.spanElement.querySelector('span').remove()
  }
}

export default clearTimer