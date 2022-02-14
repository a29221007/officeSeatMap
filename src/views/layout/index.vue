<template>
    <Header />
    <Main />
</template>

<script>
import Header from '../header'
import Main from '../main'
import { useStore } from 'vuex'
export default {
    name:'layout',
    components:{
        Header,
        Main,
    },
    setup(){
        // 在layout组件中初始化store中的状态
        const store = useStore()
        store.commit('setCurrentFloor','three')
        store.dispatch('getSeatListOfthree')
        store.dispatch('getSeatListOfFour')
    }
}
</script>

<style lang="less" scoped>

</style>