import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './style/index.less'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入字体图标
import './style/iconfont.css'
createApp(App).use(router).use(store).use(ElementPlus).mount('#app')
