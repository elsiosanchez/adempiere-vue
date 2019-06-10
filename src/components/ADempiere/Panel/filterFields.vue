<template>
  <div>
    <el-select
      v-model="newFields"
      :filterable="true"
      placeholder="Filtrable Items"
      multiple
      collapse-tags
      clearable
      :automatic-dropdown="true"
      value-key="key"
      @change="addField"
    >
      <el-option
        v-for="(item, key) in fieldListOptional"
        :key="key"
        :label="item.name"
        :value="item.columnName"
      />
    </el-select>
  </div>
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
    }
  },
  data() {
    return {
      newFields: [],
      fieldListOptional: []
    }
  },
  mounted() {
    this.getPanel()
  },
  methods: {
    isDisplayed(field) {
      var isMandatory = field.isMandatory || field.isMandatoryFromLogic
      var isDisplayed = field.isActive && field.isDisplayed && (field.isShowedFromUser || field.isDisplayedFromLogic || isMandatory)
      if (field.isShowedFromUser) {
        this.newFields.push(field.columnName)
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
      this.fieldListOptional = fieldList.filter((item) => {
        if (!item.isMandatory) {
          return this.isDisplayed(item)
        }
      })
    },
    addField(value) {
      this.$store.dispatch('changeFieldShowedFromUser', {
        containerUuid: this.containerUuid,
        fieldsUser: value,
        show: true
      })
    }
  }
}
</script>
