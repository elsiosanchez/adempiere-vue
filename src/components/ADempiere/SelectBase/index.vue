<template>
  <el-select
    v-model="value"
    :filterable="!isMobile"
    :placeholder="metadata.help"
    :loading="loading"
    value-key="key"
    class="select-base"
    clearable
    :disabled="metadata.readonly || metadata.disabled"
    @change="handleChange"
    @visible-change="getDataLookupList"
    @clear="clearLookup"
  >
    <el-option
      v-for="(item, key) in options"
      :key="key"
      :value="String(item.key)"
      :label="item.label"
    />
  </el-select>
</template>

<script>
import { isEmptyValue, parseContext } from '@/utils/ADempiere'

export default {
  name: 'SelectBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    valueModel: {
      type: [Array, String, Number],
      default: () => ([])
    }
  },
  data() {
    return {
      value: this.metadata.value,
      loading: false,
      options: [],
      list: [],
      showControls: true,
      blanckOption: {
        label: ' ',
        value: -1
      }
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterOptions() {
      var lookupList = this.$store.getters.getLookupList({
        parsedQuery: this.parsedQuery,
        tableName: this.metadata.reference.tableName
      })
      return lookupList
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
      this.value = value
    }
  },
  created() {
    this.options = this.getterOptions
    // this.getData()
  },
  beforeMount() {
    if (this.metadata.defaultValue === -1 || this.metadata.defaultValue === '-1') {
      this.options.push(this.blanckOption)
      this.value = ''
    } else {
      this.remoteMethod()
    }

    // enable to dataTable records
    if (this.metadata.displayColumn !== undefined) {
      var key = this.metadata.value
      if (this.valueModel !== undefined) {
        key = this.valueModel
      }
      if (this.options.find(option => option.key === key) === undefined) {
        this.options.push({
          key: key,
          label: this.metadata.displayColumn
        })
      }
      this.value = key
    }
  },
  methods: {
    parseContext,
    isEmptyValue,
    handleChange() {
      if (this.metadata.inTable) {
        var selected = this.options.find(option => option.key === this.value)
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey,
          displayColumn: selected.label
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value
        })
      }
    },
    getData() {
      var value
      if (!this.isEmptyValue(this.metadata.value)) {
        value = this.metadata.value
      } else if (!this.isEmptyValue(this.valueModel)) {
        value = this.valueModel
      }

      this.getDataTrigger(this.metadata.reference.tableName, this.parsedDirectQuery, value)
    },
    getDataTrigger(tableName, directQuery, value) {
      this.$store.dispatch('getLookup', {
        tableName: tableName,
        directQuery: directQuery,
        value: value
      })
        .then(response => {
          this.value = response.label
          this.options.push(response)
          this.options.unshift(this.blanckOption)
        })
        .catch(err => {
          console.warn('Get Lookup, Select Base - Error ' + err.code + ': ' + err.message)
        })
    },
    /**
     * @param {boolean} show triggers when the pull-down menu appears or disappears
     */
    getDataLookupList(showList) {
      if (showList) {
        if (this.getterOptions.length > 0) {
          this.options = this.getterOptions
        } else {
          this.remoteMethod()
        }
      }
    },
    remoteMethod() {
      this.loading = true
      this.$store.dispatch('getLookupList', {
        tableName: this.metadata.reference.tableName,
        query: this.parsedQuery
      })
        .then(response => {
          this.loading = false
          this.options = response
          this.options.unshift(this.blanckOption)
        })
        .catch(err => {
          this.loading = false
          console.warn('Get Lookup List, Select Base - Error ' + err.code + ': ' + err.message)
        })
    },
    clearLookup() {
      this.$store.dispatch('deleteLookupList', {
        tableName: this.metadata.reference.tableName,
        parsedQuery: this.parsedQuery,
        parsedDirectQuery: this.parsedDirectQuery,
        value: this.value
      })
      this.options.push(this.blanckOption)
    }
  }
}
</script>

<style scoped>
  .select-base {
    width: 100%;
  }
</style>
