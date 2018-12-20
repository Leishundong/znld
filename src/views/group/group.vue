<template>
  <div class="group-wrap">
    <el-container>
      <el-aside width="30%" style="min-width:300px">
        <div class="group-left-list" >
          <div class="group-title">
            <span style="font-size: 17px;">分组列表</span>
            <span v-if="isPermiss('MANAGER_PROJECT_GROUP')" style="font-size: 17px;color:#1890ff;cursor: pointer;" @click="handleAddGroup">添加</span>
          </div>
          <ul class="group-list">
            <li class="group-left-list-item" :class="{active:   currentGroup.name === '全部'}">
              <span @click="currentGroup.id = '';currentGroup.name = '全部'">全部</span>
              <a class="el-icon-arrow-right right-icon" v-show="currentGroup.name === '全部'"></a>
            </li>
            <li class="group-left-list-item" :class="{active:  currentGroup.name === '未分组'}">
              <span @click="currentGroup.id = '0';currentGroup.name = '未分组'">未分组</span>
              <a class="el-icon-arrow-right right-icon" v-show="currentGroup.name === '未分组'"></a>
            </li>
            <li class="group-left-list-item" v-for="item in getProjectGroupListByCurrentPage" :key="item.id" :class="{active:  currentGroup.name === item.name}">
              <span @click="getGroupDevices(item)">{{ item.name}}</span>
              <a class="el-icon-arrow-right right-icon" v-show="currentGroup.name === item.name"></a>
              <el-tooltip effect="light" content="编辑分组" placement="bottom">
                <a v-if="isPermiss('MANAGER_PROJECT_GROUP')" class="icon el-icon-edit-outline" @click="handleEditGroup(item)"></a>
              </el-tooltip>
              <a v-if="isPermiss('MANAGER_PROJECT_GROUP')" @click="confimDeleteGroup();selected=item;">删除</a>
              <!-- <el-tooltip effect="light" content="查看应用策略" placement="bottom">
                <a class="icon el-icon-tickets" @click="checkStrategy(item.id)"></a>
              </el-tooltip> -->
            </li>
          </ul>
          <el-pagination v-if="currentGroupList.length!==0" @current-change="handleCurrentGroupChange" small layout="prev, pager, next" :total="currentGroupList.length" :current-page="currentGroupPage" :page-size="13">
          </el-pagination>
          <div v-if="currentGroupList.length==0" style="text-align: center;margin-top: 30px;">
            <img src="../../assets/images/none_data_img.png" style="width: 50%;"/>
            <div v-if="isPermiss('MANAGER_PROJECT_GROUP')" @click="handleAddGroup" >暂无分组</div>
            <div v-if="isPermiss('MANAGER_PROJECT_GROUP')" style="color: #1890ff;cursor: pointer;" @click="handleAddGroup" >请新建分组</div>
          </div>
        </div>
      </el-aside>
      <el-main>
        <div class="group-right-main">
          <div class="group-main-title">
            <span style="font-size: 17px;">当前所在分组：{{ currentGroup.name }}</span>
            <span style="margin-left:10px;" v-show="currentGroup.id && currentGroup.id !== '0'">
              <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" size="small" type="success" @click="changeDeviceOn('1')">开灯</el-button>
              <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" size="small" type="success" @click="changeDeviceOff('2')">关灯</el-button>
              <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" size="small" type="success" @click="adjustLightBtn">调光</el-button>
              <el-button size="small" icon="el-icon-tickets" type="success" @click="checkStrategy(currentGroup.id)">查看策略</el-button>
            </span>
            <div style="float: right" v-show="isPermiss('ISSUED_STRATEGY_AND_DEVICE_PARAMS')&&currentGroup.id&& currentGroup.id !== '0'">
              <el-select v-model="toStrategyId" placeholder="请选择策略" style="margin-right: 10px;">
                <el-option
                  v-for="item in currentStrategyList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
              <el-button style="margin-top:6px;" type="primary" @click="handleSetStrategy" :loading="loadingStrategy">下发策略</el-button>
              <el-button v-if="isPermiss('CREATE_MODIFY_STRATEGY')" type="success" style="margin-left: 15px;" @click="addStrategy">新建策略</el-button>
            </div>
          </div>
          <div class="group-select-wrap">
            <div class="group-select-input">
              <label>筛选关键字：</label>
              <el-input placeholder="请输入内容" v-model="filterGroupName"></el-input>
            </div>

            <div v-if="isPermiss('MOVE_GROUP_DEVICE')" class="group-move-wrap">
              <label>移动到：</label>
              <el-select v-model="toGroupId" placeholder="筛选分组(默认未分组)">
                <el-option :key="0" label="未分组" :value="0"></el-option>
                <el-option
                  v-for="item in currentGroupList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
              <el-button type="success" style="margin-left: 15px;" @click="handleSetGroup" :loading="loadingMove" :disabled="!multipleSelection.length">确定移动</el-button>
            </div>
          </div>
          <div v-if="tableData.length==0" style="text-align: center;margin-top: 10%;">
            <img src="../../assets/images/none_data_img.png" style="width: 200px;"/>
            <div>暂无设备</div>
            <template v-if="currentGroup.name !== '全部'">
              <div>请移动设备到该分组</div>
            </template>
            <template v-else>
              <div style="color: #1890ff;cursor: pointer;" @click="toProject()">
                请添加设备
              </div>
            </template>
          </div>
          <el-table
            ref="multipleTable"
            :data="tableData"
            tooltip-effect="dark"
            style="width: 100%"
            max-height="560"
            @selection-change="handleSelectionChange"
            v-if="tableData.length!==0">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              label="设备名"
              prop="name"
              sortable
              width="200">
            </el-table-column>
            <el-table-column
              label="sn号"
              prop="snHex"
              sortable
              width="200">
            </el-table-column>
            <el-table-column
              label="更新时间"
              sortable
              min-width="200">
              <template slot-scope="scope">
                <span>{{ scope.row.updateTime | time }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="tableData.length!==0"
            small
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pageSizeGroup"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
        <!--分组信息-->
        <el-dialog :title="title" :visible.sync="groupInforDialogFormVisible" @close="resetGroupInforForm()">
          <el-form :model="groupFrom" :rules="addGroupRules" ref="groupFrom" label-width="80px" style="width: 300px;" >
            <el-form-item label="分组名" prop="name">
              <el-input v-model="groupFrom.name"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input type="textarea" v-model="groupFrom.remark"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitGroupFrom" :loading="loadingForm" >确 定 </el-button>
          </div>
        </el-dialog>
        <!-- start 策略表单dialog -->
        <el-dialog :title="dialogStrategyFormTitle" :visible.sync="dialogStrategyFormVisible">
          <app-strategy-form v-model="strategyForm" :loading="loadingSubmit" :isEdit="isEdit" @submit="submitForm"></app-strategy-form>
        </el-dialog>
        <!-- end 策略表单dialog -->
      </el-main>
    </el-container>
    <!-- 调光 -->
    <el-dialog
        title="调光"
        :visible.sync="dialogBrightness"
        width="30%">
        <div class="block">
          <el-slider
            v-model="brightness"
            show-input>
          </el-slider>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogBrightness = false">取 消</el-button>
          <el-button type="primary" @click="adjustLight">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script >
  import { mapActions, mapGetters } from 'vuex'
  import moment from 'moment'
  import { Loading } from 'element-ui'
  import http from 'http'
  import AppStrategyForm from '../strategy/comps/formStrategy'
  export default {
    data () {
      return {
        multipleSelection: [],
        groupInforDialogFormVisible: false,
        title: '添加分组',
        groupFrom: {
          name: '',
          remark: ''
        },
        addGroupRules: {
          name: [
            { required: true, message: '请输入分组名', trigger: 'blur' },
            { min: 1, max: 16, message: '长度最多为16个字符', trigger: 'blur' }
          ]
        },
        handleFormAction: null,
        // 分组的当前页码
        currentGroupPage: 1,
        // 分组筛选数据
        filterGroupName: '',
        // 分组选中项
        toGroupId: '',
        toStrategyId: '',
        // 选中的分组对象
        selected: null,
        currentGroup: {
          id: '',
          name: '全部'
        },
        // 分页
        pageSize: 10,
        pageSizeGroup: [10, 20, 50, 100, 200],
        currentPage: 1,
        // 表单状态
        loadingForm: false,
        loadingMove: false,
        loadingStrategy: false,
        dialogStrategyFormVisible: false,
        strategyForm: null,
        loadingSubmit: false,
        isEdit: false,
        dialogStrategyFormTitle: '策略详情',
        // 亮度
        brightness: 0,
        dialogBrightness: false
      }
    },

    computed: {
      ...mapGetters([
        'strategyList',
        'deviceList',
        'groupList',
        'group',
        // 'deviceIdListInGroup',
        'isPermissByFunName'
      ]),
      currentProjectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      currentGroupList () {
        return this.groupList({ projectId: this.currentProjectId })
      },
      // 根据分页获取该项目下的分组列表
      getProjectGroupListByCurrentPage () {
        let start = (this.currentGroupPage - 1) * 13
        let end = start + 13
        return this.groupList({ projectId: this.currentProjectId }).slice(start, end)
      },
      currentDeviceList () {
        const { currentGroup, filterGroupName } = this
        return this.deviceList({ projectId: this.currentProjectId, groupId: currentGroup.id, name: filterGroupName, isDisable: false })
      },
      currentStrategyList () {
        return this.strategyList({ projectId: this.currentProjectId })
      },
      tableData () {
        const { currentPage, pageSize, currentDeviceList } = this
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return currentDeviceList.slice(start, end)
      },
      total () {
        return this.currentDeviceList.length
      }
    },
    watch: {
      currentProjectId () {
        // 初始化数据
        this.currentGroup.id = ''
        this.currentGroup.name = '全部'
        this.groupFrom.name = ''
        this.groupFrom.remark = ''
        this.toStrategyId = ''
        this.toGroupId = ''
        this.currentPage = 1
        this.currentGroupPage = 1
      }
    },
    methods: {
      ...mapActions([
        'getDeviceList',
        'getGroupList',
        'getStrategyList',
        'createGroup',
        'updateGroup',
        'destroyGroup',
        'updateDeviceInGroup',
        'updateGroupStrategy',
        'getDeviceIdsInGroup',
        'updataMoveDevice',
        'createStrategy',
        // 对分组进行开关、调光
        'updateDimmeInGroup',
        'getProject'
      ]),
      toProject () {
        this.$router.push({name: 'project'})
      },
      // 重置表单
      resetGroupInforForm () {
        this.$refs.groupFrom.resetFields()
      },
      handleSelectionChange (val) {
        this.multipleSelection = val
      },
      handleSizeChange (val) {
        this.pageSize = val
      },
      handleCurrentChange (val) {
        this.currentPage = val
      },
      // 分组分页
      handleCurrentGroupChange (val) {
        this.currentGroupPage = val
      },
      handleAddGroup () {
        this.handleFormAction = this.createGroup
        this.groupFrom = {
          projectId: this.currentProjectId,
          name: '',
          remark: ''
        }
        this.groupInforDialogFormVisible = true
        this.title = '添加分组'
      },
      handleEditGroup (item) {
        this.handleFormAction = this.updateGroup
        this.groupFrom = {
          id: item.id,
          name: item.name,
          remark: item.remark
        }
        this.groupInforDialogFormVisible = true
        this.title = '编辑分组'
      },
      submitGroupFrom () {
        this.$refs.groupFrom.validate(async (valid) => {
          if (!valid) return false
          try {
            this.loadingForm = true
            await this.handleFormAction(this.groupFrom)
            this.$notify({
              title: '成功',
              message: '操作成功',
              type: 'success'
            })
            this.groupInforDialogFormVisible = false
          } finally {
            this.loadingForm = false
          }
        })
      },
      // 二次确认删除分组
      confimDeleteGroup () {
        this.$confirm('此操作将永久删除该分组, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleDestroyGroup()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 删除分组请求
      async handleDestroyGroup () {
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.destroyGroup({ groupId: this.selected.id })
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success'
          })
        } finally {
          loadingInstance.close()
        }
      },
      // 移动设备到其他分组的二次确认
      async handleSetGroup () {
        if (!this.toGroupId && this.toGroupId !== 0) {
          this.$notify({
            title: '提醒',
            message: '请选择分组',
            type: 'warning'
          })
          return
        }
        this.$confirm('确定将设备移动到该分组?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.moveGroupDevice()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 发起移动设备到其他分组的请求
      async moveGroupDevice () {
        try {
          this.loadingMove = true
          const deviceId = this.multipleSelection.map(item => item.id)
          let data = await this.updateDeviceInGroup({ projectId: this.currentProjectId, groupId: this.toGroupId, deviceId })
          if (data.success) {
            let newGroupName = this.group(this.toGroupId).name
            let params = {
              projectId: this.currentProjectId,
              newGroupName: newGroupName,
              newId: this.toGroupId,
              ids: deviceId
            }
            // 更新本地数据
            this.updataMoveDevice(params)
            this.$notify({
              title: '成功',
              message: '移动成功',
              type: 'success'
            })
          } else {
            this.$notify({
              title: '失败',
              message: '移动失败',
              type: 'warning'
            })
          }
        } finally {
          this.loadingMove = false
        }
      },
      // 下发分组的策略二次确认
      async handleSetStrategy () {
        if (!this.toStrategyId) {
          this.$notify({
            title: '提醒',
            message: '请选择策略',
            type: 'warning'
          })
          return
        }
        this.$confirm('确定对该分组下发策略?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.IssuedByStrategy()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 下发分组的策略请求
      async IssuedByStrategy () {
        try {
          this.loadingStrategy = true
          await this.updateGroupStrategy({ groupId: this.currentGroup.id, strategyId: this.toStrategyId })
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success'
          })
        } finally {
          this.loadingStrategy = false
        }
      },
      // 获取分组下的设备列表
      async getGroupDevices (item) {
        this.currentGroup.id = item.id
        this.currentGroup.name = item.name
        // let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        // try {
        //   await this.getDeviceIdsInGroup({projectId: this.currentProjectId, groupId: item.id})
        // } catch (e) {
        // } finally {
        //   loadingInstance.close()
        // }
      },
      // 查看分组的策略
      async checkStrategy (id) {
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          let infor = await http.group.getGroupStrategy({groupId: id})
          if (infor.hasOwnProperty('strategyId')) {
            infor.periods = infor.strategyTimes
            this.strategyForm = Object.assign({}, infor)
            this.dialogStrategyFormVisible = true
            this.isEdit = false
            this.dialogStrategyFormTitle = '策略详情'
          } else {
            this.$notify({
              title: '暂无',
              message: '该分组暂无应用的策略',
              type: 'success'
            })
          }
        } catch (e) {
        } finally {
          loadingInstance.close()
        }
      },
      // 新建策略
      addStrategy () {
        this.dialogStrategyFormVisible = true
        this.dialogStrategyFormTitle = '新建策略'
        this.strategyForm = null
        this.isEdit = true
      },
      // 新建策略请求
      async submitForm (formData) {
        try {
          this.loadingSubmit = true
          const params = Object.assign({}, formData)
          params.projectId = this.currentProjectId
          await this.createStrategy(params)
          this.dialogStrategyFormVisible = false
          this.$notify({
            type: 'success',
            title: '成功',
            message: '新建成功'
          })
        } finally {
          this.loadingSubmit = false
        }
      },
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.currentProjectId, funName)
      },
      // 开灯
      changeDeviceOn (state) {
        this.$confirm('此操作将对该分组里的设备发送开灯指令, 是否继续?', '开灯', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.changeDeviceOnFun(state)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消指令发送!'
          })
        })
      },
      async changeDeviceOnFun (state) {
        try {
          await this.updateDimmeInGroup({groupId: this.currentGroup.id, switchState: state})
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
        }
      },
      // 关灯
      changeDeviceOff (state) {
        this.$confirm('此操作将对该分组里的设备发送关灯指令, 是否继续?', '关灯', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.changeDeviceOffFun(state)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消指令发送!'
          })
        })
      },
      // 关灯请求
      async changeDeviceOffFun (state) {
        try {
          await this.updateDimmeInGroup({groupId: this.currentGroup.id, switchState: state})
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
        }
      },
      // 单灯调光按钮
      adjustLightBtn () {
        this.dialogBrightness = true
      },
      async adjustLight () {
        this.dialogBrightness = false
        try {
          await this.updateDimmeInGroup({groupId: this.currentGroup.id, switchState: '3', brightness: this.brightness})
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
        }
      }
    },
    components: {
      AppStrategyForm
    },
    created () {
      const promises = [
        this.getDeviceList({ projectId: this.currentProjectId }),
        this.getStrategyList({ projectId: this.currentProjectId }),
        this.getGroupList({ projectId: this.currentProjectId })
      ]
      try {
        Promise.all(promises)
      } catch (e) {
        console.log(e)
      }
    },
    mounted () {
      // 重新调取项目接口
      this.getProject({projectId: this.currentProjectId})
    },
    activated () {
      if (this.isPermiss('MANAGER_PROJECT_GROUP') && this.currentGroupList.length === 0) {
        this.handleAddGroup()
      } else {
        this.groupInforDialogFormVisible = false
      }
    },
    filters: {
      time (val) {
        if (!val) return '---'
        return moment(val).format('YYYY-MM-DD, HH:mm:ss')
      }
    }
  }
</script>
<style lang="less" scoped>
  .group-wrap {
    overflow: hidden;
    margin-top:15px;
  }
  .group-left-list {
    border: 1px solid #ddd;
    height: 800px;
    .group-title {
      font-size: 14px;
      padding: 0 20px;
      height: 53px;
      line-height: 53px;
      border-bottom: 1px solid #ddd;
      span+span {
        float: right;
        font-size: 12px;
      }
    }
    ul { 
      padding-left: 0;
      margin-top: 0;
    }
    li { 
      line-height: 34px;
      border-bottom: 1px solid #ddd;
      padding: 0 20px;
      span {
        width: 60%;
        height:30px;
        padding-top:5px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        word-break:keep-all;
        display:-moz-inline-box;
        display:inline-block; 
        cursor: pointer;
      }
      a {
        float: right;
        padding-top: 5px;
        margin-left: 6px;
        cursor: pointer;
      }
      .icon {
        margin-top: 12px;
        margin-left: 15px;
      }
      .right-icon {
        margin-top: 11px;
        margin-right: -15px;
        margin-left: 15px;
      }
    }
    &-item:hover {
      background-color: #ecf5ff;
    }
    &-item.active { 
      background-color: #ecf5ff;
    }
  } 
  /*内容区*/
  .group-right-main {
    padding-left: 20px;
    border: 1px solid #ddd;
    border-left:0;
    height:800px;
  }
  .group-main-title {
    padding: 1px 20px;
    line-height: 50px;
    border-bottom: 1px solid #ddd;
  }
  .group-select {
    &-wrap {
      padding: 20px;
      overflow: hidden;
    }
    &-input {
      float: left;
      width: 300px;
      label {
        float: left;
        line-height: 40px;
      }
      .el-input {
        width: 200px;
      }
    }
  }
  .group-move-wrap {
    float: right;
    margin-right: 15px;
  }
  .group-wrap .dialog-footer {
    text-align: left;
    margin-top: -40px;
    margin-left: 80px;
  }
  .el-main { 
    padding-top: 0px;
    padding-left: 0px;
  }
</style>



// WEBPACK FOOTER //
// src/views/group/group.vue