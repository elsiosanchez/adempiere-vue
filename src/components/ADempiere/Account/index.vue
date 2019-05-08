<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'Account',
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
      type: Number,
      default: NaN
    }
  }
}
</script>
