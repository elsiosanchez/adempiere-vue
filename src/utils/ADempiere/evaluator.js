// This class is used for evaluate a conditional
// format := {expression} [{logic} {expression}]<br>
// expression := @{context}@{operand}{value} or @{context}@{operand}{value}<br>
// logic := {|}|{&}<br>
// context := any global or window context <br>
// value := strings or numbers<br>
// logic operators	:= AND or OR with the previous result from left to right <br>
// operand := eq{=}, gt{&gt;}, le{&lt;}, not{~^!} <br>
// Examples: <br>
// @AD_Table_ID@=14 | @Language@!GERGER <br>
// @PriceLimit@>10 | @PriceList@>@PriceActual@<br>
// @Name@>J<br>
// Strings may be in single quotes (optional)
class evaluator {
  /**
   * Evaluate logic's
   * @param {string} parentUuid Parent (Window / Process / Smart Browser)
   */
  static evaluateLogic(objectToEvaluate) {
    var defaultUndefined = false
    if (objectToEvaluate.type === 'displayed') {
      defaultUndefined = true
    }
    // empty logic
    if (typeof objectToEvaluate.logic === 'undefined' ||
      objectToEvaluate.logic === null ||
      objectToEvaluate.logic.trim() === '') {
      return defaultUndefined
    }
    var st = objectToEvaluate.logic.trim().replace('\n', '')
    st = st.replace('|', '~')
    var expr = /(~|&)/
    var stList = st.split(expr)
    var it = stList.length

    if (((it / 2) - ((it + 1) / 2)) === 0) {
      console.log(
        'Logic does not comply with format "<expression> [<logic> <expression>]"' +
        '  -->  ' + objectToEvaluate.logic
      )
      return defaultUndefined
    }

    var retValue = null
    var logOp = ''
    stList.forEach(function(element) {
      if (element === '~' || element === '&') {
        logOp = element
      } else if (retValue === null) {
        retValue = evaluator.evaluateLogicTuples({
          ...objectToEvaluate,
          conditional: element
        })
      } else {
        if (logOp === '&' && logOp !== '') {
          retValue = retValue & evaluator.evaluateLogicTuples({
            ...objectToEvaluate,
            conditional: element
          })
        } else if (logOp === '~' && logOp !== '') {
          retValue = retValue | evaluator.evaluateLogicTuples({
            ...objectToEvaluate,
            conditional: element
          })
        } else {
          console.log("Logic operant '|' or '&' expected  -->  " + objectToEvaluate.logic)
          return defaultUndefined
        }
      }
    })
    return Boolean(retValue)
  } //  evaluateLogic

  /**
   * Evaluate Logic Tuples
   * @param {object} objectToEvaluate Complete object
   * @param {string} logic If is displayed or not (mandatory and readonly)
   * @return {boolean}
   */
  static evaluateLogicTuples(objectToEvaluate) {
    var _defaultUndefined = false
    if (objectToEvaluate.type === 'displayed') {
      _defaultUndefined = true
    }
    var logic = objectToEvaluate.conditional
    // not context info, not logic
    if (typeof logic === 'undefined') {
      return _defaultUndefined
    }
    var expr = /^(['"@a-zA-Z0-9\-_]){0,}((!*={1})|(!{1})|(<{1})|(>{1}))(["'@a-zA-Z0-9\-_]){0,}$/i
    var st = expr.test(logic)

    if (!st) {
      console.log(
        ".Logic tuple does not comply with format '@context@=value' where operand" +
        " could be one of '=!^><'  -->  " + logic
      )
      return _defaultUndefined
    }
    expr = /(!*={1})/
    st = logic.split(expr)
    if (st.length === 1) {
      expr = /(<{1})/
      st = logic.split(expr)
    }
    if (st.length === 1) {
      expr = /(>)/
      st = logic.split(expr)
    }
    // First Part
    var first = st[0]
    var firstEval = first
    expr = /@/
    if (expr.test(first)) {
      first = first.replace(/@/g, '').trim()
      var value = objectToEvaluate.context.getContext({
        parentUuid: objectToEvaluate.parentUuid,
        containerUuid: objectToEvaluate.containerUuid,
        columnName: first
      })
      // in context exists this column name
      if (typeof value === 'undefined') {
        console.log(
          '.The column ' + first + ' not exists in context.'
        )
        return _defaultUndefined
      }
      firstEval = value	// replace with it's value
    }

    if (firstEval === null) {
      return _defaultUndefined
    }
    if (typeof firstEval !== 'boolean') {
      firstEval = firstEval.replace(/['"]/g, '').trim()	// strip ' and "
    }

    //	Operator
    var operand = st[1]
    //	Second Part
    var second = st[2]
    var secondEval = second
    if (second.indexOf('@') !== -1) {
      second = second.replace('@', ' ').trim() // strip tag
      secondEval = objectToEvaluate.context.getContext({
        parentUuid: objectToEvaluate.parentUuid,
        containerUuid: objectToEvaluate.containerUuid,
        columnName: first
      })	//	replace with it's value
    }
    secondEval = secondEval.replace(/['"]/g, '').trim()	//	strip ' and "

    //	Handling of ID compare (null => 0)
    if (first.indexOf('_ID') !== -1 && firstEval.length === 0) { firstEval = '0' }
    if (second.indexOf('_ID') !== -1 && secondEval.length === 0) { secondEval = '0' }

    //	Logical Comparison
    var result = this.evaluateLogicTuple(firstEval, operand, secondEval)

    return result
  }

  /**
   * Evuale logic Tuple
   * @param {string|number} value1 Value in Context
   * @param {string} operand Comparison
   * @param {string|number} value2 Value in Logic
   * @return {boolean}
   */
  static evaluateLogicTuple(value1, operand, value2) {
    // Convert value 1 string value to boolean value
    if (value1 === 'Y') {
      value1 = true
    } else if (value1 === 'N') {
      value1 = false
    }

    // Convert value 2 string value to boolean value
    if (value2 === 'Y') {
      value2 = true
    } else if (value2 === 'N') {
      value2 = false
    }

    if (value1 == null || operand == null || value2 == null) {
      return false
    }
    if (operand === '=') {
      return value1 === value2
    } else if (operand === '<') {
      return value1 < value2
    } else if (operand === '>') {
      return value1 > value2
    } else {
      //	interpreted as not
      return value1 !== value2
    }
  }

  /**
   * Parse Depends or relations
   * @param {string} parseString
   * @return {array}
   */
  static parseDepends(parseString) {
    var listFields = []
    if (parseString === null || typeof parseString === 'undefined') {
      // return array empy
      return listFields
    }

    let string = parseString.replace('@SQL=', '')
    //  while we have variables

    while (string.indexOf('@') !== -1) {
      let pos = string.indexOf('@')
      // remove first @: @ExampleColumn@ = ExampleColumn@
      string = string.substring(pos + 1)

      pos = string.indexOf('@')
      if (pos === -1) {
        continue
      }	//	error number of @@ not correct

      // remove second @: ExampleColumn@ = ExampleColumn
      const value = string.substring(0, pos)

      // add column name in array
      listFields.push(value)
    }
    return listFields
  }
}

export default evaluator
