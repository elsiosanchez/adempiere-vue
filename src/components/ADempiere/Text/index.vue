<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
    :pattern="pattern"
    :type-input="typeInput"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'Textarea',
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
      typeInput: 'textarea',
      pattern: undefined
    }
  }
}
</script>
