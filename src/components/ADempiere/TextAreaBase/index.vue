<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
    :pattern="pattern"
    :placeholder="metadata.help"
    :type-input="typeInput"
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
    loadRecord: {
      type: Boolean,
      default: false
    },
    valueModel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: this.metadata.value,
      typeInput: 'textarea',
      pattern: undefined
    }
  },
  beforeMount() {
    if (this.valueModel !== '') {
      this.value = this.valueModel
    }
  }
}
</script>
