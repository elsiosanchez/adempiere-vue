<template>
  <el-input-number
    v-model="value"
    type="number"
    :pattern="pattern"
    :min="minValue"
    :max="maxValue"
    :placeholder="metadata.help"
    :disabled="Boolean(metadata.readonly || metadata.disabled)"
    controls-position="right"
    :class="'display-type-' + cssClass"
    @blur="validateInput"
    @change="handleChange"
  />
</template>

<script>
import { isEmptyValue } from '@/utils/ADempiere'
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldNumber',
  mixins: [fieldMixin],
  props: {
    validateInput: {
      type: Function,
      default: () => undefined
    }
  },
  data() {
    return {
      pattern: undefined,
      showControls: true
    }
  },
  computed: {
    maxValue() {
      if (!this.isEmptyValue(this.metadata.valueMax)) {
        return Number(this.metadata.valueMax)
      }
      return Infinity
    },
    minValue() {
      if (!this.isEmptyValue(this.metadata.valueMin)) {
        return Number(this.metadata.valueMin)
      }
      return -Infinity
    },
    cssClass() {
      return this.metadata.referenceType.split(/(?=[A-Z])/).join('-').toLowerCase()
    }
  },
  watch: {
    valueModel(value) {
      this.value = Number(value)
    },
    'metadata.value'(value) {
      this.value = Number(value)
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = Number(this.valueModel)
    }
  },
  methods: {
    isEmptyValue
  }
}
</script>

<style lang="scss">
  /* if is controls width 100% in container */
  .el-input-number, .el-input {
    width: 100% !important; /* ADempiere Custom */
  }

  /** Amount reference **/
  .display-type-amount {
    text-align: right !important;
    input, .el-input__inner {
      text-align: right !important;
    }
  }
  /* ADempiere Custom */
  .el-input-number.is-controls-right .el-input__inner {
    padding-left: 15px;
    padding-right: 50px;
    text-align: -webkit-right;
  }
</style>
