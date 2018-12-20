<template>
  <div class="add-project-form">
    <el-form ref="projectForm" :model="projectForm" :rules="rules" label-position="right" label-width="80px" class="el-form">
      <h2 >新建项目</h2>
      <el-form-item label="项目名" prop="name">
        <el-input v-model="projectForm.name"></el-input>
      </el-form-item>
      <el-form-item label="位置" prop="adCode">
        <!-- <el-input v-model="projectForm.location"></el-input> -->
        <v-distpicker @selected="onSelected" v-model="projectForm.adCode">
        </v-distpicker>
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" v-model="projectForm.remark"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreate" :loading="loadingSubmit">立即创建</el-button>
        <el-button type="primary" @click="back" >返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import VDistpicker from 'v-distpicker'
  import { mapActions } from 'vuex'

  export default {
    data () {
      return {
        projectForm: {
          name: '',
          location: '',
          remark: '',
          adCode: ''
        },
        rules: {
          name: [
            { required: true, message: '请输入项目名称', trigger: 'blur' },
            { min: 1, max: 16, message: '长度最多为16个字符', trigger: 'blur' }
          ],
          adCode: [
            { required: true, message: '请选择项目所在位置' }
          ]
        },
        loadingSubmit: false
      }
    },
    components: {
      VDistpicker
    },
    methods: {
      ...mapActions([
        'createProject'
      ]),
      handleCreate () {
        this.$refs.projectForm.validate(async (valid) => {
          if (!valid) return
          try {
            this.loadingSubmit = true
            const options = {}
            options.name = this.projectForm.name
            options.location = JSON.stringify(this.projectForm.location)
            options.adCode = this.projectForm.adCode
            options.remark = this.projectForm.remark
            await this.createProject(options)
            this.$notify({
              type: 'success',
              title: '成功',
              message: '添加成功'
            })
            this.$refs.projectForm.resetFields()
          } finally {
            this.loadingSubmit = false
          }
        })
      },
      // 返回上一页
      back () {
        this.$router.go(-1)
      },
      // 三级联动选择
      onSelected (data) {
        let adCodeInfo = {adcode: data.area.code, province: data.province.value, city: data.city.value, area: data.area.value}
        this.projectForm.adCode = data.area.code
        this.projectForm.location = adCodeInfo
      }
    }
  }
</script>

<style scoped>
  .add-project-form{
    margin:auto 0px;
  }
  .add-project-form .el-form{
    width: 500px;
    position: relative;
    left: 50%;
    margin-left: -250px;
  }
  .distpicker-address-wrapper {
    width: 600px;
  }
</style>
