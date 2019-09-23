<template>
  <el-input
    v-model="value"
    :pattern="pattern"
    :rows="rows"
    :type="typeInput"
    :placeholder="metadata.help"
    :readonly="Boolean(metadata.readonly)"
    :disabled="Boolean(metadata.readonly || metadata.disabled)"
    @blur="validateInput"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'TextBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    pattern: {
      type: String,
      default: undefined
    },
    typeInput: {
      type: String,
      default: 'text'
    },
    validateInput: {
      type: Function,
      default: () => undefined
    },
    // value received from data result
    valueModel: {
      type: [String, Number],
      default: undefined
    },
    // Only used when prop type='TextArea'
    rows: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      value: this.metadata.value,
      patternFileName: '[A-Za-zñÑ0-9-_]{1,}',
      patternFilePath: '[A-Za-zñÑ0-9-_/.]{1,}'
    }
  },
  computed: {
    getterValue() {
      var field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return field.value
      }
      return undefined
    }
  },
  watch: {
    valueModel(value) {
      if (!value) {
        value = ''
      }
      this.value = value
    },
    'metadata.value'(value) {
      if (!value) {
        value = ''
      }
      this.value = value
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = String(this.valueModel)
    }
  },
  methods: {
    handleChange(value) {
      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey,
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
          newValue: this.value
        })
      }
    },
    validateUrl(e) {
      // Entry pattern, in this case only accepts numbers and letters
      var _Pattern = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+((\.[a-zA-Z]{1,5})+)(\/(.)*)?(\?(.)*)?/g
      var rex = RegExp(_Pattern)
      var value = e.target.value
      if (rex.test(value) && value.trim() !== '') {
        console.log('url good format')
      } else if (value.trim() === '') {
        console.log('url empty')
      } else {
        // e.target.focus()
        console.log('url wrong')
      }
    }
  }
}
</script>
