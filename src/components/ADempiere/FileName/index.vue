<template>
  <text-base
    :metadata="metadata"
    :value-model="valueModel"
    :load-record="loadRecord"
    :pattern="pattern"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'FileName',
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
      pattern: '[A-Za-zñÑ0-9-_]{1,}'
    }
  }
}
</script>
