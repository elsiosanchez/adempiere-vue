<template>
  <el-select
    v-model="value"
    :filterable="!isMobile"
    :placeholder="metadata.help"
    :loading="isLoading"
    value-key="key"
    class="select-base"
    clearable
    :disabled="isDisabled"
    @change="handleChange"
    @visible-change="getDataLookupList"
    @clear="clearLookup"
  >
    <el-option
      v-for="(item, key) in options"
      :key="key"
      :value="item.key"
      :label="item.label"
    />
  </el-select>
</template>

<script>
import { parseContext } from '@/utils/ADempiere'
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldSelect',
  mixins: [fieldMixin],
  data() {
    return {
      value: this.validateValue(this.metadata.value),
      isLoading: false,
      baseNumber: 10,
      options: [{
        label: ' ',
        key: undefined
      }],
      othersOptions: [],
      blanckOption: {
        label: ' ',
        key: undefined
      },
      blancksValues: [null, -1, '', undefined]
    }
  },
  computed: {
    getterValue() {
      var field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return this.validateValue(field.value)
      }
      return undefined
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterLookupItem() {
      return this.$store.getters.getLookupItem({
        parsedDirectQuery: this.parsedDirectQuery,
        tableName: this.metadata.reference.tableName,
        value: this.value
      })
    },
    getterLookupList() {
      return this.$store.getters.getLookupList({
        parsedQuery: this.parsedQuery,
        tableName: this.metadata.reference.tableName
      })
    },
    getterLookupAll() {
      var allOptions = this.$store.getters.getLookupAll({
        parsedQuery: this.parsedQuery,
        parsedDirectQuery: this.parsedDirectQuery,
        tableName: this.metadata.reference.tableName,
        value: this.value
      })
      // TODO: Evaluate -1 when list is string key
      if (allOptions.length && !allOptions[0].key) {
        allOptions.unshift(this.blanckOption)
      }
      return allOptions
    },
    parsedQuery() {
      return this.parseContext({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        value: this.metadata.reference.query
      })
    },
    parsedDirectQuery() {
      return this.parseContext({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        value: this.metadata.reference.directQuery
      })
    }
  },
  watch: {
    valueModel(value) {
      this.value = this.validateValue(value)
    },
    // TODO: Verify peformance in props with watcher in panel or watch metadata.value.
    '$route.query.action'(actionValue) {
      if (actionValue === 'create-new') {
        this.value = this.validateValue(this.metadata.parsedDefaultValue)
      }
      if (!this.isEmptyValue(this.value) && !this.findLabel(this.value)) {
        this.getDataLookupItem()
      }
    },
    'metadata.displayed'(value, oldValue) {
      if (value) {
        if (!this.isEmptyValue(this.value) && !this.findLabel(this.value)) {
          this.getDataLookupItem()
        }
      }
    }
  },
  beforeMount() {
    this.options = this.getterLookupAll

    // enable to dataTable records
    if (this.metadata.displayColumn !== undefined && this.metada.displayColumn === null) {
      var key = this.validateValue(this.metadata.value)
      if (this.valueModel !== undefined && this.validateValue !== null) {
        key = this.valueModel
      }
      // verify if exists to add
      if (!this.findLabel(key)) {
        this.othersOptions.push({
          key: key,
          label: this.metadata.displayColumn
        })
      }
      // join options in store with pased from props
      this.options = this.getterLookupAll.concat(this.othersOptions)
      this.value = key
    } else if (!this.isEmptyValue(this.value) && (!this.findLabel(this.value) && this.metadata.displayed)) {
      this.getDataLookupItem()
    }
  },
  methods: {
    parseContext,
    preHandleChange(value) {
      const label = this.findLabel(this.value)
      this.handleChange(value, undefined, label)
    },
    validateValue(value) {
      // return this.isEmptyValue(value) ? -1 : isNaN(value) ? value : parseInt(value, 10)
      if (this.isEmptyValue(value)) {
        return undefined
      } else if (isNaN(value)) {
        return value
      } else {
        return parseInt(value, 10)
      }
    },
    findLabel(value) {
      const selected = this.options.find(item => item.key === value)
      if (selected) {
        return selected.label
      }
      return selected
    },
    getDataLookupItem() {
      this.isLoading = true
      this.$store.dispatch('getLookup', {
        tableName: this.metadata.reference.tableName,
        directQuery: this.parsedDirectQuery,
        value: this.value
      })
        .then(response => {
          if (this.metadata.panelType === 'window') {
            this.$store.dispatch('notifyFieldChangeDisplayColumn', {
              containerUuid: this.metadata.containerUuid,
              columnName: this.metadata.columnName,
              displayColumn: response.label
            })
          }
          this.options = this.getterLookupAll.concat(this.othersOptions)
          if (this.options.length && !this.options[0].key) {
            this.options.unshift(this.blanckOption)
          }
          this.isLoading = false
        })
        .catch(error => {
          console.warn('Get Lookup, Select Base - Error ' + error.code + ': ' + error.message)
        })
    },
    /**
     * @param {boolean} show triggers when the pull-down menu appears or disappears
     */
    getDataLookupList(showList) {
      if (showList) {
        if (this.getterLookupList.length === 0) {
          this.remoteMethod()
        }
      }
    },
    remoteMethod() {
      this.isLoading = true
      this.$store.dispatch('getLookupList', {
        tableName: this.metadata.reference.tableName,
        query: this.parsedQuery
      })
        .then(response => {
          this.options = this.getterLookupAll.concat(this.othersOptions)
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          console.warn('Get Lookup List, Select Base - Error ' + error.code + ': ' + error.message)
        })
    },
    clearLookup() {
      this.$store.dispatch('deleteLookupList', {
        tableName: this.metadata.reference.tableName,
        parsedQuery: this.parsedQuery,
        parsedDirectQuery: this.parsedDirectQuery,
        value: this.value
      })
      // TODO: Evaluate if is number -1 or string '' (or default value)
      this.value = this.blanckOption.key
    }
  }
}
</script>

<style scoped>
  .select-base {
    width: 100%;
  }
</style>
