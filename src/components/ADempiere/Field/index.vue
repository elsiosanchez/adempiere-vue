
<template>
  <!--
    this v-show is to indicate that if the field is not shown,
    therefore you should not leave the column size spacing of your
    <el-col></el-col> container-->
  <el-col
    v-if="!inTable"
    v-show="isDisplayed()"
    :xs="sizeFieldResponsive.xs"
    :sm="sizeFieldResponsive.sm"
    :md="sizeFieldResponsive.md"
    :lg="sizeFieldResponsive.lg"
    :xl="sizeFieldResponsive.xl"
    :class="classField"
  >
    <el-form-item :label="isFieldOnly()" :required="isMandatory()">
      <component
        :is="afterLoader"
        :metadata="{
          ...field,
          panelType: panelType,
          inTable: inTable,
          // DOM properties
          required: isMandatory(),
          readonly: isReadOnly(),
          disabled: !field.isActive
        }"
        :value-model="recordDataFields"
      />
    </el-form-item>
  </el-col>
  <component
    :is="afterLoader"
    v-else
    :class="classField"
    :metadata="{
      ...field,
      panelType: panelType,
      inTable: inTable,
      // DOM properties
      required: isMandatory(),
      readonly: isReadOnly(),
      disabled: !field.isActive
    }"
    :value-model="recordDataFields"
  />
</template>

<script>
import { FIELD_ONLY } from '@/components/ADempiere/Field/references'
import { FIELD_DISPLAY_SIZES, DEFAULT_SIZE } from '@/components/ADempiere/Field/fieldSize'
import { fieldIsDisplayed, isEmptyValue } from '@/utils/ADempiere'

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
    recordDataFields: {
      type: [Number, String, Boolean, Array, Object],
      default: undefined
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
      field: {},
      optionCRUD: this.$route.query.action
    }
  },
  computed: {
    // load the component that is indicated in the attributes of received property
    afterLoader() {
      return () => import(`@/components/ADempiere/${this.field.componentPath}/`)
    },
    sizeFieldResponsive() {
      var sizeFieldFromType = FIELD_DISPLAY_SIZES.find(item => {
        return item.type === this.field.componentPath
      })

      if (sizeFieldFromType === undefined) {
        console.warn('Field size no found:', this.field.name)
        sizeFieldFromType = {}
        sizeFieldFromType.size = DEFAULT_SIZE
      }

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
    },
    classField() {
      if (this.inTable) {
        return 'in-table'
      }
      return ''
    }
  },
  watch: {
    metadataField(value) {
      this.field = value
    }
  },
  created() {
    // assined field with prop
    this.field = this.metadataField
  },
  methods: {
    isEmptyValue,
    isDisplayed() {
      return fieldIsDisplayed(this.field) && (this.isMandatory() || this.field.isShowedFromUser || this.inTable)
    },
    isReadOnly() {
      var isUpdateableAllFields = this.field.isReadOnly || this.field.isReadOnlyFromLogic
      var isUpdatableColumnBrowserResult = this.panelType === 'browser' && this.inTable && isUpdateableAllFields

      // edit mode is diferent to create new
      var editMode = (!this.inTable && this.optionCRUD !== 'create-new') || (this.inTable && !this.isEmptyValue(this.field.recordUuid))
      var isUpdateableFieldWindow = (this.panelType === 'window' && !this.field.isUpdateable && editMode) ||
        (isUpdateableAllFields && this.panelType !== 'browser') // logic to window, report and process

      return isUpdateableFieldWindow || isUpdatableColumnBrowserResult
    },
    isMandatory() {
      return this.field.isMandatory || this.field.isMandatoryFromLogic
    },
    isFieldOnly() {
      if (this.inTable || this.field.isFieldOnly || this.verifyIsFieldOnly(this.field.displayType)) {
        return undefined
      }
      return this.field.name
    },
    /**
     * Evaluate the current field with the only fields contained in the
     * constant FIELD_ONLY
     * @param  {integer} id [identifier of the type of isDisplayed]
     * @return {boolean}
     */
    verifyIsFieldOnly(type) {
      var field = FIELD_ONLY.find(itemField => {
        if (type === itemField.id) {
          return true
        }
      })
      return Boolean(field)
    }
  }
}
</script>

<style lang="scss">
  /**
   * Separation between elements (item) of the form
   */
  .el-form-item {
    margin-bottom: 10px !important;
    margin-left: 10px;
    margin-right: 10px;
  }
  .in-table {
    margin-bottom: 0px !important;
    margin-left: 0px;
    margin-right: 0px;
  }

  /* Global Styles */
  .el-textarea__inner:not(.in-table) {
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
