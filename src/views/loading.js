import { ElLoading } from 'element-plus'

let loading = null

export const beginLoading = () => {
    loading = ElLoading.service({
        lock:true,
        text:'加载中',
        background:'rgba(122, 122, 122, 0.8)'
    })
}

// 结束提示
export const endLoading = () => {
    loading.close()
}