<template>
  <el-select
    v-model="value"
    :filterable="true"
    :placeholder="metadata.help"
    :loading="loading"
    value-key="key"
    @change="handleChange"
    @visible-change="getDataLookupList"
  >
    <el-option
      v-for="(item, key) in options"
      :key="key"
      :label="item.label"
      :value="item.key"
    />
  </el-select>
</template>

<script>
import { parseContext } from '@/utils/ADempiere'

export default {
  name: 'SelectBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    valueModel: {
      type: [Object, Array, String, Number],
      default: () => ({})
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
        label: '',
        value: -1
      }
    }
  },
  computed: {
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
    // valueModel: function() {
    //   this.value = this.valueModel
    // },
    // value() {
    //   if (this.value === -1 || this.value === '-1') {
    //     this.value = ''
    //   }
    // }
    'metadata.isShowedFromUser': function(value) {
      if (value) {
        this.getData()
      }
    }
  },
  beforeMount() {
    if (this.metadata.defaultValue === -1 || this.metadata.defaultValue === '-1') {
      this.options.push(this.blanckOption)
    }
    if (typeof this.metadata.displayColumn !== 'undefined') {
      this.options.push({
        key: this.metadata.value,
        label: this.metadata.displayColumn
      })
    }
    // if (this.metadata.isShowedFromUser || (this.metadata.isMandatory && this.metadata.isMandatoryFromLogic)) {
    //   if (this.metadata.value === '' && this.valueModel !== '') {
    //     this.metadata.value = this.valueModel
    //   }
    //   this.getData()
    // }
  },
  mounted() {
    this.$store.dispatch('setContext', {
      parentUuid: this.metadata.parentUuid,
      containerUuid: this.metadata.containerUuid,
      columnName: this.metadata.columnName,
      value: this.value
    })
  },
  methods: {
    parseContext,
    getData() {
      if (this.metadata.value !== '') {
        this.value = this.metadata.value
      }
      this.$store.dispatch('getLookup', {
        tableName: this.metadata.reference.tableName,
        directQuery: this.parsedDirectQuery,
        value: this.value
      })
        .then(response => {
          this.value = response.label
          this.options.push(response)
          this.options.push(this.blanckOption)
        })
        .catch(err => {
          console.warn('DataRecord, Select Base - Error ' + err.code + ': ' + err.message)
        })
    },
    /**
     * @param {boolean} show triggers when the pull-down menu appears or disappears
     */
    getDataLookupList(showList) {
      if (showList) {
        var lookupList = this.$store.getters.getLookupList({
          parsedQuery: this.parsedQuery,
          tableName: this.metadata.reference.tableName
        })
        if (typeof lookupList === 'undefined' || lookupList.length < 0) {
          this.remoteMethod()
        } else {
          this.options = lookupList
        }
      }
    },
    handleChange() {
      this.$store.dispatch('notifyFieldChange', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        columnName: this.metadata.columnName,
        newValue: this.value
      })
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
          console.warn('DataRecord List, Select Base - Error ' + err.code + ': ' + err.message)
        })
    }
  }
}
</script>

<style>
  .el-select {
    width: 100%;
  }
</style>
