<template>
  <el-container>
    <el-header>
      <header-bar></header-bar>
    </el-header>
    <el-main>
      <nav-bar></nav-bar>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
      <!-- <router-view></router-view> -->
    </el-main>
  </el-container>
</template>

<script>
  import headerBar from '../components/header'
  import navBar from '../components/navbar'
  import axios from 'axios'
  export default {
    components: {
      headerBar,
      navBar
    },
    methods: {
      // 小屏适配
      // resizeHeight () {
      //   let mapContainer = document.getElementById('mapContainer')
      //   let deviceLeftBar = document.getElementById('deviceLeftBar')
      //   if (mapContainer) {
      //     mapContainer.style.height = `${window.innerHeight - 155}px`
      //     deviceLeftBar.style.height = `${window.innerHeight - 140}px`
      //   }
      // }
    },
    mounted () {
      // this.resizeHeight()
      // let self = this
      // window.onresize = function () {
      //   self.resizeHeight()
      // }
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
    padding: 0;
  }
  .el-main {
    background: #fff;
  }
</style>




// WEBPACK FOOTER //
// src/layout/layout.vue