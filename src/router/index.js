import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'
import store from '../store'
Vue.use(Router)

const router = new Router({
  mode: 'history', // history
  routes
})

router.beforeEach((to, from, next) => {
  const isValid = store.getters.isUserValid()
  if (to.name !== 'login' && !isValid) {
    next({
      name: 'login',
      query: {
        redirect: to.name
      }
    })
  } else {
    next()
  }
})

export default router



// WEBPACK FOOTER //
// ./src/router/index.js