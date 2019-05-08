<template>
  <number-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
  />
</template>

<script>
import NumberBase from '@/components/ADempiere/NumberBase'

export default {
  name: 'CostsPrices',
  components: {
    NumberBase
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

<style scoped>
  .el-input-number.is-controls-right .el-input__inner{
    padding-right: 15px !important;
  }
</style>
