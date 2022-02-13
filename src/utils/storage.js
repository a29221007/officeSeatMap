// 封装本地缓存的方法


// 储存数据
export const setItem = (key,data) => {
    if(typeof data === 'object'){
        window.sessionStorage.setItem(key,JSON.stringify(data))
    }else{
        window.sessionStorage.setItem(key,data)
    }
}

// 读取数据
export const getItem = (key) => {
    const item = window.sessionStorage.getItem(key)
    try{
        const value = JSON.parse(item)
        if(typeof value === 'object'){
            return value
        }else{
            return item
        }
    }catch(err){
        return item
    }
}

// 移除数据
export const removeItem = (key) => {
    window.sessionStorage.removeItem(key)
}