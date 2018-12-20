import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaLog } from '../schemas'
import axios from 'axios'

/**
 * 获取操作日志列表
 * @param {*String} options.deviceId 设备id
 * @param {*Number} options.currentPage 页码
 * @param {String} options.date 日期
 */
export const find = async ({ deviceId, currentPage, date } = {}) => {
  const { data } = await axios.get(`v2/solar-motes/audit-info/${deviceId}`, {
    params: {
      pageNo: currentPage,
      dateStr: date
    }
  })
  const { entities } = normalize(data, [ schemaLog ])
  return fromJS(entities)
}



// WEBPACK FOOTER //
// ./src/http/modules/log.js