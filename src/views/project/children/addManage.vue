<template>
  <div class="add-device">
    <el-form :model="addDevicesForm" :rules="addDevicesrules" ref="addDevicesForm" label-position="left" label-width="155px" size="small">
      <el-form-item label="SN" prop="snHexadecimal" v-if="msg === '增加设备'">
        <el-input v-model="addDevicesForm.snHexadecimal" @change="getParams"></el-input>
      </el-form-item>
      <el-form-item label="PN" prop="pnHexadecimal" v-if="msg === '增加设备'">
        <el-input v-model="addDevicesForm.pnHexadecimal" ></el-input>
      </el-form-item>
      <el-form-item label="设备名称" prop="name" >
        <el-input v-model="addDevicesForm.name" :disabled="setEditState()"></el-input>
      </el-form-item>
      <el-form-item label="设备经度" prop="lng" v-if="msg === '增加设备'">
        <el-input v-model="addDevicesForm.lng" ></el-input>
      </el-form-item>
      <el-form-item label="设备纬度" prop="lat" v-if="msg === '增加设备'">
        <el-input v-model="addDevicesForm.lat" ></el-input>
      </el-form-item>
      <el-form-item label="LED额定电流(A)" prop="ledRatedCurrent">
        <el-input v-model="addDevicesForm.ledRatedCurrent"></el-input>
      </el-form-item>
      <el-form-item label="电池类型" prop="batteryType" >
        <el-select v-model="addDevicesForm.batteryType"
          @change="getParams" 
          placeholder="请选择">
          <el-option
            v-for="item in batteryTypes"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="电池电压类型">
        <el-select v-model="addDevicesForm.paramSettingMode" placeholder="请选择" >
          <el-option
            v-for="item in batteryVoltages"
            :key="item.id"
            :label="item.name==='其他'?item.name:item.name+'V'"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="电池电压(V)" prop="batteryVoltage">
        <el-input v-model="addDevicesForm.batteryVoltage" :disabled="changeParamInput()"></el-input>
      </el-form-item>
      <el-form-item label="电池超压电压(V)" prop="batteryOverVoltage">
        <el-input v-model="addDevicesForm.batteryOverVoltage" :disabled="changeParamInput()"></el-input>
      </el-form-item>
      <el-form-item label="电池超压恢复电压(V)" prop="batteryOverToBackVoltage">
        <el-input v-model="addDevicesForm.batteryOverToBackVoltage" :disabled="changeParamInput()"></el-input>
      </el-form-item>
      <el-form-item label="电池低压电压(V)" prop="batteryLowVoltage">
        <el-input v-model="addDevicesForm.batteryLowVoltage" :disabled="changeParamInput()"></el-input>
      </el-form-item>
      <el-form-item label="电池低压恢复电压(V)" prop="batteryLowToBackVoltage">
        <el-input v-model="addDevicesForm.batteryLowToBackVoltage" :disabled="changeParamInput()"></el-input>
      </el-form-item>
      <el-form-item label="光控天亮阀值(V)" prop="dayThreshold">
        <el-input v-model="addDevicesForm.dayThreshold"></el-input>
      </el-form-item>
      <el-form-item label="光控天黑阀值(V)" prop="nightThreshold">
        <el-input v-model="addDevicesForm.nightThreshold"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="checkAddDevice();">提交</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>
<script>
  import { mapActions } from 'vuex'
  import { Loading } from 'element-ui'
  export default {
    name: 'addManage',
    props: {
      // 判断展示当前弹出层的目的
      msg: '',
      // 要添加的设备信息
      addDevicesForm: {
        snHexadecimal: '',
        pnHexadecimal: '',
        name: '',
        lng: '118.051069',
        lat: '24.606999',
        ledRatedCurrent: '',
        batteryType: 1,
        paramSettingMode: 0,
        batteryVoltage: '',
        batteryOverVoltage: '',
        batteryOverToBackVoltage: '',
        batteryLowVoltage: '',
        batteryLowToBackVoltage: '',
        dayThreshold: '',
        nightThreshold: ''
      }
    },
    data () {
      // 自定义检验输入值是否为数字
      var checkNumber = (rule, value, callback) => {
        // 判断取值区间
        let singleParams = this.singleParams
        if (!this.singleParams) return
        switch (rule.field) {
          case 'ledRatedCurrent':
            if (value < singleParams.ledRatedCurrentMin || value > singleParams.ledRatedCurrentMax) {
              callback(new Error(`LED灯额定电流值应在${singleParams.ledRatedCurrentMin}~${singleParams.ledRatedCurrentMax}之间`))
            }
            break
          case 'batteryVoltage':
            if (value < singleParams.batteryVoltageMin || value > singleParams.batteryVoltageMax) {
              callback(new Error(`电池电压值应在${singleParams.batteryVoltageMin}~${singleParams.batteryVoltageMax}之间`))
            }
            break
          case 'batteryOverVoltage':
            if (value < singleParams.batteryOverVoltageMin || value > singleParams.batteryOverVoltageMax) {
              callback(new Error(`电池超压电压值应在${singleParams.batteryOverVoltageMin}~${singleParams.batteryOverVoltageMax}之间`))
            }
            break
          case 'batteryOverToBackVoltage':
            if (value < singleParams.batteryOverToBackVoltageMin || value > singleParams.batteryOverToBackVoltageMax) {
              callback(new Error(`电池超压恢复电压值应在${singleParams.batteryOverToBackVoltageMin}~${singleParams.batteryOverToBackVoltageMax}之间`))
            }
            break
          case 'batteryLowVoltage':
            if (value < singleParams.batteryLowVoltageMin || value > singleParams.batteryLowVoltageMax) {
              callback(new Error(`电池低压电压值应在${singleParams.batteryLowVoltageMin}~${singleParams.batteryLowVoltageMax}之间`))
            }
            break
          case 'batteryLowToBackVoltage':
            if (value < singleParams.batteryLowToBackVoltageMin || value > singleParams.batteryLowToBackVoltageMax) {
              callback(new Error(`电池低压恢复电压值应在${singleParams.batteryLowToBackVoltageMin}~${singleParams.batteryLowToBackVoltageMax}之间`))
            }
            break
          case 'dayThreshold':
            if (value < singleParams.dayThresholdMin || value > singleParams.dayThresholdMax) {
              callback(new Error(`光控天亮阈值应在${singleParams.dayThresholdMin}~${singleParams.dayThresholdMax}之间`))
            }
            break
          case 'nightThreshold':
            if (value < singleParams.nightThresholdMin || value > singleParams.nightThresholdMax) {
              callback(new Error(`光控天黑阈值应在${singleParams.nightThresholdMin}~${singleParams.nightThresholdMax}之间`))
            }
            break
        }
        let reg = /^(\+)?\d+(\.\d+)?$/
        if (!reg.test(value)) {
          return callback(new Error('请输入数字值'))
        } else {
          return callback()
        }
      }
      // 自定义检验输入值是否为符合为经度
      var checkLng = (rule, value, callback) => {
        let reg = /^-?((0|1?[0-7]?[0-9]?)(([.][0-9]{1,8})?)|180(([.][0]{1,8})?))$/
        if (!reg.test(value)) {
          return callback(new Error('请输入正确的经度值'))
        } else {
          return callback()
        }
      }
      // 自定义检验输入值是否为符合为纬度
      var checkLat = (rule, value, callback) => {
        let reg = /^-?((0|[1-8]?[0-9]?)(([.][0-9]{1,8})?)|90(([.][0]{1,8})?))$/
        if (!reg.test(value)) {
          return callback(new Error('请输入正确的纬度值'))
        } else {
          return callback()
        }
      }
      return {

        // 表单校验规则
        addDevicesrules: {
          snHexadecimal: [
            {required: true, message: '请输入SN号', trigger: 'blur'}
          ],
          pnHexadecimal: [
            {required: true, message: '请输入PN号', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入设备名称', trigger: 'blur'},
            { min: 1, max: 16, message: '长度最多到16个字符', trigger: 'blur' }
          ],
          lng: [
            {required: true, message: '请输入设备经度', trigger: 'blur'},
            { validator: checkLng, trigger: 'blur' }
          ],
          lat: [
            {required: true, message: '请输入设备纬度', trigger: 'blur'},
            { validator: checkLat, trigger: 'blur' }
          ],
          ledRatedCurrent: [
            {required: true, message: '请输入LED额定电流', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          batteryType: [
            {required: true, message: '请选择电池类型', trigger: 'blur'}
          ],
          batteryVoltage: [
            {required: true, message: '请输入电池电压', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          batteryOverVoltage: [
            {required: true, message: '请输入电池超压电压', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          batteryOverToBackVoltage: [
            {required: true, message: '请输入电池超压恢复电压', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          batteryLowVoltage: [
            {required: true, message: '请输入电池低压电压', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          batteryLowToBackVoltage: [
            {required: true, message: '请输入电池低压恢复电压', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          dayThreshold: [
            {required: true, message: '请输入光控天亮阀值', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ],
          nightThreshold: [
            {required: true, message: '请输入光控天黑阀值', trigger: 'blur'},
            { validator: checkNumber, trigger: 'blur' }
          ]
        },
        // 电池类型
        batteryTypes: [
          {
            id: 1,
            name: '磷酸铁锂'
          },
          {
            id: 2,
            name: '三元锂'
          },
          {
            id: 3,
            name: '铅酸'
          }
        ],
        batteryVoltages: [
          {
            id: 0,
            name: '12'
          },
          {
            id: 1,
            name: '24'
          },
          {
            id: 2,
            name: '其他'
          }
        ],
        // 可选择的电池参数
        batteryParams: [
          {
            params: [
              {
                batteryOverVoltage: '14.6',
                batteryOverToBackVoltage: '14.2',
                batteryLowVoltage: '10.6',
                batteryLowToBackVoltage: '11.8',
                dayThreshold: '10.0',
                nightThreshold: '3.0'
              },
              {
                batteryOverVoltage: '29.2',
                batteryOverToBackVoltage: '28.4',
                batteryLowVoltage: '21.2',
                batteryLowToBackVoltage: '23.6',
                dayThreshold: '20.0',
                nightThreshold: '6.0'
              }
            ]
          },
          {
            params: [
              {
                batteryOverVoltage: '12.6',
                batteryOverToBackVoltage: '12.2',
                batteryLowVoltage: '9.5',
                batteryLowToBackVoltage: '10.5',
                dayThreshold: '10.0',
                nightThreshold: '3.0'
              },
              {
                batteryOverVoltage: '25.2',
                batteryOverToBackVoltage: '24.4',
                batteryLowVoltage: '19.0',
                batteryLowToBackVoltage: '21.0',
                dayThreshold: '20.0',
                nightThreshold: '6.0'
              }
            ]
          },
          {
            params: [
              {
                batteryOverVoltage: '14.6',
                batteryOverToBackVoltage: '14.2',
                batteryLowVoltage: '10.6',
                batteryLowToBackVoltage: '11.8',
                dayThreshold: '10.0',
                nightThreshold: '3.0'
              },
              {
                batteryOverVoltage: '29.2',
                batteryOverToBackVoltage: '28.4',
                batteryLowVoltage: '21.2',
                batteryLowToBackVoltage: '23.6',
                dayThreshold: '20.0',
                nightThreshold: '6.0'
              }
            ]
          }
        ],
        // 全部匹配电池参数
        deviceParams: {},
        // 匹配选择的电池参数
        singleParams: {},
        // 匹配sn号
        snHex: ''
      }
    },

    computed: {
      currentProjectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      }
    },
    methods: {
      ...mapActions([
        'createDevice',
        'updateDeviceConfig'
      ]),
      // 控制设备名称是否可以被编辑
      setEditState () {
        if (this.msg === '增加设备') {
          return false
        } else if (this.msg === '修改设备参数') {
          return true
        } else {
          return false
        }
      },
      changeParamInput () {
        // 设置要添加设备信息的参数
        this.setDevice(this.addDevicesForm.batteryType, this.addDevicesForm.paramSettingMode)
        // 判断部分输入框是否可以被编辑
        if (this.addDevicesForm.paramSettingMode === 0) {
          this.addDevicesForm.batteryVoltage = '12'
          return true
        } else if (this.addDevicesForm.paramSettingMode === 1) {
          this.addDevicesForm.batteryVoltage = '24'
          return true
        } else if (this.addDevicesForm.paramSettingMode === 2) {
          return false
        } else {
          return true
        }
      },
      // 设置要添加设备信息的参数
      setDevice (batteryType, paramSettingMode) {
        // batteryParams为0、1、2
        let type = batteryType - 1
        if (this.batteryParams[type] && this.batteryParams[type].params[paramSettingMode]) {
          const params = this.batteryParams[type].params[paramSettingMode]
          this.addDevicesForm.batteryOverVoltage = params.batteryOverVoltage
          this.addDevicesForm.batteryOverToBackVoltage = params.batteryOverToBackVoltage
          this.addDevicesForm.batteryLowVoltage = params.batteryLowVoltage
          this.addDevicesForm.batteryLowToBackVoltage = params.batteryLowToBackVoltage
          this.addDevicesForm.dayThreshold = params.dayThreshold
          this.addDevicesForm.nightThreshold = params.nightThreshold
        }
      },
      // 重置表单
      resetForm () {
        this.$refs.addDevicesForm.resetFields()
      },
      // 添加设备检验
      checkAddDevice () {
        if (this.msg === '增加设备') {
          if (this.addDevicesForm.snHexadecimal === '') {
            this.$notify({
              type: 'warning',
              title: '提示',
              message: '请先输入sn号'
            })
            return
          }
        }
        if (!this.singleParams) {
          this.$notify({
            type: 'warning',
            title: '提示',
            message: 'sn号不符合规则！'
          })
          return
        }
        this.$refs.addDevicesForm.validate((valid) => {
          if (!valid) {
            return false
          } else {
            if (this.msg === '增加设备') {
              this.confirmAddDevices()
            } else if (this.msg === '修改设备参数') {
              this.updataDevicParams()
            } else {

            }
            return true
          }
        })
      },
      // 添加设备请求
      async confirmAddDevices () {
        const addDevicesInfor = {}
        addDevicesInfor.projectId = this.currentProjectId
        addDevicesInfor.name = this.addDevicesForm.name
        addDevicesInfor.lng = this.addDevicesForm.lng
        addDevicesInfor.lat = this.addDevicesForm.lat
        addDevicesInfor.snHexadecimal = this.addDevicesForm.snHexadecimal
        addDevicesInfor.pnHexadecimal = this.addDevicesForm.pnHexadecimal
        addDevicesInfor.paramSettingMode = this.addDevicesForm.paramSettingMode !== 2 ? 1 : 2
        addDevicesInfor.batteryType = this.addDevicesForm.batteryType
        addDevicesInfor.batteryVoltage = this.addDevicesForm.batteryVoltage
        addDevicesInfor.batteryOverVoltage = this.addDevicesForm.batteryOverVoltage
        addDevicesInfor.batteryOverToBackVoltage = this.addDevicesForm.batteryOverToBackVoltage
        addDevicesInfor.batteryLowVoltage = this.addDevicesForm.batteryLowVoltage
        addDevicesInfor.batteryLowToBackVoltage = this.addDevicesForm.batteryLowToBackVoltage
        addDevicesInfor.ledRatedCurrent = this.addDevicesForm.ledRatedCurrent
        addDevicesInfor.dayThreshold = this.addDevicesForm.dayThreshold
        addDevicesInfor.nightThreshold = this.addDevicesForm.nightThreshold
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.createDevice(addDevicesInfor)
          this.$notify({
            type: 'success',
            title: '提示',
            message: '提交成功！'
          })
        } catch (e) {
          console.log(e)
        } finally {
          loadingInstance.close()
        }
      },
      // 下发设备参数的请求
      async updataDevicParams () {
        const devicesParams = {}
        devicesParams.id = this.addDevicesForm.id
        devicesParams.paramSettingMode = this.addDevicesForm.paramSettingMode !== 2 ? 1 : 2
        devicesParams.batteryType = this.addDevicesForm.batteryType
        devicesParams.batteryVoltage = this.addDevicesForm.batteryVoltage
        devicesParams.batteryOverVoltage = this.addDevicesForm.batteryOverVoltage
        devicesParams.batteryOverToBackVoltage = this.addDevicesForm.batteryOverToBackVoltage
        devicesParams.batteryLowVoltage = this.addDevicesForm.batteryLowVoltage
        devicesParams.batteryLowToBackVoltage = this.addDevicesForm.batteryLowToBackVoltage
        devicesParams.ledRatedCurrent = this.addDevicesForm.ledRatedCurrent
        devicesParams.dayThreshold = this.addDevicesForm.dayThreshold
        devicesParams.nightThreshold = this.addDevicesForm.nightThreshold
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.updateDeviceConfig(devicesParams)
          this.$notify({
            type: 'success',
            title: '提示',
            message: '提交成功！'
          })
        } catch (e) {
          console.log(e)
        } finally {
          loadingInstance.close()
        }
      },
      // 改变sn号、电池类型  动态获取参数匹配参数
      getParams () {
        if (this.msg === '修改设备参数') {
          this.snHex = this.addDevicesForm.snHex
        } else {
          this.snHex = this.addDevicesForm.snHexadecimal
        }
        let batteryType = this.addDevicesForm.batteryType
        // 匹配sn号和电池类型
        let data = this.deviceParams.filter(item => {
          return batteryType === item.batteryType && this.snHex.substr(0, 2).startsWith(item.snMatch)
        })
        this.singleParams = data[0]
      }
    },
    // 监听数据变化
    watch: {
      addDevicesForm: function () {
        this.getParams()
      }
    },
    mounted () {
      // 获取配置参数
      this.deviceParams = JSON.parse(window.sessionStorage.getItem('device_params'))
      // 初始化修改参数
      this.getParams()
    }
  }
</script>
<style scoped>
  .add-device .el-form-item{
    margin-bottom: 15px;
  }
</style>



// WEBPACK FOOTER //
// src/views/project/children/addManage.vue