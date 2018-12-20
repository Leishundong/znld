<template>
  <div class="device-info-modal">
    <dl>
      <dt>基���信息</dt>
      <dd>
        <span>设备名称:</span>
        <span>{{deviceDetail.name}}</span>
      </dd>
      <dd>
        <span>更新时间:</span>
        <span>{{formatTime(deviceDetail.updateTime)}}</span>
      </dd>
      <dd>
        <span>信号强度:</span>
        <span v-if="deviceDetail.signalIntensity === -1">离线</span>
        <span v-if="deviceDetail.signalIntensity === 0">无</span>
        <span v-if="deviceDetail.signalIntensity === 1">最弱</span>
        <span v-if="deviceDetail.signalIntensity === 2">弱</span>
        <span v-if="deviceDetail.signalIntensity === 3">一般</span>
        <span v-if="deviceDetail.signalIntensity === 4">较强</span>
        <span v-if="deviceDetail.signalIntensity === 5">强</span>
      </dd>
      <dd>
        <span>策略下发状态:</span>
        <span v-if="deviceDetail.isSettedStrategy">已下发</span>
        <span v-else>未下发</span>
      </dd>
      <dd>
        <span>参数下发状态:</span>
        <span v-if="deviceDetail.isSettedParam">已下发</span>
        <span v-else>未下发</span>
      </dd>
      <dd>
        <span>亮度（%）:</span>
        <span>{{deviceDetail.brightness}}</span>
      </dd>
    </dl>
    <dl>
      <dt>蓄电池</dt>
      <dd>
        <span>电压（V）:</span>
        <span>{{deviceDetail.batteryVolt}}</span>
      </dd>
      <dd>
        <span>电流（A）:</span>
        <span>{{deviceDetail.batteryCurr}}</span>
      </dd>
      <dd>
        <span>充电量（WH）:</span>
        <span>{{deviceDetail.cellCharge}}</span>
      </dd>
      <dd>
        <span>放电量（WH）:</span>
        <span>{{deviceDetail.cellDischarge}}</span>
      </dd>
      <dd>
        <span>电池剩余容量（WH）:</span>
        <span>{{deviceDetail.cellResidue}}</span>
      </dd>
    </dl>
    <dl>
      <dt>太阳能板</dt>
      <dd>
        <span>电压（V）:</span>
        <span>{{deviceDetail.solarVoltage}}</span>
      </dd>
      <dd>
        <span>电流（A）:</span>
        <span>{{deviceDetail.solarCurrent}}</span>
      </dd>
    </dl>
    <dl>
      <dt>LED</dt>
      <dd>
        <span>电压（V）:</span>
        <span>{{deviceDetail.ledVolt}}</span>
      </dd>
      <dd>
        <span>电流（A）:</span>
        <span>{{deviceDetail.ledCurr}}</span>
      </dd>
    </dl>
    <dl>
      <dt>其他</dt>
      <dd>
        <span>环境温度（℃）:</span>
        <span>{{deviceDetail.temperatures}}</span>
      </dd>
    </dl>
  </div>
</template>
<script>
// 设备当前状态
import moment from 'moment'
import { mapGetters } from 'vuex'
export default {
  props: ['id'],
  computed: {
    ...mapGetters([
      'device'
    ]),
    deviceDetail () {
      return this.device(this.id)
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
<style>
.device-info-modal {
    margin-top: -20px;
    border: 1px solid #ddd;
  }
  .device-info-modal dl {
    margin: 0;
    line-height: 28px;
  }
  .device-info-modal dt {
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  .device-info-modal dd {
    margin-left: 0;
    border-bottom: 1px solid #ddd;
  }
  .device-info-modal dd span:first-child {
    color: #999;
    border-right: 1px solid #ddd;
    display: inline-block;
    width: 140px;
    padding-right: 10px;
    text-align: right;
  }
  .device-info-modal dd span + span {
    padding-left: 10px;
  }
</style>




// WEBPACK FOOTER //
// src/views/device/modal/moteStatus.vue