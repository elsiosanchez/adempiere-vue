/**
 * Class Context from ADempiere
 * Contributor(s): Edwin Betanc0urt <EdwinBetanc0urt@outlook.com>
 */
class Context {
  constructor(lang = 'en_US') {
    this.lang = lang
    this.containers = {}
    this.UI = 'VueUI'
    this.Login = {}
    this.Login.RememberMe = null

    this.org = {}
    this.org.compiere = {}
    this.org.compiere.model = {}
    this.org.compiere.model.DefaultRole = null
    this.servlet = {}
    this.servlet.sessionId = null
  }

  /**
   *
   * @param {string | object} key
   * @param {mixed} val
   */
  setContext(key, val = null) {
    if (typeof (key) === 'object') {
      for (const i in key) {
        Object.defineProperty(this, i, {
          value: key[i],
          configurable: true,
          enumerable: true,
          writable: true
        })
      }
    } else {
      Object.defineProperty(this, key, {
        value: val,
        configurable: true,
        enumerable: true,
        writable: true
      })
    }
  }

  /**
   * Set especific context variables Account
   * @param {string | object} key Name of attibute or property
   * @param {string} value Value assinged to key
   */
  setContextAccount(key, value = '') {
    if (typeof (key) === 'object') {
      for (const i in key) {
        if (i.indexOf('$') === -1) {
          this['$' + i] = key[i]
        } else {
          this[i] = key[i]
        }
      }
    } else {
      if (key.indexOf('$') === -1) {
        this['$' + key] = value
      } else {
        this[key] = value
      }
    }
  }

  /**
   *
   */
  setContextField(uuidContainer, uuidSubContainer, value, key = null) {
    if (this.containers.hasOwnProperty(uuidContainer)) {
      if (this.containers[uuidContainer].hasOwnProperty(uuidSubContainer)) {
        this.containers[uuidContainer][uuidSubContainer][key] = value
      } else {
        // Not exists sub containers
        this.containers[uuidContainer][uuidSubContainer] = {}
        this.containers[uuidContainer][uuidSubContainer][key] = value
      }
    } else {
      // Not exists container, subcontainers
      this.containers[uuidContainer] = {}
      this.containers[uuidContainer][uuidSubContainer] = {}
      this.containers[uuidContainer][uuidSubContainer][key] = value
    }
    // console.log(this.containers)
  }

  /**
   *
   * @param {string} uuidContainer identifier to Container
   * @param {string} uuidSubContainer identifier to Container
   */
  setActiveSubContainer(uuidContainer, uuidSubContainer) {
    if (this.containers.hasOwnProperty(uuidContainer)) {
      if (this.containers[uuidContainer].hasOwnProperty(uuidSubContainer)) {
        for (const i in this.containers[uuidContainer][uuidSubContainer]) {
          Object.defineProperty(this.containers[uuidContainer], i, {
            value: this.containers[uuidContainer][uuidSubContainer][i],
            configurable: true,
            enumerable: true,
            writable: true
          })
        }
      }
    }
    // console.log('Set Active Sub Container ' + uuidContainer)
  }

  /**
   *
   * @param {string} uuidContainer identifier to Container
   * @param {object} values Key values
   */
  setFirstSubContainer(uuidContainer, values) {
    if (this.containers.hasOwnProperty(uuidContainer)) {
      for (const i in values) {
        Object.defineProperty(this.containers[uuidContainer], i, {
          value: values[i],
          configurable: true,
          enumerable: true,
          writable: true
        })
      }
    }
    // console.log('Set First Sub Container ' + uuidContainer)
  }

  getContext() {
    return this
  }

  /**
   *
   * @param {string} key Attribute to getter
   * @returns {string | object}
   */
  getContextAccount(key = null) {
    if (key === null) {
      const retunrAccount = {}
      for (const i in this) {
        if (i.indexOf('$') !== -1) {
          // Object.defineProperty(retunrAccount, i, {
          //   value: i,
          //   configurable: true,
          //   enumerable: true,
          //   writable: true
          // });
          retunrAccount[i] = this[i]
        }
      }
      return retunrAccount
    } else {
      if (key.indexOf('$') !== -1) {
        return this[key]
      }
      return this['$' + key]
    }
  }

  /**
   *
   * @return {object} global properties not Account and not Containers
   */
  getContextGlobal() {
    const returnGlobal = {}
    for (const i in this) {
      if (i.indexOf('$') === -1 && i !== 'function' && i !== 'containers') {
        // Object.defineProperty(returnGlobal, i, {
        //   value: i,
        //   configurable: true,
        //   enumerable: true,
        //   writable: true
        // });
        returnGlobal[i] = this[i]
      }
    }
    return returnGlobal
  }

  /**
   * get Container (Window)
   * @param {string} uuidContainer identifier to Container
   * @param {string} key
   */
  getContextContainer(uuidContainer = null, key = null) {
    if (uuidContainer === null || uuidContainer === '') {
      return this.containers
    }
    if (this.containers.hasOwnProperty(uuidContainer)) {
      return this.containers[uuidContainer]
    } else {
      return undefined
    }
  }

  /**
   * get Sub Container (Tabs)
   * @param {string} uuidContainer
   * @param {string} uuidSubContainer
   * @param {string} key
   */
  getContextSubContainer(uuidContainer, uuidSubContainer = null) {
    if (uuidContainer === null || uuidContainer === '' || uuidSubContainer === null || uuidSubContainer === '') {
      return undefined
    }
    const getContainer = this.getContextContainer(uuidContainer)
    if (typeof getContainer === undefined) {
      return undefined
    } else if (uuidSubContainer === null || uuidSubContainer === '') {
      // return array with all subContainers
      return getContainer
    } else if (getContainer.hasOwnProperty(uuidSubContainer)) {
      return getContainer[uuidSubContainer]
    } else {
      return undefined
    }
  }

  /**
   * Get Field Context
   * @param {string} uuidContainer
   * @param {string} uuidSubContainer
   * @param {string} field
   * @param {string} key
   */
  getContextField(uuidContainer, uuidSubContainer, field = null) {
    if (uuidContainer === null || uuidContainer === '' || uuidSubContainer === null || uuidSubContainer === '') {
      return undefined
    } else if (this.containers.hasOwnProperty(uuidContainer)) {
      if (this.containers[uuidContainer].hasOwnProperty(uuidSubContainer)) {
        if (field === null || field === '') {
          return this.containers[uuidContainer][uuidSubContainer]
        } else if (this.containers[uuidContainer][uuidSubContainer].hasOwnProperty(field)) {
          return this.containers[uuidContainer][uuidSubContainer][field]
        } else {
          return undefined
        }
      }
    } else {
      return undefined
    }
  }

  /**
   * Clear context variables in Container from uuidContainer
   * @param {string} uuidContainer
   */
  clearContextContainer(uuidContainer = null) {
    if (uuidContainer === null || uuidContainer === '') {
      // clear all containers
      this.containers = {}
    } else {
      if (this.containers.hasOwnProperty(uuidContainer)) {
        delete this.containers[uuidContainer]
      }
    }
  }

  /**
   * Clear especific context variables Account or all
   * @param {string} key Name of attibute
   */
  clearContextAccount(key = null) {
    if (key !== null) {
      if (key.indexOf('$') === -1) {
        delete this['$' + key]
      } else {
        delete this[key]
      }
    } else {
      for (const i in this) {
        if (i.indexOf('$') !== -1) {
          delete this[i]
        }
      }
    }
  }
}

export default Context
