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
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldText',
  mixins: [fieldMixin],
  props: {
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
    // Only used when prop type='TextArea'
    rows: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      patternFileName: '[A-Za-zñÑ0-9-_]{1,}',
      patternFilePath: '[A-Za-zñÑ0-9-_/.]{1,}'
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
