<template>
  <text-base
    :metadata="metadata"
    :value-model="valueModel"
    :pattern="pattern"
    :placeholder="metadata.help"
    :type-input="typeInput"
    :rows="rows"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'TextAreaBase',
  components: {
    TextBase
  },
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: this.metadata.value,
      typeInput: 'textarea',
      pattern: undefined,
      rows: 5
    }
  },
  watch: {
    valueModel(value) {
      if (!value) {
        value = ''
      }
      this.value = value
    }
  },
  created() {
    if (this.metadata.inTable) {
      // avoid drastically changing the style of the table
      // this.typeInput = 'text'
      this.rows = 1
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = String(this.valueModel)
    }
  }
}
</script>
