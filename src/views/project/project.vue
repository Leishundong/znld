<template>
  <div class="project-main">
    <el-form ref="getProjectInfor" name="form1" :model="getProjectInfor" :rules="projectInforRules" label-width="80px" size="small">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="getProjectInfor.name" style="width: 200px;" :disabled="!isTrue"></el-input>
        <el-switch
          style="margin-left:20px;"
          v-model="follow"
          @change="switchChange" 
          inactive-text="取消/无关注"
          active-text="关注"
          :active-value='1'
          :inactive-value='0'>
        </el-switch>
      </el-form-item>
      <el-form-item label="拥有者">
        <template slot-scope="scope" >
          <div class="identity-infor" v-html="getProjectInfor.ownerName"></div>
        </template>
      </el-form-item>
      <el-form-item label="身份">
        <template slot-scope="scope" >
          <div class="identity-infor" v-html="getRoleName(getProjectInfor.roleName)"></div>
        </template>
      </el-form-item>
      <!--<el-form-item label="默认亮度">-->
      <!--<el-input v-model="projectForm.brightness" :maxlength="3" style="width: 60px;" ></el-input>-->
      <!--<span>%</span>-->
      <!--</el-form-item>-->
      <el-form-item label="项目位置">
        <!-- <el-input v-model="getProjectInfor.location" style="width: 200px;" placeholder="无"></el-input> -->
        <!-- 省市区三级联动 -->
        <v-distpicker
          @selected="onSelected"
          :disabled="!isTrue"
          @province="changeProvince"
          @city="changeCity"
          @area="changeArea"
          :province="adCodeInfo.province" 
          :city="adCodeInfo.city" 
          :area="adCodeInfo.area">
        </v-distpicker>
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" v-model="getProjectInfor.remark" placeholder="无" :disabled="!isTrue"></el-input>
      </el-form-item>
      <el-form-item label="标签">
        <el-tag
          :key="index"
          v-for="(tag, index) in tags"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-if="inputVisible"
          v-model="inputValue"
          ref="saveTagInput"
          size="small"
          :maxlength="7"
          placeholder="最多7个字"
          @keyup.enter.native="handleInputConfirm"
          @blur="handleInputConfirm"
        >
        </el-input>
        <el-button v-else type="primary" class="button-new-tag" size="small" @click="showInput">添加</el-button>
      </el-form-item>
      <el-form-item label="参与人数">
        <template slot-scope="scope" >
          <span class="peopleNum" v-html="getProjectUserList.length"></span>
          <el-button type="primary" @click="peopleDialogTableVisible=true;" v-if="isPermiss('MANAGER_PROJECT_NUMBER')">管理人员</el-button>
        </template>
      </el-form-item>
      <el-form-item label="设备数量">
        <template slot-scope="scope" >
          <span class="devicesNum" v-html="getProjectDevicesList.length"></span>
          <el-button type="primary" @click="deviceDialogTableVisible=true;" v-if="isPermiss('MANAGER_PROJECT_DEVICE')">管理设备</el-button>
        </template>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" v-show="isPermiss('MODIFY_PROJECT_INFOR')">保存</el-button>
      </el-form-item>
    </el-form>
    <!--管理人员-->
    <el-dialog title="管理人员" :visible.sync="peopleDialogTableVisible">
      <div class="people-top">
        <el-button type="primary" class="add-people-btn" @click="addPeopleDialogVisible=true;userInfortitle='增加项���用户'">增加</el-button>
      </div>
      <el-table :data="getProjectUserList">
        <el-table-column property="username" label="用户名" ></el-table-column>
        <el-table-column prop="roleName" label="角色名" >
          <template slot-scope="scope">{{getRoleName(scope.row.roleName)}}</template>
        </el-table-column>
        <el-table-column  label="操作" >
          <template slot-scope="scope" >
            <a style="cursor: pointer;" @click="editProjectUser(scope.row.id,scope.row.username,scope.row.roleName);">编辑</a>
            <a style="cursor: pointer;" @click="confirmDeleteUser(scope.row.id)">删除</a>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--增加项目用户-->
    <el-dialog :title="userInfortitle" :visible.sync="addPeopleDialogVisible" @close="resetAddUserForm()">
      <add-user ref="addUser" v-bind:addPeopleDialogVisible="addPeopleDialogVisible"  v-on:closeAddUserDialog="closeAddUserDialog($event)"></add-user>
    </el-dialog>
    <!--编辑项目用户-->
    <el-dialog title="编辑项目用户" :visible.sync="editPeopleDialogVisible">
      <el-form ref="editPeopleInfor" :model="editPeopleInfor" label-width="80px" size="small">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editPeopleInfor.userName" style="width: 200px;" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="角色名" prop="roleName">
          <el-select v-model="editPeopleInfor.roleName">
            <el-option
              v-for="item in roles2"
              :key="item.fieldName"
              :label="item.name"
              :value="item.fieldName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="confirmEditUser()">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--管理设备-->
    <el-dialog title="管理设备" :visible.sync="deviceDialogTableVisible" width="850px">
      <div class="people-top">
        <el-button type="primary" class="add-people-btn" @click="addDeviceInfor()">增加</el-button>
        <el-button v-if="isPermiss('DELETE_PROJECT_DEVICE')" type="danger" class="delete-people-btn" @click="confirmDeleteDevices()">批量删除</el-button>
        <el-button v-if="isPermiss('DISABLE_DEVICE') && getProjectDevicesListByCurrentPage.length" type="success" class="delete-people-btn" @click="setDeviceEnable(true)">启用</el-button>
        <el-button v-if="isPermiss('DISABLE_DEVICE') && getProjectDevicesListByCurrentPage.length" type="warning" class="delete-people-btn" @click="setDeviceEnable(false)">停用</el-button>
        <el-dropdown class="add-people-btn" 
          v-loading="isloading" 
          element-loading-spinner="el-icon-loading">
          <el-button style="color:#fff;cursor: pointer;background: #409EFF">
            导入设备<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" >
            <el-dropdown-item style="color:#409eff;">
              <i class="el-icon-download" style="margin-right: 5px;"></i>
              <a style="display:inline-block;width:80px;" href="http://imgs.creekspring.com/%E7%BB%88%E7%AB%AF%E6%8E%A7%E5%88%B6%E5%99%A8%E6%A8%A1%E6%9D%BF.xlsx">下载模板</a>
            </el-dropdown-item>
            <el-dropdown-item divided style="color:#409eff;">
              <el-upload
                class="upload-demo"
                ref="upload"
                :action="uploadActionUrl"
                :headers="headers"
                :on-success="successAction"
                :on-error="errorAction"
                :before-upload="beforeUpload"
                :auto-upload="true">
                <i class="el-icon-upload" style="margin-right: 5px;"></i>
                上传Excel文件
              </el-upload>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <el-table :data="getProjectDevicesListByCurrentPage"  max-height="530" @selection-change="handleDeviceSelectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column property="name" label="设备名"  min-width="130"></el-table-column>
        <el-table-column property="snHex" label="SN号" width="130"></el-table-column>
        <el-table-column prop="isDisable" label="当前状态" width="130">
          <template slot-scope="scope">{{scope.row.isDisable? '停用':'正在使用'}}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template slot-scope="scope">{{time(scope.row.updateTime)}}</template>
        </el-table-column>
        <el-table-column  label="操作" width="150">
          <template slot-scope="scope" >
            <a v-if="isPermiss('MODIFY_DEVICE_INFOR')" style="cursor: pointer;" @click="handleClick(scope.row)">编辑</a>
            <a v-if="isPermiss('DELETE_PROJECT_DEVICE')" style="cursor: pointer;" @click="confirmDeleteDevice(scope.row.id,scope.row.isDisable)">删除</a>
            <a v-if="isPermiss('ISSUED_STRATEGY_AND_DEVICE_PARAMS')" style="cursor: pointer;" @click="updataDevicesParams(scope.row)">修改参数</a>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleCurrentChange" small layout="prev, pager, next" :total="getProjectDevicesList.length" :current-page="currentPage" :page-size="10"></el-pagination>
      <!--编辑设备名-->
      <el-dialog width="30%" title="编辑设备信息"  :visible.sync="editDevicesInnerVisible" @close="resetEditDeviceInforForm" append-to-body>
        <el-form ref="editDevice" :model="editDevice" :rules="editUserRule" label-width="80px" size="small">
          <el-form-item label="设备名"  prop="name">
            <el-input v-model="editDevice.name" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="设备经度" prop="lng">
            <el-input v-model="editDevice.lng" ></el-input>
          </el-form-item>
          <el-form-item label="设备纬度" prop="lat">
            <el-input v-model="editDevice.lat" ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="subimtEditDevicesInfor()">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!--添加设备-->
      <el-dialog width="30%" class="add-device-dialog" @close="resetAddManageForm()" :title="deviceInfortitle" :visible.sync="addDevicesInnerVisible" append-to-body>
        <add-manage ref="addManage" v-on:closeDialog="closeDeviceInforDialog($event)" v-bind:msg="deviceInfortitle" :add-devices-form="addDevicesForm"></add-manage>
      </el-dialog>
      <el-dialog title="验证用户" :visible.sync="passwordDialogFormVisible" @close="resetAddManageForm()" append-to-body>
        <el-form :model="passwordform" :rules="passwordRules" ref="passwordform" label-width="80px" style="width: 300px;" >
          <el-form-item label="账户密码" prop="password">
            <el-input v-model="passwordform.password" type="password" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="passwordDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleCommit">确 定</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
  import VDistpicker from 'v-distpicker'
  import { mapGetters, mapActions } from 'vuex'
  import moment from 'moment'
  import { Loading } from 'element-ui'
  import AddManage from './children/addManage'
  import AddUser from './children/addUser'
  // import { setLocalStorage, getLocalStorage } from 'tools/storage'
  export default {
    components: {
      AddUser,
      AddManage,
      VDistpicker
    },
    data () {
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
        currentPage: 1,
        // 项目用户角色组
        roles: [
          {
            fieldName: 'OWNER',
            name: '拥有者'
          },
          {
            fieldName: 'MANAGER',
            name: '协作管理员'
          },
          {
            fieldName: 'MEMBER',
            name: '一般成员'
          },
          {
            fieldName: 'GUEST',
            name: '只读成员'
          }
        ],
        // 编辑项目用户角色组
        roles2: [
          {
            fieldName: 'MANAGER',
            name: '协作管理员'
          },
          {
            fieldName: 'MEMBER',
            name: '一般成员'
          },
          {
            fieldName: 'GUEST',
            name: '只读成员'
          }
        ],
        editUserRule: {
          name: [
            { required: true, message: '请输入设备名称', trigger: 'blur' },
            { min: 1, max: 16, message: '长度最多到16个字符', trigger: 'blur' }
          ],
          lng: [
            { required: true, message: '请输入设备经度', trigger: 'blur' },
            { validator: checkLng, trigger: 'blur' }
          ],
          lat: [
            { required: true, message: '请输入设备纬度', trigger: 'blur' },
            { validator: checkLat, trigger: 'blur' }
          ]
        },
        peopleDialogTableVisible: false,
        peopleInnerVisible: false,
        addPeopleDialogVisible: false,
        deviceDialogTableVisible: false,
        addDevicesInnerVisible: false,
        editDevicesInnerVisible: false,
        passwordDialogFormVisible: false,
        addDevicesForm: {},
        userInfortitle: '增加项目用户',
        editPeopleDialogVisible: false,
        editPeopleInfor: {
          id: '',
          userName: '',
          roleName: ''
        },
        deviceInfortitle: '增加设备',
        // 设备列表选中项
        deviceMultipleSelection: [],
        editDevice: {},
        projectInforRules: {
          name: [
            { required: true, message: '请输入项目名称', trigger: 'blur' },
            { min: 1, max: 16, message: '长度最多为16个字符', trigger: 'blur' }
          ]
        },
        // 省市区信息
        adCodeInfo: {},
        isloading: false,
        // 匹配电池参数
        deviceParams: {},
        // 省市区判断: 为空则不能更改
        confirmFlag: true,
        inputVisible: false,
        inputValue: '',
        tags: {},
        // 关注项目
        follow: '',
        isTrue: false,
        passwordform: {
          password: ''
        },
        passwordRules: {
          password: [
            { required: true, message: '请输入密码' }
          ]
        }
      }
    },
    computed: {
      ...mapGetters([
        'userList',
        'project',
        'deviceList',
        'isPermissByFunName'
      ]),
      // 获取当前项目ID
      currentProjectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      // 获取项目信息
      getProjectInfor () {
        return this.project(this.currentProjectId)
      },
      // 获取项目用户列表
      getProjectUserList () {
        if (this.getProjectInfor.tag === '' || this.getProjectInfor.tag === undefined) {
          this.tags = {}
        } else if (this.getProjectInfor.tag.indexOf(',') > 0) {
          this.tags = this.getProjectInfor.tag.split(',')
        } else {
          this.tags = this.getProjectInfor.tag.split()
        }
        let location = this.project(this.currentProjectId).location
        let adInfo = {}
        if (location.includes('{')) { // 判断是否符合规则
          adInfo = JSON.parse(location)
        }
        this.adCodeInfo = adInfo
        this.follow = this.getProjectInfor.follow
        this.isTrue = (this.getProjectInfor.roleName === 'OWNER' || this.getProjectInfor.roleName === 'MANAGER')
        return this.userList({projectId: this.currentProjectId})
      },
      // 获取该项目下的所有设备列表
      getProjectDevicesList () {
        return this.deviceList({projectId: this.currentProjectId})
      },
      // 获取该项目下的所有设备列表
      getProjectDevicesListByCurrentPage () {
        let start = (this.currentPage - 1) * 10
        let end = start + 10
        return this.deviceList({projectId: this.currentProjectId}).slice(start, end)
      },
      headers () {
        return { Authorization: 'Bearer ' + this.$store.getters.userToken() }
      },
      uploadActionUrl () {
        return `/api/v2/solar-motes/activated-batch/${this.currentProjectId}`
      }
    },
    watch: {
      tableData (val) {
        // console.log(val)
      }
    },
    activated () {
      if (this.isPermiss('MANAGER_PROJECT_DEVICE') && this.getProjectDevicesList.length === 0) {
        this.deviceDialogTableVisible = true
      } else {
        this.deviceDialogTableVisible = false
      }
    },
    methods: {
      ...mapActions([
        'getUserList',
        'getDeviceList',
        'destroyUser',
        'updateProject',
        'updateDevice',
        'updateDeviceState',
        'destroyDevice',
        'updateUser',
        'getParams',
        'getProject',
        // 设置项目关注或者标签
        'updateTagOrFollow',
        // 批量删除设备
        'destroyDeviceByBatch'
      ]),
      // 重置添加用户表单
      resetAddUserForm () {
        this.$refs.addUser.resetForm()
      },
      // 重置编辑设备信息表单
      resetEditDeviceInforForm () {
        this.editDevice = {}
        this.$refs.editDevice.resetFields()
      },
      // 重置添加设备表单
      resetAddManageForm () {
        this.addDevicesForm = {}
        this.passwordform = {}
        this.$refs.addManage.resetForm()
      },
      // 计算某个用户是否有操作权限 by teming
      canOperateUser (roleName) {
        const map = {
          MANAGER: 1,
          MEMBER: 2,
          GUEST: 3
        }
        const selfRoleName = this.project(this.currentProjectId).roleName
        const selfLevel = map[selfRoleName]
        const compareLevel = map[roleName]
        return selfLevel < compareLevel
      },
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.currentProjectId, funName)
      },
      // 编辑设备信息弹出框
      handleClick (row) {
        this.editDevice.id = row.id
        this.editDevice.name = row.name
        this.editDevice.lng = row.lng
        this.editDevice.lat = row.lat
        this.editDevicesInnerVisible = true
      },
      // 当前分页
      handleCurrentChange (val) {
        this.currentPage = val
      },
      // 修改设备信息检验
      async subimtEditDevicesInfor () {
        this.$refs.editDevice.validate((valid) => {
          if (!valid) {
            return false
          } else {
            this.updataDevicesInfor()
            return true
          }
        })
      },
      // 修改设备信息请求
      async updataDevicesInfor () {
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.updateDevice(this.editDevice)
          this.$notify({
            type: 'success',
            title: '成功',
            message: '保存成功！'
          })
          this.editDevicesInnerVisible = false
        } catch (e) {
        } finally {
          loadingInstance.close()
        }
      },
      // 打开添加设备的弹出框
      addDeviceInfor () {
        this.addDevicesInnerVisible = true
        this.deviceInfortitle = '增加设备'
        this.addDevicesForm = {
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
      // 打开修改设备参数的弹出框
      updataDevicesParams (deviceParams) {
        this.addDevicesInnerVisible = true
        this.deviceInfortitle = '修改设备参数'
        // 深考贝, 防止用户撤销修改的对原数据影响
        this.addDevicesForm = JSON.parse(JSON.stringify(deviceParams))
        if (this.addDevicesForm.paramSettingMode === 1 && this.addDevicesForm.batteryVoltage === 12) {
          this.addDevicesForm.paramSettingMode = 0
        } else if (this.addDevicesForm.paramSettingMode === 1 && this.addDevicesForm.batteryVoltage === 24) {
          this.addDevicesForm.paramSettingMode = 1
        } else {
          this.addDevicesForm.paramSettingMode = 2
        }
        const batteryType = this.addDevicesForm.batteryType
        this.addDevicesForm.batteryType = batteryType
      },
      // 将时间戳格式化为制定样式
      time (val) {
        if (!val) return '---'
        return moment(val).format('YYYY-MM-DD, HH:mm:ss')
      },
      // 子组件调用父组件的关闭添加用户对话框
      closeAddUserDialog () {
        this.addPeopleDialogVisible = false
      },
      // 修改项目信息表单验证
      async onSubmit () {
        this.$refs.getProjectInfor.validate((valid) => {
          if (!valid) {
            return false
          } else {
            this.updataProjectInfor()
            return true
          }
        })
      },
      // 修改项目信息请求
      async updataProjectInfor () {
        if (!this.confirmFlag) {
          this.$notify({
            type: 'warning',
            title: '提示',
            message: '请选择正确的省市区！'
          })
          return false
        }
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          let location = JSON.stringify(this.adCodeInfo)
          await this.updateProject({ id: this.currentProjectId, name: this.getProjectInfor.name, location: location, remark: this.getProjectInfor.remark, adCode: this.adCodeInfo.adcode })
          this.$notify({
            type: 'success',
            title: '成功',
            message: '保存成功！'
          })
          this.getProject({projectId: this.currentProjectId})
        } catch (e) {
        } finally {
          loadingInstance.close()
        }
      },
      // 格式化角色名
      getRoleName (val) {
        let roleName = '无匹配角色名'
        this.roles.forEach(function (value, index, array) {
          if (val === value.fieldName) {
            roleName = value.name
          }
        })
        return roleName
      },
      // 更改设备列表选中项
      handleDeviceSelectionChange (val) {
        this.deviceMultipleSelection = val
      },
      // 编辑项目用户的角色
      editProjectUser (id, userName, roleName) {
        this.editPeopleDialogVisible = true
        this.editPeopleInfor.projectId = this.currentProjectId
        this.editPeopleInfor.id = id
        this.editPeopleInfor.userName = userName
        this.editPeopleInfor.roleName = roleName
      },
      //  修改项目用户的角色请求
      async confirmEditUser () {
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.updateUser(this.editPeopleInfor)
          this.$notify({
            type: 'success',
            title: '成功',
            message: '修改成功！'
          })
          this.editPeopleDialogVisible = false
        } catch (e) {
        } finally {
          loadingInstance.close()
        }
      },
      // 二次确认删除用户对话框
      confirmDeleteUser (id) {
        this.$confirm('确认删除该用户?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // id = parseInt(id)
          this.deleteUser(id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 删除用户请求
      async deleteUser (id) {
        if (id === '') {
          this.$notify({
            type: 'warning',
            title: '警告',
            message: '请选择用户！'
          })
          return
        }
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.destroyUser({projectId: this.currentProjectId, id: id})
          this.$notify({
            type: 'success',
            title: '成功',
            message: '删除成功！'
          })
        } catch (e) {
        } finally {
          loadingInstance.close()
        }
      },
      // 对设备进行停用启用操作二次确认
      async setDeviceEnable (flag) {
        this.$confirm('此操作将影响设备中心展示设备, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.updateDeviceEnadle(flag)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 对设备进行停用启用操作
      async updateDeviceEnadle (flag) {
        const ids = this.deviceMultipleSelection.map(item => item.id)
        if (ids.length < 1) {
          this.$notify({
            type: 'warning',
            title: '警告',
            message: ' 请选择操作的设备！'
          })
          return
        }
        const isDisables = this.deviceMultipleSelection.map(item => item.isDisable)
        if (flag && JSON.stringify(isDisables).indexOf('false') > 0) {
          this.$notify({
            type: 'warning',
            title: '警告',
            message: ' 正在使用的设备不可设置为启用！'
          })
          return
        }
        if (!flag && JSON.stringify(isDisables).indexOf('true') > 0) {
          this.$notify({
            type: 'warning',
            title: '警告',
            message: ' 已停用设备不可设置为停用！'
          })
          return
        }

        let msg = '停用成功！'
        let enableType = 'enable'
        if (flag) {
          msg = '启用成功！'
          enableType = 'enable'
        } else {
          msg = '停用成功！'
          enableType = 'disable'
        }
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          const options = {}
          options.projectId = this.currentProjectId
          options.deviceId = ids
          options.type = enableType
          const resList = await this.updateDeviceState(options)
          if (resList && resList.length) {
            const devices = this.deviceList({ projectId: this.currentProjectId, ids: resList })
            const names = devices.map(item => item.name).join(', ')
            this.$notify({
              type: 'warning',
              title: '警告',
              message: '操作失败的设备有：' + names
            })
          } else {
            this.$notify({
              type: 'success',
              title: '成功',
              message: msg
            })
          }
        } finally {
          loadingInstance.close()
        }
      },
      // 弹出二次确认删除设备的确认框
      confirmDeleteDevice (id, isDisable) {
        this.$confirm('此操作将永久删除设备, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteDevice(id, isDisable)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 删除设备请求
      async deleteDevice (id, isDisable) {
        if (('' + isDisable).indexOf('false') > -1) {
          this.$notify({
            type: 'warning',
            title: '警告',
            message: ' 正在使用的设备不可被删除！'
          })
          return
        }
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.destroyDevice({deviceId: id})
          this.$notify({
            type: 'success',
            title: '成功',
            message: '删除成功！'
          })
        } finally {
          loadingInstance.close()
        }
      },
      // 弹出二次确认 批量删除设备的确认框
      confirmDeleteDevices () {
        this.$confirm('此操作将永久删除所选设备, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ids = this.deviceMultipleSelection.map(item => item.id)
          const isDisables = this.deviceMultipleSelection.map(item => item.isDisable)
          if (ids.length < 1) {
            this.$notify({
              type: 'warning',
              title: '警告',
              message: ' 请选择操作的设备！'
            })
            return
          }
          if (JSON.stringify(isDisables).indexOf('false') > 0) {
            this.$notify({
              type: 'warning',
              title: '警告',
              message: ' 正在使用的设备不可被删除！'
            })
            return
          }
          this.passwordDialogFormVisible = true
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 提交密码验证
      async handleCommit () {
        this.$refs.passwordform.validate((valid) => {
          if (!valid) {
            return false
          } else {
            this.deleteDeviceBatch()
            return true
          }
        })
      },
      // 批量删除设备
      async deleteDeviceBatch () {
        const ids = this.deviceMultipleSelection.map(item => item.id)
        let options = {}
        options.projectId = this.currentProjectId
        options.deviceId = ids
        options.password = this.passwordform.password
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.destroyDeviceByBatch(options)
          this.$notify({
            type: 'success',
            title: '成功',
            message: '删除成功！'
          })
        } finally {
          this.passwordform.password = ''
          this.passwordDialogFormVisible = false
          loadingInstance.close()
        }
      },
      closeDeviceInforDialog () {
        this.addDevicesInnerVisible = false
      },
      // 三级联动选择
      onSelected (data) {
        this.adCodeInfo = {adcode: data.area.code, province: data.province.value, city: data.city.value, area: data.area.value}
      },
      changeProvince (data) {
        if (!data.code) {
          this.confirmFlag = false
        }
      },
      changeCity (data) {
        if (!data.code) {
          this.confirmFlag = false
        }
      },
      changeArea (data) {
        if (!data.code) {
          this.confirmFlag = false
        } else {
          this.confirmFlag = true
        }
      },
      // 文件上传前
      beforeUpload (file) {
        this.isloading = true
      },
      // 上传成功
      successAction (response, file, fileList) {
        this.isloading = false
        this.$notify({
          title: '成功',
          message: '上传成功！',
          type: 'success'
        })
        // 上传成功后清空文件
        // this.$refs.upload.clearFiles()
        // 重新获取设备列表数据
        this.getDeviceList({projectId: this.currentProjectId})
      },
      // 上传失败
      errorAction (err, file, fileList) {
        this.isloading = false
        let message = JSON.parse(err.message).message
        this.$notify.error({
          title: '错误',
          message: message
        })
      },
      async handleClose (tag) {
        try {
          let tags = JSON.stringify((this.tags.filter(item => item !== tag))).replace('[', '').replace(']', '').replace(/"/g, '')
          await this.updateTagOrFollow({projectId: this.currentProjectId, tag: tags})
          this.$notify({
            type: 'success',
            title: '成功',
            message: '删除成功！'
          })
          console.info(this.tags.filter(item => item !== tag))
        } catch (e) {
        }
      },
      showInput () {
        this.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      async handleInputConfirm () {
        if (this.tags.length >= 4) {
          this.$notify({
            type: 'warning',
            title: '警告',
            message: '最多只能设置4个标签！'
          })
          this.inputVisible = false
          this.inputValue = ''
          return
        }
        let inputValue = this.inputValue
        if (inputValue) {
          try {
            if (this.tags.length > 0 && this.tags.indexOf(inputValue) >= 0) {
              this.$notify({
                type: 'warning',
                title: '警告',
                message: '标签已存在！'
              })
              this.inputValue = ''
              this.$refs.saveTagInput.$refs.input.focus()
              return
            }
            let tags = JSON.stringify([...this.tags, inputValue]).replace('[', '').replace(']', '').replace(/"/g, '')
            await this.updateTagOrFollow({projectId: this.currentProjectId, tag: tags})
            this.$notify({
              type: 'success',
              title: '成功',
              message: '添加成功！'
            })
            this.inputVisible = false
            this.inputValue = ''
          } catch (e) {
          }
        }
      },
      async switchChange (val) {
        try {
          await this.updateTagOrFollow({projectId: this.currentProjectId, follow: this.follow})
          let message = val === 1 ? '关注成功！' : '取消关注成功！'
          this.$notify({
            type: 'success',
            title: '成功',
            message: message
          })
        } catch (E) {
        }
      }
    },
    created () {
    },
    mounted () {
      // 获取设备配置参数
      this.getParams()
      // 用户刷新页面  重新调取项目接口
      this.getProject({projectId: this.currentProjectId})
    },
    deactivated () {
      this.adCodeInfo = {}
    },
    filters: {

    }
  }
</script>

<style scoped>
  .project-main {
    margin-top: 20px;
  }
  .project-main .el-form {
    width: 500px;
    position: relative;
    left: 50%;
    margin-left: -250px;
  }
  .identity-infor {
    min-width: 75px;
    max-width: 115px;
    color: #c0c4cc;
    background-color: #f5f7fa;
    padding: 15px;
    padding-top: 3px;
    padding-bottom: 3px;
    border-radius: 10px;
  }
  .peopleNum {
    min-width: 50px;
    font-size: 15px;
    margin-right: 15px;
    display:-moz-inline-box; /* css注释：for ff2 */
    display:inline-block;
  }
  .devicesNum {
    min-width: 50px;
    font-size: 15px;
    margin-right: 15px;
    display:-moz-inline-box; /* css注释：for ff2 */
    display:inline-block;
  }
  .people-top {
    overflow:hidden;
  }
  .delete-people-btn {
    float: right;
    margin-right: 15px;
  }
  .add-people-btn {
    float: right;
    margin-right: 15px;
  }
  .add-device-dialog .el-form {
    height: 500px;
    width: 300px;
    position: relative;
    left: 50%;
    margin-left: -150px;
  }
  .add-device-dialog .el-input {
    width: 150px;
  }
  .el-dialog {
    margin-top: 10vh;
  }
  .el-dialog__body {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .distpicker-address-wrapper {
    width: 600px;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>



// WEBPACK FOOTER //
// src/views/project/project.vue