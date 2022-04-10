import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './style/index.less'
import './style/iconfont.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './utils/flexible.js'
import { Search, List, PullRefresh, Cell } from 'vant'
createApp(App).use(router).use(store).use(ElementPlus,{ locale: zhCn }).use(Search).use(List).use(PullRefresh).use(Cell).mount('#app')
