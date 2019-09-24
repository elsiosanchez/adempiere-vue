<template>
  <el-select
    v-model="value"
    :filterable="!isMobile"
    :placeholder="metadata.help"
    :loading="isLoading"
    value-key="key"
    class="select-base"
    clearable
    :disabled="Boolean(metadata.readonly || metadata.disabled)"
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
import { isEmptyValue, parseContext } from '@/utils/ADempiere'
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldSelect',
  mixins: [fieldMixin],
  data() {
    return {
      value: isEmptyValue(this.metadata.value) ? -1 : isNaN(this.metadata.value) ? this.metadata.value : parseInt(this.metadata.value, 10),
      isLoading: false,
      baseNumber: 10,
      options: [{
        label: ' ',
        key: -1
      }],
      othersOptions: [],
      blanckOption: {
        label: ' ',
        key: -1
      }
    }
  },
  computed: {
    getterValue() {
      var field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return isEmptyValue(field.value) ? -1 : isNaN(field.value) ? field.value : parseInt(field.value)
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
      if (allOptions.length > 0 && allOptions[0].key !== -1) {
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
      this.value = isEmptyValue(value) ? -1 : isNaN(value) ? value : parseInt(value)
    },
    // TODO: Verify peformance in props with watcher in panel or watch metadata.value.
    '$route.query.action'(actionValue) {
      if (actionValue === 'create-new') {
        // this.value = String(this.metadata.parsedDefaultValue).trim() === '' ? -1 : isNaN(this.metadata.parsedDefaultValue) ? this.metadata.parsedDefaultValue : parseInt(this.metadata.parsedDefaultValue)
        if (this.isEmptyValue(this.metadata.parsedDefaultValue)) {
          this.value = -1
        } else if (isNaN(this.metadata.parsedDefaultValue)) {
          this.value = this.metadata.parsedDefaultValue
        } else {
          this.value = parseInt(this.metadata.parsedDefaultValue)
        }
      } else {
        this.getDataTrigger()
      }
      if (!this.isEmptyValue(this.value) && this.options.length > 0 && this.options.find(item => item.key === this.value) === undefined) {
        this.getDataTrigger()
      }
    }
  },
  beforeMount() {
    this.options = this.getterLookupAll

    // enable to dataTable records
    if (this.metadata.displayColumn !== undefined) {
      var key = isEmptyValue(this.metadata.value) ? -1 : isNaN(this.metadata.value) ? this.metadata.value : parseInt(this.metadata.value)
      if (this.valueModel !== undefined) {
        key = this.valueModel
      }
      // verify if exists to add
      if (!this.options.find(option => option.key === key)) {
        this.othersOptions.push({
          key: key,
          label: this.metadata.displayColumn
        })
      }
      // join options in store with pased from props
      this.options = this.getterLookupAll.concat(this.othersOptions)
      this.value = key
    } else if (!this.options.find(item => item.key === this.value)) {
      this.getDataTrigger()
    }
  },
  methods: {
    parseContext,
    isEmptyValue,
    handleChange(value) {
      var label
      const selected = this.options.find(option => option.key === this.value)
      if (selected) {
        label = selected.label
      }
      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey,
          displayColumn: label,
          panelType: this.metadata.panelType
        })
      } else if (this.metadata.panelType === 'table') {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          isDontSendToEdit: false,
          panelType: this.metadata.panelType
        })
      } else if (this.metadata.isAvancedQuery) {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          isDontSendToEdit: true,
          panelType: this.metadata.panelType,
          isAvancedQuery: this.metadata.isAvancedQuery
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          displayColumn: label,
          newValue: this.value
        })
      }
    },
    getDataTrigger() {
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
          if (this.options.length > 0 && this.options[0].key !== -1) {
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
