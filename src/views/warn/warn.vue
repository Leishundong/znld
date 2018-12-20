<template>
  <div class="device-table-wrap">
    <div class="warn-list-top">
      <h2 class="warn-list-tip">告警列表</h2>
    </div>
    <div class="warn-divider"></div>
    <div class="device-list-operation">
      <div class="device-list-select">
        <!-- <el-select v-model="selectedDevices" placeholder="设备筛选" multiple>
          <el-option
            v-for="item in currentDeviceList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select> -->
        <el-input style="width:240px;" placeholder="告警设备筛选" v-model="deviceName" @change="getWarning" clearable></el-input>
        <el-select 
          v-model="stateNumber" 
          placeholder="筛选告警状态" 
          @change="getWarning"
          clearable>
          <el-option label="已读" :value="5"></el-option>
          <el-option label="未处理" :value="1"></el-option>
        </el-select>
        <span style="margin-left:10px;">选择日期：</span>
        <el-date-picker
          id="startTime"
          v-model="startTime"
          align="right"
          type="date"
          placeholder="起始日期"
          :editable="false"
          @change="getWarning"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions">
        </el-date-picker>
        &nbsp;至&nbsp;
        <el-date-picker
          id="endTime"
          v-model="endTime"
          align="right"
          type="date"
          placeholder="结束日期"
          :editable="false"
          @change="getWarning"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions">
        </el-date-picker>
      </div>
      <div class="deivce-list-btn" v-if="isPermiss('MANAGER_PROJECT_WARN')">
        <el-button type="primary" @click="handleRead" :disabled="!multipleSelection.length" :loading="loadingRead"> 标记已读 </el-button>
      </div>
    </div>

    <!-- start 告警列表 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="moteName"
        label="告警设备"
        width="200">
        <template slot-scope="scope">
          <router-link :to="{ name: 'monitor', query: { searchText: scope.row.moteName, deviceId: scope.row.deviceId } }">
            {{ scope.row.moteName }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        label="告警类型"
        width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.alertType | type }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="告警等级"
        width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.alertLevel | level }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="处理状态"
        prop="state"
        width="150">
        <template slot-scope="scope">
          <i :class="scope.row.alertStatus | state"></i>
        </template>
      </el-table-column>
      <el-table-column
        prop="updatedAt || createdAt"
        label="告警时间"
        width="220">
        <template slot-scope="scope">
          <span>{{ (scope.row.updatedAt || scope.row.createdAt) | time }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="dataStr"
        label="告警内容">
      </el-table-column>
      <el-table-column
        prop="dataStr"
        label="解决方案参考"
        min-width="200">
        <template slot-scope="scope">
          <span>{{ scope.row | solution }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- end 告警列表 -->

    <!-- start 分页 -->
    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizeGroup"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <!-- end 分页 -->
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import moment from 'moment'
  import { Loading } from 'element-ui'
  const mapType = {
    1: '太阳能板异常',
    2: 'LED过压保护',
    3: 'LED过流',
    4: '温度过高/过低',
    5: '电池低压',
    6: '灭灯'
  }
  const mapLevel = {
    1: 'error'
  }
  const mapSolution = {
    1: '请检查太阳能接线是否正确，太阳能板是否被遮挡',
    2: '检查LED线是否正确，LED串并数是否合理',
    3: 'LED过流保护',
    4: '',
    5: '电池电量不足，请确认充电是否正常',
    6: '',
    7: '检查电池接线是否正确'
  }
  // const mapState = {
  //   1: '未处理',
  //   2: '处理中',
  //   3: '已处理',
  //   4: '无需处理',
  //   5: '已读'
  // }

  export default {
    data () {
      return {
        // 分页
        pageSize: 10,
        pageSizeGroup: [10, 20, 50, 100, 200],
        currentPage: 1,
        // 选中项
        multipleSelection: [],
        selectedDevices: [],
        // 过滤
        deviceName: '',
        startTime: '',
        endTime: '',
        stateNumber: '',
        // 配置
        pickerOptions: {
          disabledDate (time) {
            return time.getTime() > Date.now()
          },
          shortcuts: [{
            text: '今天',
            onClick (picker) {
              picker.$emit('pick', new Date())
            }
          }, {
            text: '昨天',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }, {
            text: '一周前',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }]
        },
        // 状态
        loadingRead: false,
        tableData: [],
        total: 0
      }
    },

    computed: {
      ...mapGetters([
        'warningList',
        'deviceList',
        'isPermissByFunName'
      ]),
      projectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      currentDeviceList () {
        return this.deviceList({ projectId: this.projectId })
      },
      // 需要加结束时间加上一天，保证结束时间为选中日期的24点
      normalizedEndTime () {
        return this.endTime ? Date.parse(this.endTime) + 24 * 3600 * 1000 - 1000 : ''
      }
      // currentWarningList () {
      //   const { deviceName, startTime, normalizedEndTime, projectId, selectedDevices, stateNumber } = this
      //   const filter = { deviceName, start: startTime, end: normalizedEndTime, projectId, deviceId: selectedDevices, stateNumber }
      //   return this.warningList(filter)
      // }
      // // 客户端分页
      // tableData () {
      //   const { currentPage, pageSize } = this
      //   const start = (currentPage - 1) * pageSize
      //   const end = start + pageSize
      //   return this.currentWarningList.slice(start, end)
      // },
      // total () {
      //   return this.currentWarningList.length
      // }
    },

    watch: {
      projectId () {
        this.currentPage = 1
        this.getWarning()
        this.resetData()
      }
    },

    methods: {
      ...mapActions([
        'getWarningList',
        'updateWarning',
        'getWarningByGagi'
      ]),
      async handleRead () {
        try {
          this.loadingRead = true
          const ids = this.multipleSelection.map(item => item.id)
          const idsFail = await this.updateWarning({ ids, projectId: this.projectId })
          if (idsFail && idsFail.length) {
            const rows = this.tableData.map((row, index) => idsFail.indexOf(row.id) > -1 ? index + 1 : '').filter(row => !!row)
            this.$notify({
              type: 'success',
              title: '成功',
              message: `第 ${rows.join(', ')} 行告警标记失败。`
            })
          } else {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '标记成功'
            })
          }
        } finally {
          this.$refs.multipleTable.clearSelection()
          this.loadingRead = false
        }
      },
      // 更改设备列表选中项
      handleSelectionChange (val) {
        this.multipleSelection = val
      },
      // 分页
      handleSizeChange (val) {
        this.pageSize = val
        this.getWarning()
      },
      handleCurrentChange (val) {
        this.currentPage = val
        this.getWarning()
      },
      // 切换项目，初始化数据
      resetData () {
        // 初始化筛选条件
        this.deviceName = ''
        this.startTime = ''
        this.endTime = ''
        this.stateNumber = ''
        // 初始化分页
        this.currentPage = 1
        this.pageSize = 10
      },
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.projectId, funName)
      },
      // 分页过滤数据
      async getWarning () {
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          const { currentPage, pageSize, projectId, deviceName, stateNumber } = this
          if (this.startTime === null) this.startTime = ''
          if (this.endTime === null) this.endTime = ''
          const data = await this.getWarningByGagi({ projectId, pageNo: currentPage, pageSize, name: deviceName, alertStatus: stateNumber, beginDate: this.startTime, endDate: this.endTime })
          this.tableData = data.records
          this.total = data.recordCount
        } finally {
          loadingInstance.close()
        }
      }
    },
    created () {
      this.getWarning()
    },
    filters: {
      time (val) {
        if (!val) return '---'
        return moment(val).format('YYYY-MM-DD, HH:mm:ss')
      },
      type (val) {
        return mapType[val] || '---'
      },
      level (val) {
        return mapLevel[val] || '---'
      },
      state (val) {
        return val === 5 ? 'el-icon-check' : 'el-icon-close'
      },
      solution (val) {
        let voltage = JSON.parse(val.alertText).voltage / 1000
        let num = val.alertType
        if (num === 5 && voltage < 5) {
          num = 7
        }
        return mapSolution[num] || '---'
      }
    }
  }
</script>

<style>
  .warn-list-top {
    margin-top: 10px;
    overflow:hidden;
  }
  .warn-list-tip {
    float: left;
  }
  .add-warn-btn {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
  .warn-divider {
    width: 100%;
    height: 1px;
    background-color: #409eff;
  }
  .device-list-operation {
    margin: 20px;
    height: 40px;
  }
  .device-list-operation .device-list-select {
    float:left;
  }
  .device-list-operation .deivce-list-btn {
    float:right;
  }
  .block {
    margin-top: 20px;
  }
  /* 设备弹出详情 */
  .device-modal-list {
    overflow: hidden;;
  }
  .device-modal-item {
    float: left;
    width: 30%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border: 1px solid #ddd;
    margin: 0 15px 15px  0;
  }
</style>



// WEBPACK FOOTER //
// src/views/warn/warn.vue