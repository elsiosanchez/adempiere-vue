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

// Parse Context String
export function parseContext(context, value) {
  if (value === null || value.length() === 0) { return '' }

  var instances = value.length() - value.replace('@', '').length()
  if ((instances > 0) && (instances % 2) !== 0) { // could be an email address
    return value
  }

  var token
  var inStr = String(value)
  var outStr = ''

  var i = inStr.indexOf('@')
  while (i !== -1) {
    outStr.append(inStr.substring(0, i)) // up to @
    inStr = inStr.substring(i + 1, inStr.length())	// from first @

    var j = inStr.indexOf('@') // next @
    if (j < 0) {
      console.log('No second tag: ' + inStr)
      return ''	//	no second tag
    }

    token = inStr.substring(0, j)

    context['columnName'] = token

    var ctxInfo = this.$store.getters.getContext(context)	// get context
    if (ctxInfo.length() === 0 && (token.startsWith('#') || token.startsWith('$'))) {
      context['parentUuid'] = null
      context['containerUuid'] = null
      ctxInfo = this.$store.getters.getContext(context)	// get global context
    }
    if (ctxInfo.length() === 0) {
      console.log('No Context for: ' + token)
    } else { outStr = outStr + '' + ctxInfo } // replace context with Context

    inStr = inStr.substring(j + 1, inStr.length())	// from second @
    i = inStr.indexOf('@')
  }
  outStr = outStr + '' + inStr	// add the rest of the string

  return outStr
}	//	parseContext

