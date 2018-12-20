<template>
  <el-form :model="formData" :rules="rules" ref="form" label-width="80px">
    <el-form-item label="策略名称" prop="name">
      <el-input v-model="formData.name" style="width:30%;" :disabled="!isEdit"></el-input>
      <el-button type="primary" class="add-strategy-btn" @click="addDomain" v-show="isEdit">增加时间阶段</el-button>
    </el-form-item>

    <!-- <div style="height: 30px;">时间—亮度</div> -->
    <div style="height: 30px;">时间—亮度<span class="subTitle" v-if="sunup !== ''">日出: {{sunup}} 日落: {{sunset}}</span></div>
    <app-times v-model="formData.strategyTimes" @remove="removeDomain" :isEdit="isEdit"></app-times>

    <el-form-item label="模式">
      <el-checkbox v-model="formData.isLightControl" :disabled="!isEdit">光控</el-checkbox>
      <el-checkbox v-model="formData.isLowerLedControl" @change="handlePowerChange" :disabled="!isEdit">智能功率</el-checkbox>
      <el-checkbox v-model="formData.isTrafficControl" :disabled="!isEdit">人体感应</el-checkbox>
    </el-form-item>

    <el-form-item label="备注">
      <el-input v-model="formData.remark" type="textarea" style="width:60%;" :disabled="!isEdit"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading" v-show="isEdit">确 定</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import AppTimes from './times'
  import { getCurrentTime, getSunRiseTimeAndSunDownTime } from '../../../utils/time'
  import { mapGetters } from 'vuex'
  import weatherCode from '../../../utils/weather_area_station_simple'

  export default {
    name: 'strategy_form',

    props: {
      /**
       * 绑定表单，值为策略标准模型，可为空
       */
      value: {
        required: true
      },
      loading: {
        type: Boolean
      },
      isEdit: {
        type: Boolean
      }
    },

    data () {
      return {
        formData: this.getFormDataFromModel(this.value),
        rules: {
          name: [
            { required: true, message: '请输入策略名称' },
            { max: 16, message: '名称长度不能大于 16' }
          ]
        },
        time1: '',
        longitude: '',
        latitude: '',
        // 日出
        sunup: '',
        // 日落
        sunset: ''
      }
    },

    watch: {
      value (val) {
        this.formData = this.getFormDataFromModel(val)
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      },
      projectId () {
        this.getSunupAndSunset()
      }
    },

    methods: {
      /**
       * 提交，参数如下
       * { name, strategyTimes, offtime, lightControl: isLightControl, lowerLedControl: isLowerLedControl, remark }
       */
      handleSubmit () {
        this.$refs.form.validate(valid => {
          if (!valid) return
          const data = this.before(this.formData)
          this.$emit('submit', data)
        })
      },
      // 添加时间段
      addDomain () {
        const length = this.formData.strategyTimes.length
        if (length > 5) {
          this.$notify({
            type: 'warning',
            title: '提示',
            message: '最多只能 6 个时间段'
          })
          return
        }
        const prev = this.formData.strategyTimes[length - 1]
        this.formData.strategyTimes.push({
          startTime: prev.endTime,
          endTime: '',
          brightness: ''
        })
      },
      // 删除时间段
      removeDomain (index) {
        this.formData.strategyTimes.splice(index, 1)
      },
      // 改变智能功率
      handlePowerChange (val) {
        if (!val) return
        this.$confirm('开启智能功率，会自动根据电池情况将当前亮度乘以适当的百分比后下发，是否继续开启？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
        })
        .catch(() => {
          this.formData.isLowerLedControl = false
        })
      },
      // 设置策略表单，参数为策略标准模型
      getFormDataFromModel (strategy) {
        if (!strategy || !strategy.name) {
          return {
            name: '',
            strategyTimes: [
              { startTime: '', endTime: '', brightness: '' }
            ],
            isLightControl: false,
            isLowerLedControl: false,
            isTrafficControl: false,
            remark: ''
          }
        }
        const { name, isLightControl, isLowerLedControl, isTrafficControl, remark, periods, offtime } = strategy
        // if (strategy.hasOwnProperty('isEdit')) {
        //   this.isEdit = strategy.isEdit
        // }
        const strategyTimes = periods.map((item, index) => {
          return {
            startTime: item.time,
            endTime: index === periods.length - 1 ? offtime : '',
            brightness: item.brightness
          }
        })
        return {
          name,
          strategyTimes,
          isLightControl,
          isLowerLedControl,
          isTrafficControl,
          remark
        }
      },
      // 整理提交数据格式
      before (form) {
        const { name, strategyTimes, isLightControl, isLowerLedControl, isTrafficControl, remark } = form
        const periods = strategyTimes.map(item => {
          return {
            time: item.startTime,
            brightness: item.brightness
          }
        })
        const length = strategyTimes.length
        const offtime = strategyTimes[length - 1].endTime
        return {
          name,
          strategyTimes: periods,
          offtime,
          lightControl: isLightControl,
          lowerLedControl: isLowerLedControl,
          trafficControl: isTrafficControl,
          remark
        }
      },
      // 计算日出日落
      getSunRiseTimeAndSunDownTime () {
        let sunInfo = getSunRiseTimeAndSunDownTime(this.time1, this.longitude, this.latitude)
        this.sunup = sunInfo.sunRiseTime
        this.sunset = sunInfo.sunDownTime
      },
      // 清空日出日落
      clearSunRiseTimeAndSunDownTime () {
        this.sunup = ''
        this.sunset = ''
      },
      getSunupAndSunset () {
        // 根据项目Id 获取经纬度，获取日出日落时间
        this.time1 = getCurrentTime()
        let adCode = this.project(this.$route.params.projectId).adCode
        if (adCode) {
          let locationInfo = weatherCode.filter(item => adCode === item.adcode)
          this.longitude = locationInfo[0].lng
          this.latitude = locationInfo[0].lat
          return this.getSunRiseTimeAndSunDownTime()
        } else {
          return this.clearSunRiseTimeAndSunDownTime()
        }
      }
    },
    computed: {
      ...mapGetters([
        'project'
      ]),
      // 项目ID
      projectId () {
        return this.$route.params.projectId
      }
    },
    created () {
      this.getSunupAndSunset()
    },
    mounted () {
    },
    components: {
      AppTimes
    }
  }
</script>

<style scoped>
  .add-strategy-btn {
    float: right;
    margin-right: 15px;
  }
  .subTitle {
    margin-left: 10px;
    margin-top: 10px;
    color: #1890ff;
  }
</style>



// WEBPACK FOOTER //
// src/views/strategy/comps/formStrategy.vue