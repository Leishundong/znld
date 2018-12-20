<template>
  <el-container>
    <el-header>
      <header-bar></header-bar>
    </el-header>
    <el-main class="define-main">
      <!-- <keep-alive>
        <router-view></router-view>
      </keep-alive> -->
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
  import headerBar from '../components/header'
  import axios from 'axios'
  export default {
    components: {
      headerBar
    },
    async created () {
      let host = location.host
      let { data } = await axios.get(`/system/info?host=${host}`)
      if (data.success === true) {
        let link = document.createElement('link')
        link.rel = 'shortcut icon'
        link.href = data.data.faviconUrl
        link.type = 'image/x-icon'
        document.getElementsByTagName('head')[0].appendChild(link)
        document.title = data.data.title
      }
    }
  }
</script>

<style scoped>
  html,body {
    height: 100%;
    min-height: 100%;
    background: #f5f5f5;
  }
  .el-header{
    width: 100%;
    padding: 0;
  }
  .define-main{
    padding: 0;
  }
  .el-main {
    background: #fff;
    position: absolute;
    margin-top: 60px;
    width: 100%;
    height: calc(100% - 60px);
  }
</style>




// WEBPACK FOOTER //
// src/layout/mainLayout.vue
