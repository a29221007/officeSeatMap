<template>
    <div class="BarCodeInfo-container">
        <div class="BarCodeInfo">
            <!-- 上下布局 -->
            <div class="BarCodeInfo-top">
                <div class="line">
                    <div class="title">固定资产名称：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.asset_name}}</div>
                </div>
                <div class="line">
                    <div class="title">编号：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.asset_code}}</div>
                </div>
                <div class="line">
                    <div class="title">状态：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.status}}</div>
                </div>
                <div class="line">
                    <div class="title">型号：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.model}}</div>
                </div>
                <div class="line">
                    <div class="title">配置：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.config}}</div>
                </div>
            </div>
            <div class="BarCodeInfo-bottom">
                <div class="line">
                    <div class="title">所属员工：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.username}}</div>
                </div>
                <div class="line">
                    <div class="title">部门：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.deptName}}</div>
                </div>
                <div class="line">
                    <div class="title">工位号：</div>
                    <div class="content">{{$store.state.scanBarcodeInfoObject.seat_id}}</div>
                </div>
            </div>
        </div>
        <div class="goback" v-on:click="$router.push('/home')">返 回</div>
    </div>
</template>

<script>
export default {
    name:'BarCodeInfo',
    setup() {
        return {

        }
    }
}
</script>

<style lang="less" scoped>
.BarCodeInfo-container{
    width: 100%;
    height: 100%;
    background-color: #f2f2f2;
    padding: .2688rem;
    .BarCodeInfo{
        border-radius: 10px;
        padding: .2688rem;
        background-color: #fff;
        .BarCodeInfo-top{
            border-bottom: 1px solid #ccc;
        }
        .line{
            line-height: 2.5;
            display: flex;
            align-items: baseline;
            .title{
                flex: 1.7;
                font-size: .3763rem;
            }
            .content{
                flex: 4;
                word-break: break-all;
                white-space: nowrap;
                overflow: auto;
            }
        }
    }
    .goback{
        height: .8602rem;
        line-height: .8602rem;
        text-align: center;
        font-size: .4301rem;
        background-color: #fff;
        border-radius: 10px;
        margin-top: 10px;
    }
}
</style>