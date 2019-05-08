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
    getDataList() {
      var table = this.metadata.columnName.replace('_ID', '')
      var criteria = "IsActive = 'Y'"

      this.$store.dispatch('getObjectListFromCriteria', {
        table: table,
        criteria: criteria
      })
        .then(response => {
          this.options = response
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
