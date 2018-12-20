<template>
  <div class="filter-device-list">
    <el-table :data="deviceListData">
      <el-table-column property="deviceName" label="设备名称"></el-table-column>
      <el-table-column property="type" label="告警类型">
        <template slot-scope="scope">
          <span v-if="scope.row.type===1">太阳能板故障</span>
          <span v-if="scope.row.type===2">LED空载</span>
          <span v-if="scope.row.type===3">LED过流</span>
          <span v-if="scope.row.type===4">温度过高/过低</span>
          <span v-if="scope.row.type===5">电池低压</span>
          <span v-if="scope.row.type===6">灭灯</span>
        </template>  
      </el-table-column>
      <!-- <el-table-column property="sourceType" label="告警来源">
        <template slot-scope="scope">
          <span v-if="scope.row.sourceType===1">设备上报</span>
          <span v-if="scope.row.sourceType===2">手工填写</span>
          <span v-if="scope.row.sourceType===3">智能推测</span>
        </template>  
      </el-table-column> -->
      <el-table-column property="text" label="告警内容"></el-table-column>
      <el-table-column property="updateTime" label="更新时间">
        <template slot-scope="scope">{{formatTime(scope.row.updateTime)}}</template>  
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      style="padding: 0"
      small
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
      :page-size="pageSize"
      :total="total">
    </el-pagination>
  </div>
</template>
<script>
  import moment from 'moment'
  import { mapGetters } from 'vuex'
  export default {
    data () {
      return {
        // 分页
        currentPage: 1,
        pageSize: 10
      }
    },
    props: ['id'],
    computed: {
      ...mapGetters([
        'warningList'
      ]),
      projectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      // 设备分页列表
      deviceListData () {
        let start = (this.currentPage - 1) * this.pageSize
        let end = start + this.pageSize
        let deviceListDataSrc = this.warningList({projectId: this.projectId, deviceId: this.id})
        return deviceListDataSrc.slice(start, end)
      },
      total () {
        let deviceListDataSrc = this.warningList({projectId: this.projectId, deviceId: this.id})
        return deviceListDataSrc.length
      }
    },
    methods: {
      // 当前分页
      handleCurrentChange (val) {
        this.currentPage = val
      },
      formatTime (x) {
        return moment(x).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    created () {
    }
  }
</script>
<style>

</style>



// WEBPACK FOOTER //
// src/views/device/modal/moteWarn.vue