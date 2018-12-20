<template>
  <!-- 图表外层 -->
  <ul class="chart-wrap device-modal-chart">
    <li>
      <div class="title">太阳能板</div>
      <div v-loading="loading" class="device-monitor-bg" id="modalc1"></div>
    </li>
    <li>
      <div class="title">LED灯</div>
      <div v-loading="loading" class="device-monitor-bg" id="modalc2"></div>
    </li>
    <li>
      <div class="title">蓄电池</div>
      <div v-loading="loading" class="device-monitor-bg" id="modalc3"></div>
    </li>
  </ul>
</template>

<script>
  import { monitorChart1 } from '../../../utils/monitorChart'
  import { getCurrentTime } from '../../../utils/time'
  import { mapGetters } from 'vuex'
  export default {
    data () {
      return {
        time1: '',
        loading: false
      }
    },
    props: ['id'],
    watch: {
      id () {
        this.renderMonitorSingle(this.id, this.time1)
      }
    },
    computed: {
      ...mapGetters([
        'statisticStatus'
      ])
    },
    methods: {
      async renderMonitorSingle (id, date) {
        this.loading = true
        let currentData = []
        try {
          currentData = this.statisticStatus({deviceId: id, date: date})
        } finally {
          this.loading = false
        }
        document.getElementById('modalc1').innerHTML = ''
        document.getElementById('modalc2').innerHTML = ''
        document.getElementById('modalc3').innerHTML = ''
        // console.log(currentData)
        if (currentData.length !== 0) {
          // 数据统计-太阳能板
          let solarData = []
          currentData.forEach((item) => {
            solarData.push({time: item.time, 电压: item.solarVoltage, 电流: item.solarCurrent, 功率: item.solarPower})
          })
          // 数据统计-LED
          let LEDData = []
          currentData.forEach((item) => {
            LEDData.push({time: item.time, LED电压: item.ledVoltage, LED电流: item.ledCurrent, LED功率: item.ledPower, 亮度: item.brightness})
          })
          // 数据统计-蓄电池
          let batteryData = []
          currentData.forEach((item) => {
            batteryData.push({time: item.time, 蓄电池电压: item.batteryVolt, 蓄电池电流: item.batteryCurr, 蓄电池功率: item.batteryPower, 电池充电量: item.cellCharge, 电池放电量: item.cellDischarge, 环境温度: item.temperatures, 信号值: item.signalValue})
          })
          monitorChart1('modalc1', solarData, [ '电压', '电流', '功率' ])
          monitorChart1('modalc2', LEDData, [ 'LED电压', 'LED电流', 'LED功率', '亮度' ])
          monitorChart1('modalc3', batteryData, ['蓄电池电压', '蓄电池电流', '蓄电池功率', '电池充电量', '电池放电量', '环境温度', '信号值'])
        }
      }
    },
    mounted () {
      this.renderMonitorSingle(this.id, this.time1)
    },
    created () {
      this.time1 = getCurrentTime()
    }
  }
</script>
<style scoped lang='less'>
  .device-modal-chart {
    width: 460px;
    padding-left: 0;
    li {
      list-style-type: none;
      .title {
        text-align: center;
      }
    }
  }
  .device-monitor-bg {
    width: 460px;
    height: 280px;
    /*background: url(../../../assets/images/g2_data_none.png) no-repeat center;*/
    background-size: 150px;
  }
</style>




// WEBPACK FOOTER //
// src/views/device/modal/moteMonitor.vue
