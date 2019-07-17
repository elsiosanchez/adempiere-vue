<template>
  <el-select
    v-model="selectedFields"
    :filterable="true"
    :placeholder="$t('components.filterableItems')"
    multiple
    collapse-tags
    value-key="key"
    style="float: right;"
    @change="addField"
  >
    <el-option
      v-for="(item, key) in fieldListOptional"
      :key="key"
      :label="item.name"
      :value="item.columnName"
    />
  </el-select>
</template>

<script>
export default {
  name: 'FilterFields',
  props: {
    containerUuid: {
      type: String,
      required: true
    },
    panelType: {
      type: String,
      default: 'window'
    },
    groupField: {
      type: String,
      default: undefined
    },
    isFirstGroup: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedFields: [], // fields optional showed
      fieldListOptional: [] // all available fields to show
    }
  },
  created() {
    this.getPanel()
  },
  methods: {
    isDisplayed(field) {
      var isBrowserDisplayed = this.panelType === 'browser' && field.isQueryCriteria // browser query criteria
      var isWindowDisplayed = this.panelType !== 'browser' && field.isDisplayed && field.isDisplayedFromLogic // window, process and report, browser result
      var isDisplayed = field.isActive && (isBrowserDisplayed || isWindowDisplayed) // Available fields to show

      if (isDisplayed && field.isShowedFromUser) {
        // showed displayed in view
        this.selectedFields.push(field.columnName)
      }
      return isDisplayed
    },
    getPanel() {
      var fieldList = this.$store.getters.getFieldsListFromPanel(this.containerUuid)
      if (typeof fieldList === 'undefined' || fieldList.length === 0) {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.containerUuid,
          type: this.panelType.trim()
        }).then(response => {
          this.generatePanel(response.fieldList)
        }).catch(err => {
          console.warn('Field Load Error ' + err.code + ': ' + err.message)
        })
      } else {
        this.generatePanel(fieldList)
      }
    },
    generatePanel(fieldList) {
      this.fieldListOptional = fieldList.filter(fieldItem => {
        if (!fieldItem.isMandatory && this.groupField === fieldItem.groupAssigned) {
          return this.isDisplayed(fieldItem)
        }
      })
    },
    /**
     * @param {array} selectedValues
     */
    addField(selectedValues) {
      this.$store.dispatch('changeFieldShowedFromUser', {
        containerUuid: this.containerUuid,
        fieldsUser: selectedValues,
        show: true
      })
    }
  }
}
</script>
