<template>
    <div class="container">
        <!-- 第一行 -->
        <div class="line">
            <!-- 第一列 -->
            <div class="col">
                <div class="title">区域名称：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.name + ($store.state.activeInfo.subtitle ? $store.state.activeInfo.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") : '')}}</span></div>
            </div>
        </div>
        <!-- 第二行 -->
        <div class="line">
            <!-- 第一列 -->
            <div class="col">
                <div class="title">区域编号：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.code}}</span></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'Department_And_OtherAreas',
}
</script>

<style lang="less" scoped>
.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .line{
        display: flex;
        height: .8602rem;
        align-items: center;
        justify-content: space-between;
        .col{
            flex: 1;
            white-space:nowrap;
            overflow: hidden;
            display: flex;
            align-items: baseline;
            .title{
                flex: 1;
                font-size: .3763rem;
                color: #f8f9fa;
            }
            .content{
                flex: 3;
                overflow: hidden;
                span{
                    position: relative;
                }
            }
        }
    }
}
</style>