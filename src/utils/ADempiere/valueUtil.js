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
