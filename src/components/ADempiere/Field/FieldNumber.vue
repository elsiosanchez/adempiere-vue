<template>
  <el-input-number
    :ref="metadata.columnName"
    v-model="value"
    type="number"
    :pattern="pattern"
    :min="minValue"
    :max="maxValue"
    :placeholder="metadata.help"
    :disabled="isDisabled"
    controls-position="right"
    :class="'display-type-' + cssClass"
    @blur="validateInput"
    @change="preHandleChange"
  />
</template>

<script>
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
      if (value === undefined || value === '') {
        value = null
      }
      this.value = value
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = Number(this.valueModel)
    }
  },
  methods: {
    // validate values before send values to store or server
    preHandleChange(value) {
      this.handleChange(value)
    },
    activeFocus(columnName) {
      if (this.metadata.isUpdateable) {
        this.$refs[columnName].focus()
      }
    }
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
