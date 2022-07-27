// 封装消息提示组件

import { Toast } from 'vant'

/**
 * 开始提示
 * type: 提示的类型
 * message：提示的文本内容
 * duration：展示时长，单位是 ms
 * teleport：挂载到哪一个元素上
 * */ 
export const beginToast = (type,message,duration,teleport) => {
    // 挂载位置默认是 body
    teleport = teleport || 'body'
    Toast({
        type,
        message,
        // 禁止背景点击
        forbidClick: true,
        duration,
        teleport:teleport
    })
}

// 结束提示
export const endToast = () => {
    Toast.clear()
}