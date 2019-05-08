<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
    :pattern="pattern"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'FilePath',
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
      pattern: '[A-Za-zñÑ0-9-_/.]{1,}'
    }
  }
}
</script>
