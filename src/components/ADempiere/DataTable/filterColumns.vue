<template>
  <el-select
    v-model="columnsShowed"
    :filterable="!isMobile"
    :placeholder="$t('components.filterableItems')"
    multiple
    size="mini"
    collapse-tags
    value-key="key"
    class="select"
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
  name: 'FilterColumns',
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
      columnsShowed: [], // columns showed
      columnListAvailable: [] // available fields
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    }
  },
  created() {
    this.getPanel()
  },
  methods: {
    getPanel() {
      var fieldList = this.$store.getters.getFieldsListFromPanel(this.containerUuid)
      if (fieldList === undefined || fieldList.length === 0) {
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
      var isDisplayed = field.isActive && field.isDisplayed && (field.isShowedTableFromUser || field.isDisplayedFromLogic) && !field.isKey
      if (field.isShowedTableFromUser && field.isDisplayed && !field.isKey) {
        this.columnsShowed.push(field.columnName)
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
        attribute: 'isShowedTableFromUser',
        valueAttrbute: true
      })
    }
  }
}
</script>
