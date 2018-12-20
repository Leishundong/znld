<template>
  <section class="login-form">
    <div class="form-header">
      <div class="form-header-title active"> 账号密码登录 </div>
      <!-- <div class="form-header-title"> 手机号登录 </div> -->
    </div>

    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="username">
        <el-input type="text" placeholder="账户" v-model="form.username" @keyup.enter.native="onSubmit"></el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input type="password" placeholder="密码" v-model="form.password" @keyup.enter.native="onSubmit"></el-input>
      </el-form-item>

      <!-- <el-form-item label="记住登录">
        <el-switch v-model="isRemember"></el-switch>
      </el-form-item> -->

      <el-form-item>
        <el-button type="primary" class="width-100" @click="onSubmit" :loading="loading"> 登 录 </el-button>
      </el-form-item>
    </el-form>

    <!-- start 修改密码 -->
    <el-dialog title="修改初始密码" :visible.sync="passwordDialogFormVisible">
      <el-form :model="passwordform" :rules="passwordRules" ref="passwordform" label-width="80px" style="width: 300px;" >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordform.oldPassword" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordform.newPassword" type="password" placeholder="最少6位" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="passwordform.checkPass" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdatePassword" :loading="loadingPassword">确 定</el-button>
      </div>
    </el-dialog>
    <!-- end 修改密码 -->

    <!-- <div class="form-footer">
      <div class="form-footer-left"></div>
      <router-link class="form-footer-right" :to="{ name: 'register' }"> 注册账户 </router-link>
    </div> -->
  </section>
</template>

<script>
  import { mapActions } from 'vuex'
  export default {
    name: 'login',

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
        // 表单
        form: {
          username: 'yanshi',
          password: '123456'
        },
        rules: {
          username: [
            { required: true, message: '请输入账户名' }
          ],
          password: [
            { required: true, message: '请输入密码' }
          ]
        },
        isRemember: true,
        // 状态
        loading: false,
        passwordDialogFormVisible: false,
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
        loadingPassword: false
      }
    },

    computed: {
    },

    methods: {
      ...mapActions([
        'login',
        'updatePassword'
      ]),
      async onSubmit () {
        this.$refs.form.validate(async (valid) => {
          if (!valid) return
          try {
            this.loading = true
            await this.login(this.form)
            let passwordUpdatedAt = sessionStorage.getItem('passwordUpdatedAt') || {}
            if (passwordUpdatedAt === '0') {
              this.$alert('<font style="color:#1890ff;">您的密码为初始密码请修改</font>', '修改密码', {
                dangerouslyUseHTMLString: true,
                callback: action => {
                  this.passwordDialogFormVisible = true
                }
              })
            } else {
              this.$router.replace({ name: 'home' })
            }
          } catch (e) {
            console.log('登录错误')
          } finally {
            this.loading = false
          }
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
              message: '密码修改成功，请再次登录！'
            })
            this.passwordform.oldPassword = ''
            this.passwordform.newPassword = ''
            this.$router.push({name: 'login'})
          } finally {
            this.loadingPassword = false
          }
        })
      }
    }
  }
</script>

<style scoped>
  .login-form {
    margin: 0 auto;
    width: 360px;
  }

  .form-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .form-header-title {
    display: inline-block;
    width: 128px;
    height: 48px;
    line-height: 48px;
    cursor: pointer;
  }

  .form-header-title.active {
    color: #1890ff;
    border-bottom: 2px solid #1890ff;
  }

  .form-header-title:hover {
    color: #1890ff;
  }

  .form-header-title + .form-header-title {
    margin-left: 20px;
  }

  .form-footer {
    display: flex;
    margin-top: 20px;
    align-items: center;
    justify-content: space-between;
  }

  .form-footer-left {
    flex: 1;
  }
</style>



// WEBPACK FOOTER //
// src/views/user/children/login.vue
