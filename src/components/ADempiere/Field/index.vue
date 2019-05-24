
<template>
  <!--
    this v-show is to indicate that if the field is not shown,
    therefore you should not leave the column size spacing of your
    <el-col></el-col> container-->
  <el-col v-show="isDisplayed()" :span="getSpan()">
    <el-form-item :label="isFieldOnly()" :required="isMandatory()">
      <component
        :is="afterLoader"
        :metadata="field"
        :value-model="recorddataFields"
        :required="isMandatory()"
        :readonly="!isReadOnly()"
        :load-record="loadRecord"
      />
    </el-form-item>
  </el-col>
</template>

<script>
import { FIELD_ONLY, FIELD_RANGE } from '@/components/ADempiere/Field/references'

/**
 * This is the base component for linking the components according to the
 * reference (or type of visualization) of each field
 */
export default {
  name: 'Field',
  props: {
    parentUuid: {
      type: String,
      default: ''
    },
    containerUuid: {
      type: String,
      default: ''
    },
    metadataUuid: {
      type: String,
      default: undefined
    },
    panelType: {
      type: String,
      default: 'window'
    },
    // receives the property that is an object with all the attributes
    metadataField: {
      type: Object,
      default: () => ({})
    },
    loadRecord: {
      type: Boolean,
      default: false
    },
    recorddataFields: {
      type: [Number, String, Boolean, Array, Object],
      default: undefined
    },
    span: {
      type: Number,
      default: undefined
    },
    label: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fieldOnly: FIELD_ONLY,
      fieldRange: FIELD_RANGE,
      field: {}
    }
  },
  computed: {
    // load the component that is indicated in the attributes of received property
    afterLoader() {
      return () => import(`@/components/ADempiere/${this.field.componentPath}/`)
    },
    isReadWrite: {
      get: function() {
        return this.isReadOnly
      },
      set: function(newValue) {
        this.isReadOnly = newValue
        if (this.field.columnName === 'IsActive') {
          this.isReadOnly = false
        }
      }
    }
  },
  watch: {
    metadataField: function() {
      this.field = this.metadataField
    }
  },
  created() {
    // assined field with prop
    this.field = this.metadataField
  },
  methods: {
    getSpan() {
      var span = 0
      if (this.isDisplayed()) {
        span = this.span
      }
      // display type Button
      if (this.field.displayType === 28) {
        span = 0
      }
      if (this.$store.state.app.device === 'mobile' && this.field.displayType !== 28) {
        span = 24
      }
      return span
    },
    isDisplayed() {
      var display = this.field.isActive && this.field.isDisplayed &&
        this.field.isDisplayedFromLogic &&
        (this.isMandatory() || this.field.isShowedFromUser)
      if (this.panelType === 'browser') {
        display = this.field.isQueryCriteria &&
        (this.isMandatory() || this.field.isShowedFromUser)
      }
      return display
    },
    isReadOnly() {
      return this.field.isReadonly && this.field.isReadonlyFromLogic
    },
    isMandatory() {
      return this.field.isMandatory && this.field.isMandatoryFromLogic
    },
    isFieldOnly() {
      if (!this.label) {
        return undefined
      }
      if (this.verifyIsFieldOnly(this.field.displayType)) {
        return undefined
      }
      if (this.field.isFieldOnly) {
        return undefined
      }
      return this.field.name
    },
    /**
     * Evaluate the current field with the range type fields contained in the
     * constant FIELD_RANGE
     * @param  {integer} id [identifier of the type of display]
     * @return {boolean}
     */
    evaluateRange(id) {
      var range = this.fieldRange.find((item) => {
        if (id === item.id) {
          return true
        }
      })
      if (typeof range !== 'undefined') {
        return true
      }
      return false
    },
    /**
     * Evaluate the current field with the only fields contained in the
     * constant FIELD_ONLY
     * @param  {integer} id [identifier of the type of display]
     * @return {boolean}
     */
    verifyIsFieldOnly(type) {
      var field = this.fieldOnly.find((item) => {
        if (type === item.id) {
          return true
        }
      })
      if (typeof field !== 'undefined') {
        return true
      }
      return false
    }
  }
}
</script>

<style scoped>
  /**
   * Separation between elements (item) of the form
   */
  .el-form-item {
    margin-bottom: 10px !important;
  }
</style>
<style>
  .el-form-item {
    margin-left: 10px;
    margin-right: 10px;
  }

  /* Global Styles */
  .el-textarea__inner {
    min-height: 36px !important;
    /*
    height: 36px auto !important;
    max-height: 54.2333px !important;
    */
  }

  /**
   * Reduce the spacing between the form element and its label
   */
  .el-form--label-top .el-form-item__label {
    padding-bottom: 0px !important;
  }
</style>
