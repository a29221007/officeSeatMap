<template>
    <Header />
    <Main />
</template>

<script>
import Header from '../header'
import Main from '../main'
export default {
    name:'M-Layout',
    components:{
        Header,
        Main,
    }
}
</script>

<style lang="less">
body{
    position: relative;
    min-width: 320px;
    max-width: 750px;
    width: 10rem;
    margin: 0 auto;
    overflow: hidden;
}
// 当前屏幕大于等于750px
@media screen and (min-width:750px) {
    html{
        font-size: 75px!important;
    }
}
</style>