<template>
  <div class="strategy-table">
    <el-row type="flex" justify="space-between" align="middle" class="border-bottom pr20">
      <h2>策略列表</h2>
      <el-button type="primary" @click="handleStrategyAdd" v-if="isPermiss('CREATE_MODIFY_STRATEGY')">新建策略</el-button>
    </el-row>

    <!-- start table -->
    <el-table
      v-loading="loadingTable"
      :data="tableData"
      style="width: 100%;scroll:hidden;margin-bottom: 20px;">
      <el-table-column
        label="策略名"
        width="380">
        <template slot-scope="scope" >
          <span >{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="智能功率"
        width="100">
        <template slot-scope="scope">
          <el-tooltip content="开启智能功率" placement="top-start" v-if="scope.row.isLowerLedControl">
            <img :src="imgLowerLedControl" class="strategy-identify-icons power" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="光控"
        width="70">
        <template slot-scope="scope">
          <el-tooltip content="开启光控" placement="top-start" v-if="scope.row.isLightControl">
            <img :src="imgLightControl" class="strategy-identify-icons light" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="人流控"
        width="70">
        <template slot-scope="scope">
          <span v-if="scope.row.isTrafficControl">开启</span>
          <span v-else>关闭</span>
        </template>
      </el-table-column>
      <el-table-column
        label="开始时间"
        width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.strategyTimes | getStarTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="截止时间"
        width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.offtime}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | time }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="最后修改时间"
        min-width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | time }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isPermiss('CREATE_MODIFY_STRATEGY')"
        fixed="right"
        label="操作"
        width="200">
        <template slot-scope="scope" >
          <el-button v-if="isPermiss('CREATE_MODIFY_STRATEGY')" size="small" type="text" @click="handleStrategyEdit(scope.row)"> 编辑 </el-button>
          <el-button v-if="isPermiss('DELETE_STRATEGY')" size="small" type="text" @click="handleStrategyDestroy(scope.row)"> 删除 </el-button>
          <el-button v-if="isPermiss('CREATE_MODIFY_STRATEGY')" size="small" type="text" @click="handleStrategyCopy(scope.row)"> 复制新增 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- end table -->

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

    <!-- start 策略表单dialog -->
    <el-dialog :title="dialogStrategyFormTitle" :visible.sync="dialogStrategyFormVisible">
      <app-strategy-form v-model="strategyForm" :loading="loadingSubmit" :isEdit="true" @submit="submitForm"></app-strategy-form>
    </el-dialog>
    <!-- end 策略表单dialog -->
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import moment from 'moment'
  // import { getSunRiseTimeAndSunDownTime } from '../../utils/time'
  import AppStrategyForm from './comps/formStrategy'
  import imgLightControl from 'assets/images/strategy/light-controll-icon.png'
  import imgLowerLedControl from 'assets/images/strategy/intelligent-power-icon.png'

  export default {
    data () {
      return {
        // 图片
        imgLightControl,
        imgLowerLedControl,
        dialogStrategyFormTitle: '策略信息',
        dialogStrategyFormVisible: false,
        strategyForm: null,
        // 分页
        pageSize: 10,
        pageSizeGroup: [10, 20, 50, 100, 200],
        currentPage: 1,
        // 选中
        selectedRow: null,
        // 行为
        handleSubmitAction: null,
        loadingTable: false,
        loadingSubmit: false
      }
    },

    computed: {
      ...mapGetters([
        'strategyList',
        'authManager',
        'project',
        'roleName',
        'isPermissByFunName'
      ]),
      currentProjectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      currentStrategyList () {
        return this.strategyList({ projectId: this.currentProjectId })
      },
      tableData () {
        const { currentPage, pageSize, currentStrategyList } = this
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return currentStrategyList.slice(start, end)
      },
      total () {
        return this.currentStrategyList.length
      },
      // 获取项目信息
      getProjectInfor () {
        return this.project(this.currentProjectId)
      }
    },
    methods: {
      ...mapActions([
        'getStrategyList',
        'createStrategy',
        'updateStrategy',
        'destroyStrategy',
        'getProject'
      ]),
      // 删除策略
      handleStrategyDestroy (row) {
        this.$confirm('此操作将永久删除该策略, 是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          try {
            this.loadingTable = true
            await this.destroyStrategy({ strategyId: row.id })
            this.$notify({
              type: 'success',
              title: '成功',
              message: '删除成功'
            })
          } finally {
            this.loadingTable = false
          }
        })
        .catch(() => {
        })
      },
      // 新增策略
      handleStrategyAdd () {
        this.selectedRow = null
        this.strategyForm = null
        this.dialogStrategyFormTitle = '新建策略'
        this.dialogStrategyFormVisible = true
        this.handleSubmitAction = this.createStrategy
      },
      // 复制策略
      handleStrategyCopy (row) {
        this.selectedRow = row
        this.strategyForm = Object.assign({}, row)
        this.dialogStrategyFormTitle = '新建策略'
        this.dialogStrategyFormVisible = true
        this.handleSubmitAction = this.createStrategy
      },
      // 编辑策略
      handleStrategyEdit (row) {
        this.selectedRow = row
        this.strategyForm = Object.assign({}, row)
        this.dialogStrategyFormTitle = '策略信息'
        this.dialogStrategyFormVisible = true
        this.handleSubmitAction = this.updateStrategy
      },
      // 确认提交，区分 新增 和 编辑
      before (form) {
        const params = Object.assign({}, form)
        if (this.dialogStrategyFormTitle === '新建策略') {
          params.projectId = this.currentProjectId
        } else if (this.dialogStrategyFormTitle === '策略信息') {
          params.id = this.selectedRow.id
        }
        return params
      },
      async submitForm (formData) {
        try {
          this.loadingSubmit = true
          const params = this.before(formData)
          await this.handleSubmitAction(params)
          this.dialogStrategyFormVisible = false
          this.$notify({
            type: 'success',
            title: '成功',
            message: '提交成功'
          })
        } finally {
          this.loadingSubmit = false
        }
      },
      // 分页
      handleSizeChange (val) {
        this.pageSize = val
      },
      handleCurrentChange (val) {
        this.currentPage = val
      },
      // 切换项目，初始化数据
      resetData () {
        // 初始化筛选条件
        // 初始化分页
        this.currentPage = 1
        this.pageSize = 10
      },
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.currentProjectId, funName)
      }
    },
    watch: {
      currentProjectId () {
        this.resetData()
        // 重新调取项目接口
        // this.getProject({projectId: this.currentProjectId})
      }
    },
    activated () {
      if (this.total === 0) {
        this.handleStrategyAdd()
      }
    },
    mounted () {
      this.getProject({projectId: this.currentProjectId})
    },
    filters: {
      time (val) {
        if (!val) return '---'
        return moment(val).format('YYYY-MM-DD, HH:mm:ss')
      },
      // 获取策略的开始时间
      getStarTime (val) {
        if (val.length < 1) {
          return '--'
        }
        return val[0].time
      }
    },

    components: {
      AppStrategyForm
    }
  }
</script>

<style scoped>
  .strategy-identify-icons {
    vertical-align: middle;
    margin-left: 5px;
  }

  .strategy-identify-icons.light {
    width: 25px;
    height: 25px;
  }

  .strategy-identify-icons.power{
    width: 17px;
    height: 17px;
  }

  .pr20 {
    padding-right: 20px;
  }

  .border-bottom {
    border-bottom: 1px solid #409eff;
  }
  .subTitle {
    font-size: 16px;
    color: #1890ff;
  }
</style>



// WEBPACK FOOTER //
// src/views/strategy/strategy.vue