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
import TextBase from '@/components/ADempiere/Field/FieldText'

export default {
  name: 'FieldTextArea',
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
      typeInput: 'textarea',
      pattern: undefined,
      rows: 5
    }
  },
  created() {
    if (this.metadata.inTable) {
      // avoid drastically changing the style of the table
      // this.typeInput = 'text'
      this.rows = 1
    }
  }
}
</script>
