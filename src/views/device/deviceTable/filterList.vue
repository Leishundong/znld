<template>
  <div class="filter-device-list">
    <el-table :data="deviceListData">
      <el-table-column property="name" label="设备名称"></el-table-column>
      <el-table-column property="snHex" label="设备SN号"></el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100">
        <template slot-scope="scope">
          <!-- @click="handleClick(scope.row)" -->
          <el-button type="text" @click="gotoMonitor(scope.row.name, scope.row.id)" size="small">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      style="padding: 0"
      small
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total">
    </el-pagination>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  export default {
    data () {
      return {
        // 分页
        currentPage: 1,
        pageSize: 5
      }
    },
    props: ['deviceListType'],
    computed: {
      ...mapGetters([
        'deviceList'
      ]),
      projectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      // 设备分页列表
      deviceListData () {
        let start = (this.currentPage - 1) * this.pageSize
        let end = start + this.pageSize
        let deviceListDataSrc = []
        if (this.deviceListType === 'offline') {
          deviceListDataSrc = this.deviceList({projectId: this.projectId, isOnline: false, isDisable: false})
        }
        if (this.deviceListType === 'off') {
          deviceListDataSrc = this.deviceList({projectId: this.projectId, isOpen: false, isDisable: false})
        }
        return deviceListDataSrc.slice(start, end)
      },
      total () {
        let deviceListDataSrc = []
        if (this.deviceListType === 'offline') {
          deviceListDataSrc = this.deviceList({projectId: this.projectId, isOnline: false, isDisable: false})
        }
        if (this.deviceListType === 'off') {
          deviceListDataSrc = this.deviceList({projectId: this.projectId, isOpen: false, isDisable: false})
        }
        this.currentPage = 1
        return deviceListDataSrc.length
      }
    },
    watch: {
      deviceListType () {
        this.currentPage = 1
      }
    },
    methods: {
      // 当前分页
      handleCurrentChange (val) {
        this.currentPage = val
      },
      gotoMonitor (searchText, deviceId) {
        this.$router.push({name: 'monitor', query: {searchText, deviceId}})
        this.$emit('closeFilterModal')
      }
    },
    created () {
    }
  }
</script>
<style>

</style>




// WEBPACK FOOTER //
// src/views/device/deviceTable/filterList.vue