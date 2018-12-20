import moment from 'moment'

export function getCurrentTime () {
  return moment().format('YYYY-MM-DD')
}

export function getYesterdayTime () {
  return moment().format('YYYY-MM')
}

export function getPreWeekTime () {
  return moment().subtract(7, 'days').format('YYYY-MM-DD')
}

/**
 * 根据经纬度计算出某天的日出和日落时间 ,时间值的示例：2018-04-24
 * @param {*} time
 * @param {*} longitude
 * @param {*} latitude
 */
export function getSunRiseTimeAndSunDownTime (time, longitude, latitude) {
  let now = new Date(time) // 输入日期以今日为例
  let NewYearsDay = new Date(now.getFullYear(), 0, 0, 0, 0, 0) // 该年第一天
  // 某个日期在该年中是第几天 ,算出两者的时间戳之差就是时间差的微秒数 再用时间差除以天的微秒数86400000 取整 就是第几天
  let dayInYearPos = (now.getTime() - NewYearsDay.getTime()) / 86400000 >>> 0
  // 日出时间=24(180+时区15-经度-ACOS(-TAN(-23.4COS(2π(日期序列数+9)/365)π/180)TAN(纬度π/180))180/π)/360
  let sunRiseTime = 24 * (180 + 8 * 15 - longitude - Math.acos(-1 * Math.tan(-23.4 * Math.cos(2 * Math.PI * (dayInYearPos + 9) / 365) * Math.PI / 180) * Math.tan(latitude * Math.PI / 180)) * 180 / Math.PI) / 360
  // 日落时间=24(1 + 时区15-经度)/180)-日出时间
  let sunDownTime = 24 * (1 + (8 * 15 - longitude) / 180) - sunRiseTime
  let riseHours = Math.floor(sunRiseTime)
  if (riseHours < 10) riseHours = '0' + riseHours
  let riseMin = Math.floor((sunRiseTime - Math.floor(sunRiseTime)) * 60)
  let downMin = Math.floor((sunDownTime - Math.floor(sunDownTime)) * 60)
  if (riseMin < 10) riseMin = `0${riseMin}`
  if (downMin < 10) downMin = `0${downMin}`
  return { sunRiseTime: riseHours + ':' + riseMin, sunDownTime: Math.floor(sunDownTime) + ':' + downMin }
}



// WEBPACK FOOTER //
// ./src/utils/time.js