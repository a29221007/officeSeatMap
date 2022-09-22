<template>
    <div class="layout">
        <Header />
        <Main />
    </div>
</template>

<script>
import Header from '../header'
import Main from '../main'
export default {
    name:'layout',
    components:{
        Header,
        Main,
    }
}
</script>

<style lang="less" scoped>
.layout{
    width: 62.5%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}
</style>