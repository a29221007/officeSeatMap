<template>
    正在登录，请稍等。。。
</template>

<script>
import { login } from '@/api/login.js'
export default {
    name:'login',
    setup(){
        login().then(res => {
            console.log(res)
            window.location.href = res.data
        })
    }
}
</script>