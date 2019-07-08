<template>
  <div>
    <el-select
      v-model="columnsShowed"
      :filterable="true"
      :placeholder="$t('components.filterableItems')"
      multiple
      size="mini"
      collapse-tags
      value-key="key"
      class="select-filter"
      @change="addField"
    >
      <el-option
        v-for="(item, key) in columnListAvailable"
        :key="key"
        :label="item.name"
        :value="item.columnName"
      />
    </el-select>
  </div>
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
      this.columnListAvailable = fieldList.filter((item) => {
        return this.isDisplayed(item)
      })
    },
    isDisplayed(field) {
      var isDisplayed = field.isActive && field.isDisplayed && (field.isShowedTableFromUser || field.isDisplayedFromLogic)
      if (field.isShowedTableFromUser && field.isDisplayed) {
        this.columnsShowed.push(field.columnName)
      }
      return isDisplayed
    },
    /**
     * @param {array} selectedValues
     */
    addField(selectedValues) {
      this.$store.dispatch('changeColumnShowedFromUser', {
        containerUuid: this.containerUuid,
        fieldsUser: selectedValues,
        show: true
      })
    }
  }
}
</script>
<style>

  .select-filter{
    height: 28px;
  }

</style>
