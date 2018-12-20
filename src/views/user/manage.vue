<template>
  <div>
    <div class="manage-user-title">
      <div class="title">用户管理</div>
      <!-- <el-button v-if="roleName() !== 'ENDUSER' && roleName() !== 'FAE'" class="btn" @click="dialogVisible = true">新增用户</el-button>  -->
      <!-- <transition
        enter-active-class="animated zoomIn"
        leave-active-class="animated fadeOutRight">
        <el-button v-if="!isFlag" class="btn" style="margin-right:10px;" @click="getMyUserList()">切换到所有用户</el-button>
      </transition> -->
      <!-- <transition
        enter-active-class="animated zoomIn"
        leave-active-class="animated fadeOutLeft">
        <el-button v-if="roleName() === 'SALE' && isFlag" class="btn" style="margin-right:10px;" @click="getSubSystem()">切换到子系统迁移</el-button>
      </transition> -->
      <!-- <transition
        enter-active-class="animated zoomIn"
        leave-active-class="animated fadeOutLeft">
        <el-button v-if="roleName() === 'SALE'" class="btn" @click="migrateSaleVisible = true">客户迁移</el-button>
      </transition> -->
      <!-- <transition
        enter-active-class="animated zoomIn"
        leave-active-class="animated fadeOutLeft">
        <el-button v-if="roleName() === 'SALE'" class="btn" @click="subusersVisible = true">查看子用户</el-button>
      </transition> -->
    </div>
    <div class="manage-table-warp">
      <el-tabs type="border-card" v-model="activeName" @tab-click="tabClick">
        <!-- 所有用户 -->
        <el-tab-pane label="所有用户" name="first">
          <el-input style="width:200px;float:left;" placeholder="搜索用户名" v-model="username" @change="getMyUserList()" clearable></el-input>
          <el-table
            :data="tableData">
            <el-table-column
              prop="username"
              label="用户名">
            </el-table-column>
            <el-table-column
              prop="nickname"
              label="昵称">
            </el-table-column>
            <el-table-column
              prop="roleName"
              label="角色类型">
              <template slot-scope="scope">
                <span v-if="scope.row.roleName==='PARTNER'">合作伙伴</span>
                <span v-if="scope.row.roleName==='CUSTOMER'">客户</span>
                <span v-if="scope.row.roleName==='ENDUSER'">最���用户</span>
                <span v-if="scope.row.roleName==='FAE'">FAE</span>
                <span v-if="scope.row.roleName==='SALE'">销售经理</span>
                <span v-if="scope.row.roleName==='DEALER'">经销商</span>
                <span v-if="scope.row.roleName==='SUB1'">---</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="createdBy"
              label="创建人">
            </el-table-column>
            <el-table-column
              prop="createdAt"
              label="	创建时间">
              <template slot-scope="scope">
                {{ scope.row.createdAt | customTime }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="roleName() === 'SALE'"
              label="	系统名称">
              <template slot-scope="scope">
                <span>{{ scope.row.subSystemName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="操作"
              width="160">
              <template slot-scope="scope">
                <el-button v-if="scope.row.locked" @click="unlockMyUser(scope.row.id)" type="text" size="small">解锁</el-button>
                <el-button v-else @click="lockMyUser(scope.row.id)" type="text" size="small">锁定</el-button>
                <el-button @click="resetMyUserPassword(scope.row.id)" type="text" size="small">重置密码</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <transition
              enter-active-class="animated rollIn"
              leave-active-class="animated zoomOut">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pageNo"
                :page-sizes="[10, 20, 50, 100, 200]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
              </el-pagination>
            </transition>
          </div>
        </el-tab-pane>
        <!-- 子系统迁移 -->
        <el-tab-pane v-if="roleName() === 'SALE'" label="子系统迁移" name="second">
          <el-input style="width:200px;float:left;" placeholder="搜索用户名" v-model="subusername" clearable></el-input>
          <el-table
            :data="subtableComputer">
            <el-table-column
              prop="username"
              label="用户名">
            </el-table-column>
            <el-table-column
              prop="nickname"
              label="昵称">
            </el-table-column>
            <el-table-column
              prop="roleName"
              label="角色类型">
              <template slot-scope="scope">
                <span v-if="scope.row.roleName==='PARTNER'">合作伙伴</span>
                <span v-if="scope.row.roleName==='CUSTOMER'">客户</span>
                <span v-if="scope.row.roleName==='ENDUSER'">最终用户</span>
                <span v-if="scope.row.roleName==='FAE'">FAE</span>
                <span v-if="scope.row.roleName==='SALE'">销售经理</span>
                <span v-if="scope.row.roleName==='DEALER'">经销商</span>
                <span v-if="scope.row.roleName==='SUB1'">子系统</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="createdBy"
              label="创建人">
            </el-table-column>
            <el-table-column
              prop="createdAt"
              label="	创建时间">
              <template slot-scope="scope">
                {{ scope.row.createdAt | customTime }}
              </template>
            </el-table-column>
            <el-table-column
              label="	系统名称">
              <template slot-scope="scope">
                <span>{{ scope.row.subSystemName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="操作"
              width="160">
              <template slot-scope="scope">
                <el-button @click="migrate(scope.row.id)" type="text" size="small">迁移</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <transition
              enter-active-class="animated rollIn"
              leave-active-class="animated zoomOut">
              <el-pagination
                @size-change="subhandleSizeChange"
                @current-change="subhandleCurrentChange"
                :current-page="subpageNo"
                :page-sizes="[10, 20, 50, 100, 200]"
                :page-size="subpageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="subtableData.length">
              </el-pagination>
            </transition>
          </div>
        </el-tab-pane>
        <!-- 新增用户 -->
        <el-tab-pane v-if="roleName() !== 'ENDUSER' && roleName() !== 'FAE'" label="新增用户" name="six" class="manage-main">
          <el-form label-width="80px" :model="form" :rules="addUserRules" ref="addUserRules">
            <el-form-item prop="username" label="登录名">
              <el-input v-model.trim="form.username" placeholder="输入登录名"></el-input>
            </el-form-item>
            <el-form-item prop="nickname" label="昵称">
              <el-input v-model.trim="form.nickname" placeholder="输入登昵称">></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码">
              <el-input v-model.trim="form.password" placeholder="输入登密码">></el-input>
            </el-form-item>
            <el-form-item prop="roleName" label="角色类别">
              <el-select v-model="form.roleName" placeholder="选择角色">
                <el-option v-for="(item, index) in roleAddType" :key="index" :label="item.label" :value="item.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="roleName() === 'SALE'" label="子系统">
              <el-select v-model="form.systemId" placeholder="选择系统">
                <el-option v-for="(item, index) in this.systemList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="roleName() === 'DEALER'" label="子系统">
              <el-select v-model="form.systemId" placeholder="选择系统">
                <el-option v-for="(item, index) in this.dealerTable" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addMyUser">确定</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- 子用户 -->
        <el-tab-pane v-if="roleName() === 'SALE'" label="子用户" name="third">
          <h3>当前用户的所有子用户列表:</h3>
          <el-tree
            style="margin-left:100px;"
            :data="treeData"
            :props="defaultProps">
          </el-tree>
        </el-tab-pane>
        <!-- 客户迁移 -->
        <el-tab-pane v-if="roleName() === 'SALE'" label="客户迁移" name="five" class="manage-main">
          <h3>客户迁移到其他销售:</h3>
          <el-form label-width="80px" :model="saleChangeForm" :rules="saleChangeRules" ref="saleChangeRules">
            <el-form-item v-if="roleName() === 'SALE'" label="销售人员" prop="targetSaleId">
              <el-select v-model="saleChangeForm.targetSaleId" placeholder="选择销售">
                <el-option v-for="(item, index) in this.saleList" :key="index" :label="item.nickname" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="customerIds" label="客户名称">
              <el-select v-model="saleChangeForm.customerIds" placeholder="选择客户" multiple>
                <el-option v-for="(item, index) in this.sub1data" :key="index" :label="item.username" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <!-- 客户迁移到其他销售 -->
              <el-button type="primary" @click="comfirmChangeSale">确定</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- 合作伙伴 -->
        <el-tab-pane v-if="roleName() === 'SALE'" label="合作伙伴" name="fourth">
          <el-table
            :data="partnersTable">
            <el-table-column
              prop="username"
              label="用户名">
            </el-table-column>
            <el-table-column
              prop="nickname"
              label="昵称">
            </el-table-column>
            <el-table-column
              prop="createdBy"
              label="创建人">
            </el-table-column>
            <el-table-column
              prop="createdAt"
              label="	创建时间">
              <template slot-scope="scope">
                {{ scope.row.createdAt | customTime }}
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="操作"
              width="160">
              <template slot-scope="scope">
                <el-button @click="toDealer(scope.row.id)" type="text" size="small">设为经销商</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 子系统迁移会话框 -->
    <el-dialog
      title="子系统迁移"
      :visible.sync="migrateSysVisible"
      width="30%">
      <el-form label-width="80px" :model="migrateForm" :rules="migrateRules" ref="migrateRules">
        <el-form-item v-if="roleName() === 'SALE'" label="子系统" prop="systemId">
          <el-select v-model="migrateForm.systemId" placeholder="选择系统">
            <el-option v-for="(item, index) in this.systemList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="roleName" label="角色类别">
          <el-select v-model="migrateForm.roleName" placeholder="选择角色">
            <el-option
              key="0"
              label="合作伙伴"
              :value="'PARTNER'"
            ></el-option>
            <el-option
              key="1"
              label="其他"
              :value="''"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="migrateSysVisible = false">取 消</el-button>
        <el-button type="primary" @click="comfirmMigrate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import http from 'http'

  export default {
    data () {
      return {
        total: 0,
        pageSize: 10,
        pageNo: 1,
        subpageSize: 10,
        subpageNo: 1,
        form: {
          username: '',
          nickname: '',
          password: '',
          roleName: '',
          systemId: ''
        },
        migrateForm: {
          systemId: '',
          roleName: ''
        },
        systemList: [],
        migrateSysVisible: false,
        migrateSaleVisible: false,
        subusersVisible: false,
        tableData: [],
        subtableData: [],
        addUserRules: {
          username: [
            { required: true, message: '请输入用户名' },
            { trigger: 'blur' }
          ],
          nickname: [
            { required: true, message: '请输入昵称' },
            { trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码不能少于6位', trigger: 'blur' }
          ],
          roleName: [
            { required: true, message: '角色类型' },
            { trigger: 'blur' }
          ]
        },
        migrateRules: {
          systemId: [
            { required: true, type: 'number', message: '请选择子系统' },
            { type: 'number', trigger: 'blur' }
          ]
        },
        saleChangeRules: {
          targetSaleId: [
            { required: true, message: '请选择销售' }
          ],
          customerIds: [
            { required: true, message: '请选择客户' }
          ]
        },
        // 用户ID
        id: '',
        username: '',
        subusername: '',
        // 销售列表
        saleList: [],
        sub1data: [],
        saleChangeForm: {
          targetSaleId: '',
          customerIds: ''
        },
        treeData: [],
        defaultProps: {
          children: 'mySubusers',
          label: 'name'
        },
        activeName: 'first',
        // 合作伙伴
        partnersTable: [],
        // 经销商
        dealerTable: []
      }
    },
    computed: {
      ...mapGetters([
        'roleName'
      ]),
      roleAddType () {
        let roleAddTypeList = []
        switch (this.roleName()) {
          case 'SALE':
            roleAddTypeList = [
              {label: '合作伙伴', name: 'PARTNER'},
              {label: '客户', name: 'CUSTOMER'},
              {label: '最终用户', name: 'ENDUSER'},
              {label: '经销商', name: 'DEALER'}
            ]
            break
          case 'PARTNER':
            roleAddTypeList = [
              {label: '客户', name: 'CUSTOMER'},
              {label: '最终用户', name: 'ENDUSER'}
            ]
            break
          case 'CUSTOMER':
            roleAddTypeList = [
              {label: '最终用户', name: 'ENDUSER'}
            ]
            break
          case 'DEALER':
            roleAddTypeList = [
              {label: '合作伙伴', name: 'PARTNER'},
              {label: '客户', name: 'CUSTOMER'},
              {label: '最终用户', name: 'ENDUSER'}
            ]
            break
        }
        return roleAddTypeList
      },
      // 前端过滤用户名
      subtableComputer () {
        let data = this.subtableData.filter(item => {
          return item.username.indexOf(this.subusername) > -1
        })
        const { subpageNo, subpageSize } = this
        const start = (subpageNo - 1) * subpageSize
        const end = start + subpageSize
        return data.slice(start, end)
      }
    },
    methods: {
      // 更改分页条数
      handleSizeChange (val) {
        this.pageSize = val
        this.getMyUserList()
      },
      // 切换分页
      handleCurrentChange (val) {
        this.pageNo = val
        this.getMyUserList()
      },
      subhandleSizeChange (val) {
        this.subpageSize = val
      },
      // 切换分页
      subhandleCurrentChange (val) {
        this.subpageNo = val
      },
      // 获取我创建的用户
      async getMyUserList () {
        let data = await http.userManage.getMyUserList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          username: this.username
        })
        this.tableData = data.records
        this.total = data.recordCount
        let res = this.tableData.map(item => {
          this.systemList.forEach(subItem => {
            if (item.systemId === subItem.id) item['subSystemName'] = subItem.name
          })
          return item
        })
        return res
      },
      // 锁定用户
      async lockMyUser (userId) {
        let result = await http.userManage.lockMyUser(userId)
        if (result) {
          this.$message.success({
            message: '用户锁定成功',
            type: 'success'
          })
        } else {
          this.$message.error('用户锁定失败')
        }
        this.getMyUserList()
      },
      // 解锁用户
      async unlockMyUser (userId) {
        let result = await http.userManage.unlockMyUser(userId)
        if (result) {
          this.$message.success({
            message: '用户解锁成功',
            type: 'success'
          })
        } else {
          this.$message.error('用户解锁失败')
        }
        this.getMyUserList()
      },
      // 重置密码
      async resetMyUserPassword (userId) {
        let result = await http.userManage.resetMyUserPassword(userId)
        if (result.success) {
          this.$alert(`新密码：${result.detail}`, '重置密码成功', {
            confirmButtonText: '确定'
          })
        } else {
          this.$message.error('密码重置失败')
        }
      },
      // 新增用户
      async addMyUser () {
        this.$refs.addUserRules.validate(async (valid) => {
          if (!valid) return
          let result = await http.userManage.addMyUser(this.form)
          if (result) {
            this.$message({
              message: '新增用户成功',
              type: 'success'
            })
            this.$refs.addUserRules.resetFields()
          } else {
            this.$message.error(result.message)
          }
          if (this.roleName() === 'SALE') {
            this.getSystemId()
            this.getSaleList()
            this.getMySubusers()
            this.getPartnersInSale()
          }
        })
      },
      // 获取子系统
      async getSystemId () {
        this.systemList = await http.userManage.getSystemId()
      },
      // 获取子系统数据
      async getSubSystem () {
        const data = await http.userManage.getSubUser()
        this.subtableData = data
        let res = this.subtableData.map(item => {
          this.systemList.forEach(subItem => {
            if (item.systemId === subItem.id) item['subSystemName'] = subItem.name
          })
          return item
        })
        return res
      },
      // 迁移操作
      migrate (id) {
        this.id = id
        this.migrateSysVisible = true
      },
      // 确定  迁移子系统
      async comfirmMigrate () {
        this.$refs.migrateRules.validate(async (valid) => {
          if (!valid) return
          const options = {}
          options.id = this.id
          options.systemId = this.migrateForm.systemId
          options.roleName = this.migrateForm.roleName
          let result = await http.userManage.migrateSys(options)
          if (result) {
            this.$message({
              message: '迁移成功',
              type: 'success'
            })
          } else {
            this.$message.error('迁移失败')
          }
          this.getSubSystem()
          this.migrateSysVisible = false
        })
      },
      // 获取销售列表
      async getSaleList () {
        this.saleList = await http.userManage.getSales()
        this.sub1data = await http.userManage.getSubUser()
      },
      // 获取当前用户的所有子用户列表
      async getMySubusers () {
        let data = await http.userManage.getMySubusers()
        data.forEach(item => {
          item.name = `昵称：${item.nickname}  用户名：${item.username}`
          if (item.mySubusers) {
            item.mySubusers.forEach(i => {
              i.name = `昵称：${i.nickname}  用户名：${i.username}`
            })
          }
        })
        this.treeData = data
      },
      // 获取销售下的所有合作伙伴
      async getPartnersInSale () {
        let data = await http.userManage.getPartnersList()
        this.partnersTable = data
      },
      // 获取经销商下的子系统列表
      async getDealers () {
        let data = await http.userManage.getDealerList()
        this.dealerTable = data
      },
      // 转移客户
      async comfirmChangeSale () {
        this.$refs.saleChangeRules.validate(async (valid) => {
          if (!valid) return
          const options = {}
          options.targetSaleId = this.saleChangeForm.targetSaleId
          options.customerIds = this.saleChangeForm.customerIds
          let result = await http.userManage.transfer(options)
          if (result) {
            this.$message({
              message: '迁移成功',
              type: 'success'
            })
          } else {
            this.$message.error('迁移失败')
          }
          this.migrateSaleVisible = false
          this.$refs.saleChangeRules.resetFields()
        })
      },
      handleNodeClick (data) {
        console.log(data)
      },
      tabClick (val) {
        // switch (val.name) {
        //   case 'second':
        //     this.getSubSystem()
        //     break
        //   case 'first':
        //     this.getMyUserList()
        //     break
        //   default:
        //     break
        // }
      },
      // 将合作伙伴升级为经销商
      async toDealer (id) {
        let result = await http.userManage.setPartnerToDealer({ partnerId: id.toString() })
        if (result) {
          this.$message({
            message: '设为经销商成功',
            type: 'success'
          })
        } else {
          this.$message.error('设为经销商失败')
        }
        this.getPartnersInSale()
        this.getMySubusers()
        this.getSubSystem()
      }
    },
    filters: {
    },
    async created () {
      if (this.roleName() === 'SALE') {
        this.getSystemId()
        this.getSaleList()
        this.getMySubusers()
        this.getPartnersInSale()
        this.getSubSystem()
      }
      this.getMyUserList()
      if (this.roleName() === 'DEALER') {
        this.getDealers()
      }
    }
  }
</script>
<style scoped>
  .manage-user-title {
    width: 90%;
    margin: 10px auto 24px;
    overflow: hidden;
  }
  .pagination-wrap {
    /* width: 90%; */
    margin: 10px auto 24px;
  }
  .manage-user-title .title{
    float: left;
    font-size: 18px;
    line-height: 36px;
  }
  .manage-user-title .btn{
    float: right;
  }
  .manage-table-warp {
    width: 90%;
    margin: 20px auto;
  }
  .manage-main .el-form {
    width: 500px;
    position: relative;
    left: 50%;
    margin-left: -250px;
  }
</style>
