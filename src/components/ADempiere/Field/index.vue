
<template>
  <!--
    this v-show is to indicate that if the field is not shown,
    therefore you should not leave the column size spacing of your
    <el-col></el-col> container-->
  <el-col
    v-show="isDisplayed()"
    :xs="sizeFieldResponsive.xs"
    :sm="sizeFieldResponsive.sm"
    :md="sizeFieldResponsive.md"
    :lg="sizeFieldResponsive.lg"
    :xl="sizeFieldResponsive.xl"
  >
    <el-form-item :label="isFieldOnly()" :required="isMandatory()">
      <component
        :is="afterLoader"
        :metadata="field"
        :value-model="recordDataFields"
        :required="isMandatory()"
        :readonly="!isReadOnly()"
        :load-record="isLoadRecord"
      />
    </el-form-item>
  </el-col>
</template>

<script>
import { FIELD_ONLY, FIELD_RANGE } from '@/components/ADempiere/Field/references'
import { FIELD_DISPLAY_SIZES } from '@/components/ADempiere/Field/fieldSize'

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
    isLoadRecord: {
      type: Boolean,
      default: false
    },
    recordDataFields: {
      type: [Number, String, Boolean, Array, Object],
      default: undefined
    },
    span: {
      type: Number,
      default: undefined
    },
    isShowLabel: {
      type: Boolean,
      default: true
    },
    isDataTable: {
      type: Boolean,
      default: false
    },
    inGroup: {
      type: Boolean,
      default: false
    },
    inTable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fieldOnly: FIELD_ONLY,
      fieldRange: FIELD_RANGE,
      fieldDisplaySizes: FIELD_DISPLAY_SIZES,
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
    },
    sizeFieldResponsive() {
      var sizeFieldFromType = this.fieldDisplaySizes.find(item => {
        return item.type === this.field.componentPath
      })
      var sizeField = sizeFieldFromType.size
      var newSizes = {}
      if (this.inTable) {
        newSizes.xs = 24
        newSizes.sm = 24
        newSizes.md = 24
        newSizes.lg = 24
        newSizes.xl = 24
        return newSizes
      } else if (this.inGroup && this.getWidth >= 992) {
        newSizes.xs = sizeField.xs * 2
        newSizes.sm = sizeField.sm * 2
        if (this.getWidth <= 1199) {
          newSizes.md = sizeField.md * 2 - 4
        } else {
          newSizes.md = sizeField.md * 2
        }
        newSizes.lg = sizeField.lg * 2
        newSizes.xl = sizeField.xl * 2
        return newSizes
      }
      return sizeField
    },
    getWidth() {
      return this.$store.getters.getWidth()
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
      // isDisplayed type Button
      if (this.field.displayType === 28) {
        span = 0
      }
      if (this.$store.state.app.device === 'mobile' && this.field.displayType !== 28) {
        span = 24
      }
      return span
    },
    isDisplayed() {
      var isDisplayed = this.field.isDisplayed && this.field.isDisplayedFromLogic && (this.isMandatory() || this.field.isShowedFromUser || this.isDataTable)
      //  Verify for displayed and is active
      return this.field.isActive && isDisplayed
    },
    isReadOnly() {
      return this.field.isReadonly && this.field.isReadonlyFromLogic
    },
    isMandatory() {
      return this.field.isMandatory && this.field.isMandatoryFromLogic
    },
    isFieldOnly() {
      if (!this.isShowLabel) {
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
     * @param  {integer} id [identifier of the type of isDisplayed]
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
     * @param  {integer} id [identifier of the type of isDisplayed]
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
