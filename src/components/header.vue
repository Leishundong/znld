<template>
  <div class="header" style="width:100%;height:60px;">
    <div class="logo">
      <h1 style="cursor: pointer;" @click="openHomePage" >智慧路灯云</h1>
    </div>
    <div class="itemName">
      <label>项目名：</label>
      <el-select
        filterable
        placeholder='搜索项目名'
        v-model="projectId">
        <el-option
          v-for="option in currentProjectList"
          :key="option.id"
          :label="option.name"
          :value="option.id">
          <span>{{ option.name }}</span>
          <span class="tagClass">{{ option.tag }}</span>
        </el-option>
      </el-select>
      <el-button @click="enterProject">进入项目</el-button>
    </div>
    <ul>
      <li v-if="$route.params.projectId && alerts > 0" @click="alertVisible=true">
        <el-badge :value="alerts" class="item">
          <el-tooltip effect="light" content="告警设备数" placement="bottom">
            <img src="../assets/images/bell-alt.png" class="bell-icon"/>
          </el-tooltip>
        </el-badge>
      </li>
      <li @click="openHomePage">
        <el-tooltip effect="light" content="回到首页" placement="bottom">
          <img src="../assets/images/back_home_icon.png" class="back-home"/>
        </el-tooltip>
      </li>
      <li v-if="isPermiss('CREATE_PROJECT')">
        <router-link style="color:#fff;" to="/main/add">新建项目</router-link>
      </li>
      <li>
        <el-dropdown @command="userDropdownClickEven">
          <span  class="el-dropdown-link" style="color:#fff;cursor: pointer;">
            {{ userNickname() }} <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" >
            <el-dropdown-item style="color:#409eff;" command="1">
              <i class="el-icon-edit" style="margin-right: 5px;"></i>
              修改用户信息
            </el-dropdown-item>
            <el-dropdown-item style="color:#409eff;" divided command="2">
              <img class="icon" src="../assets/images/change_password_icon.png">
              修改密码
            </el-dropdown-item>
            <el-dropdown-item v-if="roleName() !== 'ENDUSER' && roleName() !== 'FAE' && roleName() !== 'ROOT' && roleName() !== 'OAM' && roleName() !== 'TESTER'" divided command="3" style="color:#409eff;">
              <i class="el-icon-document"  style="margin-right: 5px;"></i>
              用户管理
            </el-dropdown-item>
            <el-dropdown-item v-if="superAdmin() || roleName() === 'OAM'" divided style="color:#409eff;">
              <i class="el-icon-setting"  style="margin-right: 5px;"></i>
              <a style="display:inline-block;width:80px;" href="/config">进入后台</a>
            </el-dropdown-item>
            <!-- 老化测试入口 -->
            <el-dropdown-item v-if="roleName() === 'TESTER'" style="color:#409eff;" divided command="5">
              <img class="icon" src="../assets/images/old_test_icon.png">
              老化测试
            </el-dropdown-item>
            <el-dropdown-item divided command="4">
              <span style="color:#409eff;"> <img class="icon" src="../assets/images/login_out_icon.png">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </li>
    </ul>

    <!--修改用户信息-->
    <el-dialog title="修改用户信息" :visible.sync="userInforDialogFormVisible">
      <el-form :model="infoForm" :rules="infoFormRules" ref="infoForm" label-width="80px" style="width: 300px;" >
        <el-form-item label="修改昵称" prop="nickname">
          <el-input v-model="infoForm.nickname"  auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userInforDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateInfo" :loading="loadingInfo">确 定</el-button>
      </div>
    </el-dialog>

    <!-- start 修改密码 -->
    <el-dialog title="修改密码" :visible.sync="passwordDialogFormVisible">
      <el-form :model="passwordform" :rules="passwordRules" ref="passwordform" label-width="80px" style="width: 300px;" >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordform.oldPassword" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordform.newPassword" type="password" placeholder="最少6位" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="passwordform.checkPass" type="password" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdatePassword" :loading="loadingPassword">确 定</el-button>
      </div>
    </el-dialog>
    <!-- end 修改密码 -->

    <!-- 告警列表 -->
    <el-dialog title="告警设备列表" width="30%" :visible.sync="alertVisible">
      <el-card 
        v-for="(item, index) in tableData" 
        :key="index" 
        shadow="always"
        body-style="padding:10px;cursor:pointer">
        <div @click="getAlertInfo(item.id, item.name)">
          <div>名称： {{ item.name }} <span style="float:right;">sn号： {{ item.snHexadecimal }}</span></div>
        </div>
      </el-card>
      <!-- start 分页 -->
      <div class="block">
        <el-pagination
          v-if="alerts > 10"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizeGroup"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="alerts">
        </el-pagination>
      </div>
      <!-- end 分页 -->
    </el-dialog>

    <!-- 告警内容 -->
    <el-dialog :title="alertDevice" width="30%" :visible.sync="alertInfoVisible" @close="reset()">
      <div v-if="isPermiss('OPERAT_DEVICE_DISPOSE') && total" style="margin-top:-20px;margin-bottom: 10px;text-align: right;">
        <el-button type="primary" size="small" @click="handleDevice"> 处理设备 </el-button>
      </div>
      <el-card 
        v-for="(item, index) in alertsInfo" 
        :key="index" 
        shadow="always"
        body-style="padding:10px;">
          <el-alert
            :title="item | type"
            :type="item.alertStatus | state"
            :description="item.dataStr"
            :closable="false"
            show-icon>
          </el-alert>
      </el-card>
      <!-- start 分页 -->
      <div class="block">
        <el-pagination
          v-if="total>6"
          @size-change="infoSizeChange"
          @current-change="infoCurrentChange"
          :current-page="infoPage"
          :page-size="infoPageSize"
          :page-sizes="infoPageSizeGroup"
          layout="total, sizes, prev, pager, next"
          :total="total">
        </el-pagination>
        <div v-else-if="!total">设备运行正常，暂无告警数据！</div>
      </div>
      <!-- end 分页 -->
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import moment from 'moment'
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
  const mapState = {
    1: 'warning',
    2: 'warning',
    5: 'info'
  }

  export default {
    data () {
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.passwordform.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      return {
        projectId: '',
        userInforDialogFormVisible: false,
        infoForm: {
          nickname: ''
        },
        infoFormRules: {
          nickname: [
            { required: true, message: '请输入昵称' },
            { max: 16, message: '长度不能大于 16 个字符' }
          ]
        },
        passwordDialogFormVisible: false,
        alertVisible: false,
        alertInfoVisible: false,
        passwordform: {
          oldPassword: '',
          newPassword: '',
          checkPass: ''
        },
        passwordRules: {
          oldPassword: [
            { required: true, message: '请输入旧密码' },
            { min: 6, message: '旧密码最少6位', trigger: 'blur' }
          ],
          newPassword: [
            { required: true, message: '请输入新密码' },
            { min: 6, message: '新密码最少6位', trigger: 'blur' }
          ],
          checkPass: [
            { required: true, message: '请再次输入密码' },
            { validator: validatePass2, trigger: 'blur' }
          ]
        },
        loadingPassword: false,
        loadingInfo: false,
        // 告警设备数
        alerts: '',
        alertsData: [],
        // 分页
        pageSize: 10,
        pageSizeGroup: [10, 20, 50, 100, 200],
        currentPage: 1,
        infoPageSize: 6,
        infoPage: 1,
        infoPageSizeGroup: [6, 10, 15, 30, 100],
        // 告警设备
        alertDevice: '',
        alertsInfo: [],
        total: 0,
        deviceId: '',
        deviceName: ''
      }
    },

    computed: {
      ...mapGetters([
        'projectList',
        'deviceList',
        'userNickname',
        'superAdmin',
        'roleName',
        'isPermissByFunName'
      ]),
      currentProjectList () {
        return this.projectList()
      },
      currentDeviceList () {
        return this.deviceList({ projectId: this.projectId })
      },
      tableData () {
        const { currentPage, pageSize, alertsData } = this
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return alertsData.slice(start, end)
      }
    },

    methods: {
      ...mapActions([
        'getProjectList',
        'getDeviceList',
        'getStrategyList',
        'getGroupList',
        'getStatisticCount',
        'updatePassword',
        'updateSelfInfo',
        'logout',
        'getUserList',
        'getWarningList',
        'getProject',
        'getDeviceByAlerts',
        'getAlertsInfoById',
        'disposeDevice'
      ]),
      // 更改用户信息
      handleUpdateInfo () {
        this.$refs.infoForm.validate(async (valid) => {
          if (!valid) return
          try {
            this.loadingInfo = true
            await this.updateSelfInfo(this.infoForm)
            this.$notify({
              type: 'success',
              title: '成功',
              message: '修改成功'
            })
            this.userInforDialogFormVisible = false
          } finally {
            this.loadingInfo = false
          }
        })
      },
      // 进入项目，保持当前tab
      async enterProject () {
        const { projectId } = this
        if (!projectId) {
          this.$notify({
            title: '警告',
            message: '请选择项目',
            type: 'warning'
          })
          return
        }
        const promises = [
          this.getDeviceList({ projectId }),
          this.getProject({ projectId }),
          this.getStrategyList({ projectId }),
          this.getGroupList({ projectId }),
          this.getStatisticCount({ projectId }),
          this.getUserList({ projectId })
        ]
        let loading = null
        try {
          loading = this.$loading({
            lock: true
          })
          await Promise.all(promises)
          if (this.$route.path.indexOf('main') !== -1) {
            this.$router.push(`/${this.projectId}/app/device/map`)
          } else {
            let pathItem = this.$route.path.split('/')
            pathItem[1] = this.projectId
            this.$router.push(pathItem.join('/'))
          }
        } finally {
          this.getAlerting()
          sessionStorage.setItem('projectId', this.projectId)
          if (loading) loading.close()
        }
      },
      openHomePage () {
        this.$router.replace({ name: 'home' })
      },
      userDropdownClickEven (command) {
        if (command === '1') {
          this.infoForm.nickname = this.userNickname()
          this.userInforDialogFormVisible = true
        } else if (command === '2') {
          this.passwordDialogFormVisible = true
        } else if (command === '3') {
          this.$router.replace({ name: 'userManage' })
        } else if (command === '4') {
          this.handleLogout()
        } else if (command === '5') {
          this.$router.replace({ name: 'aging' })
        }
      },
      // 退出登录
      handleLogout () {
        this.$confirm('确认退出登录?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          return this.logout()
        })
        .then(() => {
          this.$router.replace({ name: 'login' })
          this.$nextTick(() => {
            window.location.reload()
          })
        })
        .catch(() => {
        })
      },
      // 修改密码
      handleUpdatePassword () {
        this.$refs.passwordform.validate(async (valid) => {
          if (!valid) return
          try {
            this.loadingPassword = true
            await this.updatePassword(this.passwordform)
            this.passwordDialogFormVisible = false
            this.$notify({
              type: 'success',
              title: '成功',
              message: '密码修改成功！'
            })
            this.passwordform.oldPassword = ''
            this.passwordform.newPassword = ''
            this.$router.push({name: 'login'})
          } finally {
            this.loadingPassword = false
          }
        })
      },
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.projectId, funName)
      },
      // 获取告警设备
      async getAlerting () {
        const params = {}
        params.projectId = this.projectId
        params.statusType = 'alert'
        params.isDisabled = true
        const data = await this.getDeviceByAlerts(params)
        this.alerts = data.length
        this.alertsData = data
      },
      // 获取设备告警内容
      async getAlertInfo (id, name) {
        this.deviceId = id
        this.deviceName = name
        this.alertInfoVisible = true
        this.alertDevice = `${name} 告警内容`
        const data = await this.getAlertsInfoById({ deviceId: id, pageNo: this.infoPage, pageSize: this.infoPageSize, isRead: '' })
        this.alertsInfo = data.records
        this.total = data.recordCount
      },
      // 分页
      handleSizeChange (val) {
        this.pageSize = val
      },
      handleCurrentChange (val) {
        this.currentPage = val
      },
      // 分页
      infoSizeChange (val) {
        this.infoPageSize = val
        this.getAlertInfo(this.deviceId, this.deviceName)
      },
      infoCurrentChange (val) {
        this.infoPage = val
        this.getAlertInfo(this.deviceId, this.deviceName)
      },
      // 处理设备
      handleDevice () {
        this.$confirm('确认将该设备设置为不告警?', '操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.changeDeviceAlert()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消操作'
          })
        })
      },
      async changeDeviceAlert () {
        await this.disposeDevice(this.deviceId)
        this.$notify({
          type: 'success',
          title: '成功',
          message: '处理成功！'
        })
        this.getAlertInfo(this.deviceId, this.deviceName)
      },
      reset () {
        this.infoPage = 1
      }
    },
    filters: {
      time (val) {
        if (!val) return '---'
        return moment(val).format('YYYY-MM-DD, HH:mm:ss')
      },
      type (val) {
        if (!val) return '---'
        let time = val.createdAt
        return `${mapType[val.alertType]} ${moment(time).format('YYYY-MM-DD, HH:mm:ss')}` || '---'
      },
      level (val) {
        return mapLevel[val] || '---'
      },
      state (val) {
        return mapState[val] || '---'
      }
    },
    watch: {
      projectId () {
        this.pageSize = 10
        this.currentPage = 1
        this.infoPageSize = 6
        this.infoPage = 1
      }
    },
    created () {
      // 分页取数据
      this.getProjectList({ pageNo: 1, pageSize: 1000, queryParam: '' })
      this.projectId = this.$route.params.projectId || ''
      if (this.projectId) this.getAlerting()
    }
  }
</script>

<style lang="stylus" scoped>
  .icon
    width:16px
    vertical-align: middle
    margin-top: -5px
    margin-right: 5px
  .header
    background: #409EFF
    padding: 0 20px
    & > div
      float: left;color: #fff
    & > div + div
      padding-top: 10px
      padding-left: 30px
    h1
      margin: 0
      line-height: 60px
      font-weight: normal
      font-size: 20px
    & > ul
      float: right
    & > ul
      li
        float: left
        list-style: none
        margin-left: 20px
        color: #fff
    .enter-project
      width: 84px
      height: 24px
      background-color: #fff
      color: #409EFF;border: 0px
      padding-left: 10px
      padding-right: 10px
      margin-left: 15px
      cursor: pointer
      border-radius: 3px
    .enter-project:hover
      color: #409EFF
      background-color: #ecf5ff
    .back-home
      width: 25px
      cursor: pointer
    .bell-icon
      width: 25px
      cursor pointer
    .header-define
      .dialog-footer
        margin-top: -40px
        margin-left: 80px
        text-align: left
  .tagClass
    margin-left: 20px;
    color: #fff;
    background: #409EFF;
    border-radius: 5px;
</style>



// WEBPACK FOOTER //
// src/components/header.vue