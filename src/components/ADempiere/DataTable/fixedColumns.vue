<template>
  <el-select
    v-model="columnsFixed"
    :filterable="true"
    :placeholder="$t('components.fixedleItems')"
    multiple
    size="mini"
    collapse-tags
    value-key="key"
    @change="addField"
  >
    <el-option
      v-for="(item, key) in columnListAvailable"
      :key="key"
      :label="item.name"
      :value="item.columnName"
    />
  </el-select>
</template>

<script>
export default {
  name: 'FixedColumns',
  props: {
    containerUuid: {
      type: String,
      required: true
    },
    panelType: {
      type: String,
      default: 'window'
    }
  },
  data() {
    return {
      columnsFixed: [], // columns showed
      columnListAvailable: [] // available fields
    }
  },
  created() {
    this.getPanel()
  },
  methods: {
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
      this.columnListAvailable = fieldList.filter(fieldItem => {
        return this.isDisplayed(fieldItem)
      })
    },
    isDisplayed(field) {
      var isDisplayed = field.isActive && field.isDisplayed && field.isDisplayedFromLogic && !field.isKey
      if (field.isFixedTableColumn && field.isDisplayed) {
        this.columnsFixed.push(field.columnName)
      }
      return isDisplayed
    },
    /**
     * @param {array} selectedValues
     */
    addField(selectedValues) {
      this.$store.dispatch('changeFieldAttributesBoolean', {
        containerUuid: this.containerUuid,
        fieldsUser: selectedValues,
        attribute: 'isFixedTableColumn',
        valueAttrbute: true
      })
    }
  }
}
</script>
