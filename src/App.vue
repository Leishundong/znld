<template>
  <div id="app">
    <router-view></router-view>
    <el-dialog
      ref="versionDialog"
      title="更新提示"
      :visible.sync="dialogVisible"
      width="30%">
      <span class="versionDialog" v-html="versionBody"></span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { getVersion, setVersion } from 'tools/storage'
  export default {
    name: 'app',
    data () {
      return {
        dialogVisible: false,
        newVersion: '1.9.0'
      }
    },
    created () {
      setTimeout(() => {
        let version = getVersion()
        if (version !== null) {
          setVersion(this.newVersion)
          if (version !== this.newVersion) {
            this.dialogVisible = true
          }
        } else {
          setVersion(this.newVersion)
          this.dialogVisible = true
        }
      }, 500)
    },
    computed: {
      versionBody () {
        return `<font style="color:#409EFF;">版本号：${this.newVersion}</font><br/>
            1、 新增根据设备sn号和pn号生成二维码；<br/>
            2、 新增老化测试功能；<br/>
            3、 新增铃铛显示设备数，可查看设备告警列表、根据权限处理设备；<br/>
            4、 新增卫星地图模式，可查看路况和路网；<br/>
            5、 新增修改密码需要再次确认密码；<br/>
            6、 增加项目拥有者批量删除设备功能；<br/>
            7、 修复日落时间算法错误BUG；<br/>
            8、 修复设备在地图的位置显示；<br/>
            9、 修复切换项目分页页码变回第一页；<br/>
          </div>`
      }
    }
  }
</script>

<style scoped>
  .el-dialog__body {
    padding: 30px 20px;
  }
  .el-dialog__body {
    padding: 10px 17px;
  }
  .versionDialog {
    text-align: center;
    font-size: 16px;
  }
</style>




// WEBPACK FOOTER //
// src/App.vue