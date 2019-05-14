// Check if a string value have data
export function checkStringValue(text) {
  if (typeof text !== 'undefined' && (text.trim() !== '' || text.length > 1)) {
    return true
  }
}

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
