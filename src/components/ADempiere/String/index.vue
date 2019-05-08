<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :pattern="pattern"
    :value-model="valueModel"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'String',
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
      pattern: undefined
    }
  }
}
</script>
