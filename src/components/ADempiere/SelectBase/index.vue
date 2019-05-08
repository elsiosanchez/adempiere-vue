<template>
  <el-select
    v-model="value"
    :metadata="metadata"
    :filterable="metadata.Filterable"
    :collapse-tags="metadata.CollapseTags"
    :placeholder="metadata.Help"
    value-key="key"
    @change="handleChange"
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
import { convertValueFromGRPC } from '@/utils/ADempiere'
import { getObjectListFromCriteria } from '@/api/ADempiere/data'

export default {
  name: 'SelectBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    valueModel: {
      type: [Object, Array, String, Number],
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      value: this.metadata.defaultValue,
      loading: false,
      options: [],
      list: [],
      showControls: true
    }
  },
  watch: {
    valueModel: function() {
      this.value = this.valueModel
    }
  },
  mounted() {
    this.getDataList()
    this.$store.dispatch('setContext', {
      parentUuid: this.metadata.parentUuid,
      containerUuid: this.metadata.containerUuid,
      columnName: this.metadata.columnName,
      value: this.value
    })
  },
  methods: {
    convertValueFromGRPC,
    getObjectListFromCriteria,
    getDataList() {
      var table = this.metadata.columnName.replace('_ID', '')
      this.getObjectListFromCriteria(table, "IsActive = 'Y'")
        .then(response => {
          const recordList = response.getRecordsList()

          for (var i = 0; i < recordList.length; i++) {
            const values = recordList[i]
            const map = values.getValuesMap()
            const value = this.convertValueFromGRPC(map.get('Value'))
            const name = this.convertValueFromGRPC(map.get('Name'))

            this.options.push({
              label: name,
              key: value
            })
          }
        })
        .catch(err => {
          console.warn('DataRecord, Select Base - Error ' + err.code + ': ' + err.message)
        })
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
