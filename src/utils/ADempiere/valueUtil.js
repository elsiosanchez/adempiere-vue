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
  } else if (Array.isArray(value)) {
    return Boolean(!value.length)
  } else if (typeof value === 'object') {
    return Boolean(!Object.keys(value).length)
  }

  return true
}

export function typeValue(value) {
  if (typeof value === 'undefined' || value == null) {
    return value
  } else if (typeof value === 'string') {
    return 'STRING'
  } else if (typeof value === 'function') {
    return 'FUNCTION'
  } else if (typeof value === 'number') {
    if (value.isInteger()) {
      return 'INTEGER'
    } else {
      return 'NUMBER'
    }
  } else if (typeof value === 'boolean') {
    return 'BOOLEAN'
  } else if (Object.prototype.toString.call(value) === '[object Date]') {
    return 'DATE'
  } else if (Array.isArray(value)) {
    return 'ARRAY'
  } else if (typeof value === 'object') {
    return 'OBJECT'
  }
  return value
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
export function clientDateTime(date = null, type = '') {
  if (typeof date === 'string') {
    // instance the objet Data with date or time send
    date = new Date(date)
  } else {
    // instance the objet Data with current date from client
    date = new Date()
  }

  const currentDate = date.getFullYear() +
    '-' + zeroPad(date.getMonth() + 1) +
    '-' + zeroPad(date.getDate())

  const currentTime = date.getHours() +
    ':' + date.getMinutes() +
    ':' + date.getSeconds()

  const currentDateTime = {
    date: currentDate,
    time: currentTime
  }

  if (type.toLowerCase() === 't') {
    // time format HH:II:SS
    return currentDateTime.time
  } else if (type.toLowerCase() === 'd') {
    // date format YYYY-MM-DD
    return currentDateTime.date
  } else if (type.toLocaleLowerCase() === 'o') {
    // object format
    return currentDateTime
  }
  return currentDateTime.date + ' ' + currentDateTime.time
}
