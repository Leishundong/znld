<template>
  <section class="fullscreen">
    <div class="header-login">
      <div class="header-brand">
        <img v-if="isSubSystem === true" :src="logoUrl" alt="logo" class="header-brand-logo" />
        <span class="header-brand-title">{{title}}</span>
      </div>
      <div class="header-brand-desc">欢迎您</div>
    </div>

    <router-view />
  </section>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'user',

    data () {
      return {
        isSubSystem: false,
        title: '智慧路灯云',
        logoUrl: '',
        faviconUrl: ''
      }
    },

    computed: {
    },
/*    async created () {
      let host = location.host
      // let host = 'solariot.iot2.creekspring.com'
      let { data } = await axios.get(`/system/info?host=${host}`)
      if (data.success === true) {
        this.isSubSystem = true
        this.title = data.data.title
        this.logoUrl = data.data.logoUrl
        this.faviconUrl = data.data.faviconUrl
        let link = document.createElement('link')
        link.rel = 'shortcut icon'
        link.href = this.faviconUrl
        link.type = 'image/x-icon'
        document.getElementsByTagName('head')[0].appendChild(link)
        document.title = this.title
      }
    },*/
    mounted () {
    }
  }
</script>

<style scoped>
  .fullscreen {
    background: #f0f2f5;
    background-image: url('../../assets/images/app-bg.svg');
    width: 100%;
    min-height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
    padding: 110px 0 144px 0;
    position: relative;
  }

  .header-login {
    margin-bottom: 40px;
    text-align: center;
  }

  .header-brand {
    display: flex;
    margin-bottom: 8px;
    align-items: center;
    justify-content: center;
  }

  .header-brand-logo {
    margin-right: 10px;
    width: 48px;
    /* height: 48px; */
  }

  .header-brand-title {
    font-size: 2em;
    font-weight: bold;
    font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica, sans-serif;
    color: #000;
  }

  .header-brand-desc {
    color: #666;
  }
</style>



// WEBPACK FOOTER //
// src/views/user/user.vue
