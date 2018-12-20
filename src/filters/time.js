import moment from 'moment'

let customTime = value => {
  return moment(value).format('YYYY-MM-DD,HH:mm:ss')
}

export {
  customTime
}



// WEBPACK FOOTER //
// ./src/filters/time.js