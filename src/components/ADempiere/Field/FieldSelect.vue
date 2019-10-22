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
    @change="preHandleChange"
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
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        directQuery: this.metadata.reference.directQuery,
        tableName: this.metadata.reference.tableName,
        value: this.value
      })
    },
    getterLookupList() {
      return this.$store.getters.getLookupList({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        query: this.metadata.reference.query,
        tableName: this.metadata.reference.tableName
      })
    },
    getterLookupAll() {
      var allOptions = this.$store.getters.getLookupAll({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        query: this.metadata.reference.query,
        directQuery: this.metadata.reference.directQuery,
        tableName: this.metadata.reference.tableName,
        value: this.value
      })
      // TODO: Evaluate -1 when list is string key
      if (allOptions.length && !allOptions[0].key) {
        allOptions.unshift(this.blanckOption)
      }
      return allOptions
    }
  },
  watch: {
    valueModel(value) {
      this.value = this.validateValue(value)
    },
    // TODO: Verify peformance in props with watcher in panel or watch metadata.value.
    '$route.query.action'(actionValue) {
      if (actionValue === 'create-new' && this.metadata.panelType === 'window') {
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
    // TODO: Evlauate values with empty string or number in 0
    if (this.metadata.displayColumn) {
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
    preHandleChange(value) {
      const label = this.findLabel(this.value)
      this.handleChange(value, undefined, label)
    },
    validateValue(value) {
      if (['Table', 'TableDirect'].includes(this.metadata.referenceType)) {
        return this.isEmptyValue(value) ? undefined : parseInt(value, 10)
      }
      // return this.isEmptyValue(value) ? -1 : isNaN(value) ? value : parseInt(value, 10)
      if (this.isEmptyValue(value)) {
        return undefined
      } else if (isNaN(value)) {
        return value
      } else {
        return parseInt(value, 10)
      }
    },
    validateBlanckOption() {
      // TODO: Evaluate -1 when list is string key
      if (this.options.length <= 0 || (this.options.length && this.isEmptyValue(this.options[0].key))) {
        this.options.unshift(this.blanckOption)
      }
    },
    findLabel(value) {
      const selected = this.options.find(item => item.key === value)
      if (selected) {
        return selected.label
      }
      return selected
    },
    async getDataLookupItem() {
      this.isLoading = true
      this.$store.dispatch('getLookupItemFromServer', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        tableName: this.metadata.reference.tableName,
        directQuery: this.metadata.reference.directQuery,
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
        })
        .finally(() => {
          this.isLoading = false
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
      this.$store.dispatch('getLookupListFromServer', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        tableName: this.metadata.reference.tableName,
        query: this.metadata.reference.query
      })
        .then(response => {
          this.options = this.getterLookupAll.concat(this.othersOptions)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    clearLookup() {
      this.$store.dispatch('deleteLookupList', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        tableName: this.metadata.reference.tableName,
        query: this.metadata.reference.query,
        directQuery: this.metadata.reference.directQuery,
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
