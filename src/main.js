// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
// 统一基础样式
/*import 'normalize.css'
import './assets/css/app.css'
import './assets/css/overwrite.css'
import './assets/css/common.css'*/
// 组件库
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 地图
import AMap from 'vue-amap'
// 过滤器
import * as time from './filters/time'
import VueIntro from 'vue-introjs'
import 'intro.js/introjs.css'
import 'intro.js/themes/introjs-modern.css'
Object.keys(time).forEach(key => {
  Vue.filter(key, time[key])
})

Vue.use(ElementUi)
Vue.use(AMap)
// Vue.use(VueIntro)

AMap.initAMapApiLoader({
  key: 'fa35fb3d5c214764a904c2980b1625b7',
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'MarkerClusterer'
  ]
})
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})



// WEBPACK FOOTER //
// ./src/main.js
