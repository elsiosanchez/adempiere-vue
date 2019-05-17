// Decode a HTML text
export function decodeHtml(text) {
  var processMetadata = document.createElement('div')
  processMetadata.innerHTML = text
  return processMetadata.childNodes[0].nodeValue
}

/**
 * Checks if value is empty. Deep-checks arrays and objects
 * Note: isEmpty([]) == true, isEmpty({}) == true, isEmpty([{0:false},"",0]) == true, isEmpty({0:1}) == false
 * @param   {boolean|array|object|number|string} value
 * @returns {boolean}
 */
export function isEmptyValue(value) {
  if (typeof value === 'undefined' || value == null) {
    return true
  } else if (typeof value === 'string') {
    return Boolean(!value.trim().length)
  } else if (typeof value === 'function' || typeof value === 'number' || typeof value === 'boolean' || Object.prototype.toString.call(value) === '[object Date]') {
    return false
  } else if (value.isArray) {
    return Boolean(!value.length)
  } else if (typeof value === 'object') {
    return Boolean(!Object.keys(value).length)
  }

  return true
}

/**
 * zero pad
 * @param {number} number
 * @param {number} pad
 * @returns {string}
 */
export function zeroPad(number, pad = 2) {
  var zero = Number(pad) - number.toString().length + 1
  return Array(+(zero > 0 && zero)).join('0') + number
}

/**
 * Get date and time from client in a object value
 * @param {string} type Type value of return
 * @returns {object|string}
 */
export function clientDateTime(type = '') {
  // get current date from client
  const date = new Date() // instance the objet Data
  const currentDate = date.getFullYear() + '-' + zeroPad(date.getMonth() + 1) + '-' + date.getDate()
  const currentTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  const currentDateTime = {
    date: currentDate,
    time: currentTime
  }

  if (type.toLowerCase() === 't') {
    return currentDateTime.time
  } else if (type.toLowerCase() === 'd') {
    return currentDateTime.date
  }
  return currentDateTime.date + ' ' + currentDateTime.time
}
