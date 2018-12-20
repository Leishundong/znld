<template>
  <div class="device-info-modal" v-if="strategyInDeviceDetail.name !== undefined">
    <dl>
      <dt>策略信息</dt>
      <dd>
        <span>策略名称:</span>
        <span>{{strategyInDeviceDetail.name}}</span>
      </dd>
      <dd>
        <span>当前获取时间:</span>
        <span>{{formatTime(strategyInDeviceDetail.backTime)}}</span>
      </dd>
      <dd>
        <span>光控:</span>
        <span v-if="strategyInDeviceDetail.isLightControl">开启</span>
        <span v-else>关闭</span>
      </dd>
      <dd>
        <span>智能策略:</span>
        <span v-if="strategyInDeviceDetail.isLowerLedControl">开启</span>
        <span v-else>关闭</span>
      </dd>
      <dd>
        <span>策略下发时间:</span>
        <span v-if="strategyInDeviceDetail.strategySendAt !==0">{{formatTime(strategyInDeviceDetail.strategySendAt)}}</span>
        <span v-else>暂无</span>
      </dd>
    </dl>
    <dl>
      <dt>策略时间段</dt>
      <dd v-for="(item, index) in strategyInDeviceDetail.periods" :key="index">
        <span>第{{index+1}}段：{{item.time}}</span>
        <span>亮度：{{item.brightness}}%</span>
      </dd>
      <dd>
        <span>结束时间:</span>
        <span>{{strategyInDeviceDetail.offtime?strategyInDeviceDetail.offtime:'暂无'}}</span>
      </dd>
    </dl>
  </div>
  <div v-else>
    <div class="left-list-none"></div>
    <div style="width:60px;margin: 10px auto;">暂无策略</div>
  </div>
</template>
<script>
// 设备当前策略
import moment from 'moment'
import { mapGetters } from 'vuex'
export default {
  props: ['id'],
  computed: {
    ...mapGetters([
      'strategyInDevice'
    ]),
    strategyInDeviceDetail () {
      return this.strategyInDevice({deviceId: this.id})
    }
  },
  methods: {
    formatTime (x) {
      return moment(x).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  created () {
  }
}
</script>
<style scoped lang="less">
  .left-list-none {
    background: url(../../../assets/images/none_data_img.png) no-repeat center;
    background-size: 60%;
    display: block;
    margin: 0 auto;
    width: 185px;
    height: 121px;
  }
  .device-info-modal {
    margin-top: -20px;
    border: 1px solid #ddd;
    dl {
      margin: 0;
      line-height: 28px;
    }
    dt {
      text-align: center;
      border-bottom: 1px solid #ddd;
    }
    dd {
      margin-left: 0;
      border-bottom: 1px solid #ddd;
      span:first-child {
        color: #999;
        border-right: 1px solid #ddd;
        display: inline-block;
        width: 140px;
        padding-right: 10px;
        text-align: right;
      }
      span+span {
        padding-left: 10px;
      }
    }
  }
</style>




// WEBPACK FOOTER //
// src/views/device/modal/moteStrategy.vue