// 封装axios
import axios from 'axios'
// export const baseURL = 'http://maptest.longtubas.com:8091/api/' // 测试服
// export const baseURL = 'https://mapbackend.longtubas.com/api/' // 正式服
export const baseURL = 'https://map.longtubas.com/api/' // 正式服
// 创建axios的实例对象
const instance = axios.create({
    baseURL,
    timeout: 5000,
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