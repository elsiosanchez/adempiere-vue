<template>
  <el-select
    v-model="columnsFixed"
    :filterable="!isMobile"
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
      columnListAvailable: [], // available fields
      isLoadFromServer: false
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterFieldList() {
      return this.$store.getters.getFieldsListFromPanel(this.containerUuid)
    }
  },
  watch: {
    isLoadFromServer(value) {
      if (value) {
        this.generatePanel(this.getterFieldList)
      }
    }
  },
  created() {
    this.getPanel()
  },
  methods: {
    getPanel() {
      var fieldList = this.getterFieldList
      if (fieldList === undefined || fieldList.length === 0) {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.containerUuid,
          type: this.panelType
        }).then(response => {
          this.isLoadFromServer = true
          // this.generatePanel(response.fieldList)
        }).catch(error => {
          console.warn('Field Load Error ' + error.code + ': ' + error.message)
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
        fieldsIncludes: selectedValues,
        attribute: 'isFixedTableColumn',
        valueAttribute: true
      })
    }
  }
}
</script>
