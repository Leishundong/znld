import axios from 'axios'
import { reqSuccess, reqError, resSuccess, resError } from './interceptors'

axios.defaults.baseURL = 'http://localhost:8081/api'
axios.defaults.timeout = 10000
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.interceptors.request.use(reqSuccess, reqError)
axios.interceptors.response.use(resSuccess, resError)

const http = {}
const httpModules = require.context('./modules', false, /\.js$/)


httpModules.keys().forEach(item => {
  const name = item.match(/\w*\.js$/)[0].slice(0, -3)
  const methods = httpModules(item);
  http[name] = methods
});

export default http



// WEBPACK FOOTER //
// ./src/http/index.js
