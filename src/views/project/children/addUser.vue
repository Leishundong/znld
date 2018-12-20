<template>
  <div class="add-user">
    <el-form ref="addPeopleInfor" :rules="addPeopleInforRules" :model="addPeopleInfor" label-width="80px" size="small">
      <el-form-item label="用户名" prop="name">
        <el-input v-model="addPeopleInfor.name" style="width: 200px;"></el-input>
      </el-form-item>
      <el-form-item label="角色名" prop="role">
        <el-select v-model="addPeopleInfor.role" placeholder="请选择">
          <el-option
            v-for="item in roles"
            :key="item.fieldName"
            :label="item.name"
            :value="item.fieldName">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="confirmAddUser()">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex'
  import { Loading } from 'element-ui'
  export default {
    name: 'addUser',
    props: ['addPeopleDialogVisible'],
    data () {
      return {
        addPeopleInfor: {
          name: '',
          role: ''
        },
        addPeopleInforRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          role: [
            { required: true, message: '请选择角色', trigger: 'blur' }
          ]
        },
        roles: [
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
        ]
      }
    },

    computed: {
      ...mapGetters([
        'strategyList'
      ]),
      currentProjectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      getProjectUserList () {
        return this.$store.state.userList || sessionStorage.getItem('user_list')
      }
    },
    created () {
      // const promises = [
      //   this.getStrategyList({ projectId: this.currentProjectId })
      // ]
      // Promise.all(promises)
    },
    methods: {
      ...mapActions([
        'createUser'
      ]),
      // 重置添加用户表单
      resetForm () {
        this.$refs.addPeopleInfor.resetFields()
      },
      // 添加项目用户表单验证
      async confirmAddUser () {
        this.$refs.addPeopleInfor.validate((valid) => {
          if (!valid) {
            return false
          } else {
            this.addPeople()
            return true
          }
        })
      },
      // 添加项目用户请求
      async addPeople () {
        const addPeopleInfor = this.addPeopleInfor
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.createUser({ projectId: this.currentProjectId, username: addPeopleInfor.name, roleName: addPeopleInfor.role })
          this.$notify({
            type: 'success',
            title: '提示',
            message: '邀请成功！'
          })
          this.$emit('closeAddUserDialog')
        } catch (e) {
          console.log(e)
        } finally {
          loadingInstance.close()
        }
      }
    }
  }
</script>
<style scoped>
</style>



// WEBPACK FOOTER //
// src/views/project/children/addUser.vue