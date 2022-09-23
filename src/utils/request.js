// 封装axios
import axios from 'axios'
import URL from '@/utils/baseUrl.js'
// 创建axios的实例对象
const instance = axios.create({
    baseURL: URL.baseUrl,
    timeout: 5000 
})

// instance 请求拦截
instance.interceptors.request.use((config) => {
    return config
}, (error) => {
    return Promise.reject(error)
})

// instance 响应拦截
instance.interceptors.response.use((config) => {
    return config.data
}, (error) => {
    return Promise.reject(error)
})

// 请求工具函数
export default (url, method, submitData) => {
    return instance({
        url,
        method,
        [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
    })
}