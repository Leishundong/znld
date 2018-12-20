const sessionStorage = window.sessionStorage
const localStorage = window.localStorage

// session storage
export const setSessionStorage = (key, value) => {
  if (value instanceof Object) {
    value = JSON.stringify(value)
  }
  sessionStorage.setItem(key, value)
}

export const getSessionStorage = (key) => {
  let value = sessionStorage.getItem(key) || null
  try {
    value = JSON.parse(value)
  } catch (error) {}
  return value
}

export const removeSessionStorage = (key) => {
  sessionStorage.remove(key)
}

export const clearSessionStorage = () => {
  sessionStorage.clear()
}

// local storage
export const setLocalStorage = (key, value) => {
  if (value instanceof Object) {
    value = JSON.stringify(value)
  }
  localStorage.setItem(key, value)
}

export const getLocalStorage = (key) => {
  let value = localStorage.getItem(key) || null
  try {
    value = JSON.parse(value)
  } catch (error) {}
  return value
}

export const removeLocalStorage = (key) => {
  localStorage.remove(key)
}

export const clearLocalStorage = () => {
  localStorage.clear()
}

/**
 * 版本号
 * @type VERSION_KEY：key值
 */
const VERSION_KEY = 'lamp_version'
// 获取版本号
export const getVersion = () => {
  let getVersion = localStorage.getItem(VERSION_KEY, null)
  return getVersion
}
// 修改版本号
export const setVersion = version => {
  localStorage.setItem(VERSION_KEY, version)
  return version
}



// WEBPACK FOOTER //
// ./src/tools/storage.js