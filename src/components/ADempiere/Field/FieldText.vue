<template>
  <el-input
    v-model="value"
    :pattern="pattern"
    :rows="rows"
    :type="typeTextBox"
    :placeholder="metadata.help"
    :readonly="Boolean(metadata.readonly)"
    :disabled="isDisabled"
    @blur="validateInput"
    @change="preHandleChange"
  />
</template>

<script>
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldText',
  mixins: [fieldMixin],
  props: {
    pattern: {
      type: String,
      default: undefined
    },
    validateInput: {
      type: Function,
      default: () => undefined
    }
  },
  data() {
    return {
      rows: 5, // Only used when input type='TextArea'
      patternFileName: '[A-Za-zñÑ0-9-_]{1,}',
      patternFilePath: '[A-Za-zñÑ0-9-_/.]{1,}'
    }
  },
  computed: {
    typeTextBox() {
      // String, Url, FileName...
      var typeInput = 'text'
      if (['Memo', 'Text', 'TextLong'].includes(this.metadata.referenceType)) {
        typeInput = 'textarea'
      }
      return typeInput
    }
  },
  watch: {
    valueModel(value) {
      if (this.isEmptyValue(value)) {
        value = ''
      }
      this.value = value
    },
    'metadata.value'(value) {
      if (this.isEmptyValue(value)) {
        value = ''
      }
      this.value = value
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable) {
      // avoid drastically changing the style of the table
      // this.typeInput = 'text'
      this.rows = 1
      if (!this.isEmptyValue(this.valueModel)) {
        this.value = String(this.valueModel)
      }
    }
  },
  methods: {
    // validate values before send values to store or server
    preHandleChange(value) {
      this.handleChange(value)
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
