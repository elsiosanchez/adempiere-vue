<template>
  <el-select
    v-model="value"
    :metadata="metadata"
    :filterable="true"
    :placeholder="metadata.help"
    value-key="key"
    @change="handleChange"
    @visible-change="getDataList"
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
  watch: {
    valueModel: function() {
      this.value = this.valueModel
    },
    value: function() {
      if (this.value === -1 || this.value === '-1') {
        this.value = ''
      }
    }
  },
  beforeMount() {
    if (this.metadata.defaultValue === -1 || this.metadata.defaultValue === '-1') {
      this.options.push(this.blanckOption)
    }
    if (this.metadata.isShowedFromUser || (this.metadata.isMandatory && this.metadata.isMandatoryFromLogic)) {
      this.getData()
    }
    if (this.metadata.value !== '') {
      this.getData()
    }
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
      this.value = this.metadata.value
      var parsedDirectQuery = this.parseContext({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        value: this.metadata.reference.directQuery
      })

      this.$store.dispatch('getLookup', {
        tableName: this.metadata.reference.tableName,
        directQuery: parsedDirectQuery,
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
    getDataList(show) {
      if (show) {
        var parsedQuery = this.parseContext({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          value: this.metadata.reference.query
        })
        var lookupList = this.$store.getters.getLookupList(parsedQuery)
        if (typeof lookupList === 'undefined' || lookupList.length < 0) {
          this.$store.dispatch('getLookupList', {
            tableName: this.metadata.reference.tableName,
            query: parsedQuery
          })
            .then(response => {
              this.options = response
              this.options.unshift(this.blanckOption)
            })
            .catch(err => {
              console.warn('DataRecord, Select Base - Error ' + err.code + ': ' + err.message)
            })
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
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.options = this.list.filter(item => {
            return item.label.toLowerCase()
              .indexOf(query.toLowerCase()) > -1
          })
        }, 200)
      } else {
        this.options = []
      }
    }
  }
}
</script>

<style>
  .el-select {
    width: 100%;
  }
</style>
