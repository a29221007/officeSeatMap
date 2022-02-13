import { ElMessage } from 'element-plus'

// 成功消息提示
export const successMessage = (message) => {
    return ElMessage({
        type:'success',
        customClass:'successMessageBox',
        message
    })
}

// 失败消息提示
export const errorMessage = (message) => {
    return ElMessage({
        type:'error',
        duration:8000,
        showClose:true,
        customClass:'errorMessageBox',
        message
    })
}

// 操作消息提示
export const infoMessage = (message) => {
    return ElMessage({
        type:'info',
        duration:8000,
        showClose:true,
        customClass:'infoMessageBox',
        message
    })
}

// 警告消息提示
export const warnMessage = (message) => {
    return ElMessage({
        type:'warning',
        duration:8000,
        showClose:true,
        customClass:'warnMessageBox',
        message
    })
}