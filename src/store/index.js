import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, actions, mutations } from './root'
Vue.use(Vuex)

const modules = {}
const storeModules = require.context('./modules', false, /\.js$/)
storeModules.keys().forEach(item => {
  const name = item.match(/\w*\.js$/)[0].slice(0, -3)
  const store = storeModules(item).default
  modules[name] = store
});

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  modules
})



// WEBPACK FOOTER //
// ./src/store/index.js
