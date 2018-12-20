<template>
  <nav>
    <router-link :to="device">设备中心</router-link>
    <router-link :to="monitor">监控中心</router-link>
    <router-link :to="warn">告警中心</router-link>
    <router-link :to="strategy">策略中心</router-link>
    <router-link :to="group">分组管理</router-link>
    <router-link :to="project">项目信息</router-link>
  </nav>
</template>
<script>
  export default {
    data () {
      return {
        projectId: ''
      }
    },
    computed: {
      device () {
        return `/${this.projectId}/app/device`
      },
      monitor () {
        return `/${this.projectId}/app/monitor`
      },
      warn () {
        return `/${this.projectId}/app/warn`
      },
      strategy () {
        return `/${this.projectId}/app/strategy`
      },
      group () {
        return `/${this.projectId}/app/group`
      },
      project () {
        return `/${this.projectId}/app/project`
      }
    },
    watch: {
      $route () {
        this.projectId = sessionStorage.getItem('projectId')
      }
    },
    created () {
      this.projectId = sessionStorage.getItem('projectId')
    }
  }
</script>
<style lang="less" scoped>
  nav {
    background: #f5f7fa;
    height: 40px;
    border: 1px solid #ddd;
    .router-link-active {
      color: #1890ff;
      background: #fff;
      border: 1px solid #ddd;
      border-top: 0;
      border-bottom-color: #fff;
      &:first-child {
        border-left:0;
      }
    }
  }
  nav a {
    display: inline-block;
    color: #666;
    padding: 0 20px;
    line-height: 38px;
  }
</style>



// WEBPACK FOOTER //
// src/components/navbar.vue