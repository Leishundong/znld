import { Notification } from 'element-ui'
import store from '../store'
import router from '../router'

const notifyError = (message) => {
  return Notification({
    title: '错误',
    message: message,
    duration: 4000,
    type: 'error'
  })
}

// 请求
export const reqSuccess = (config) => {
  const token = store.getters.userToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}

export const reqError = (error) => {
  return Promise.reject(error)
}

// 响应
export const resSuccess = (res) => {
  return res
}

export const resError = (error) => {
  const res = error.response
  if (res) {
    switch (res.status) {
      case 400: // 客户端引起的异常
        notifyError(res.data.message)
        break
      case 401: // 没有携带有效的身份验证
        store.dispatch('logout')
        const currentRoute = router.currentRoute
        router.replace({ name: 'login', query: { redirect: currentRoute.name } })
        break
      case 403:
        notifyError('无权限, 请联系管理员！')
        break
      case 409: // 唯一性验证冲突
        notifyError('已存在')
        break
      case 422: // 请求参数字段验证不通过
        notifyError(res.data.message)
        break
      case 500: // 服务器内部错误
        notifyError('服务器错误')
        break
      case 502:
        notifyError('服务器忙！请稍后重试')
        break
    }
  } else {
    // notifyError(error.message)
    notifyError('网络连接错误')
  }
  return Promise.reject(error)
}



// WEBPACK FOOTER //
// ./src/http/interceptors.js