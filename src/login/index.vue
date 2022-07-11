<template>
    正在登录，请稍等。。。
</template>

<script>
import { login } from '@/api/login.js'
import { useRouter } from 'vue-router'
export default {
    name:'login',
    setup(){
        const router = useRouter()
        function formatURL(url){
            var searchObj = {}
            // 找出 url 中的 ? 字符所在的位置
            var index = url.indexOf('?')
            if(index !== -1){
                // 说明有参数，则格式化参数
                var searchString = url.slice(index + 1) // 截取 ? 之后所有的字符
                var searchArray = searchString.split('&') // 将字符串转化为数组
                searchArray.forEach(item => {
                    searchObj[item.split('=')[0]] = item.split('=')[1]
                })
            }else{
                beginToast('fail', '链接中没有参数信息', 2000)
                searchObj = ''
            }
            return searchObj
        }
        login().then(res => {
            let obj1 = formatURL(res.data)
            let obj2 = formatURL(decodeURIComponent(obj1.redirect_uri + ''))
            console.log('obj2',obj2)
            if(obj2.is_outer_net === '0'){
                window.location.href = res.data
            }else {
                router.push('/outerNet')
            }
        })
    }
}
</script>