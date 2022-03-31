// 封装axios
import axios from 'axios'
export const baseURL = 'http://172.16.200.152:8091/api/'
// export const baseURL = 'http://maptest.longtubas.com:8091/api/'
// 创建axios的实例对象
const instance = axios.create({
    baseURL,
    timeout: 5000
})

// 请求拦截
instance.interceptors.request.use((config) => {
    return config
}, (error) => {
    return Promise.reject(error)
})

// 响应拦截
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