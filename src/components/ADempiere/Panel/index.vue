<template>
  <div class="wrapper">
    <el-form
      v-if="isLoadPanel"
      key="panel-loaded"
      v-model="dataRecords"
      label-position="top"
      label-width="200px"
    >
      <template
        v-if="firstGroup && firstGroup.groupFinal === ''"
      >
        <div v-show="firstGroup.activeFields" class="cards-not-group">
          <div
            v-if="(group.groupType == 'T' && group.groupName == firstGroup.groupFinal)
              || (group.groupType !== 'T' && firstGroup.typeGroup !== 'T')"
            class="card"
          >
            <div class="select-filter">
              <span>
                {{ firstGroup.groupFinal }}
              </span>
              <filter-fields
                :container-uuid="containerUuid"
                :panel-type="panelType"
                :group-field="firstGroup.groupFinal"
                :is-avanced-query="isAvancedQuery"
              />
            </div>
            <el-card
              :shadow="isMobile ? 'never' : 'hover'"
              :body-style="{ padding: '10px' }"
            >
              <el-row :gutter="gutterRow">
                <template v-for="(subItem, subKey) in firstGroup.metadataFields">
                  <field-definition
                    :key="subKey"
                    :parent-uuid="parentUuid"
                    :container-uuid="containerUuid"
                    :metadata-field="{
                      ...subItem,
                      optionCRUD: isEmptyValue(uuidRecord) ? 'create-new' : uuidRecord,
                    }"
                    :record-data-fields="dataRecords[subItem.columnName]"
                    :panel-type="panelType"
                    :in-group="!getterIsShowedRecordNavigation"
                    :is-avanced-query="isAvancedQuery"
                  />
                </template>
              </el-row>
            </el-card>
          </div>
        </div>
      </template>
      <div :class="cards()">
        <draggable
          v-if="!isMobile"
          :list="fieldGroups"
          v-bind="$attrs"
          :set-data="setData"
        >
          <template v-for="(item, key) in fieldGroups">
            <el-row :key="key">
              <el-col :key="key" :span="24">
                <div
                  v-if="item.groupFinal !== ''
                    && (group.groupType == 'T' && group.groupName == item.groupFinal)
                    || (group.groupType !== 'T' && item.typeGroup !== 'T')"
                  :key="key"
                  class="card"
                >
                  <el-card
                    :shadow="isMobile ? 'never' : 'hover'"
                    :body-style="{ padding: '10px' }"
                  >
                    <div slot="header" class="clearfix">
                      <span>
                        {{ item.groupFinal }}
                      </span>
                      <div class="select-filter-header">
                        <filter-fields
                          :container-uuid="containerUuid"
                          :panel-type="panelType"
                          :group-field="item.groupFinal"
                          :is-first-group="false"
                          :is-avanced-query="isAvancedQuery"
                        />
                      </div>
                    </div>
                    <el-row :gutter="gutterRow">
                      <template v-for="(subItem, subKey) in item.metadataFields">
                        <field-definition
                          :key="subKey"
                          :parent-uuid="parentUuid"
                          :container-uuid="containerUuid"
                          :metadata-field="{
                            ...subItem,
                            optionCRUD: isEmptyValue(uuidRecord) ? 'create-new' : uuidRecord,
                          }"
                          :record-data-fields="dataRecords[subItem.columnName]"
                          :panel-type="panelType"
                          :in-group="isMutipleGroups && fieldGroups.length > 1"
                          :is-avanced-query="isAvancedQuery"
                        />
                      </template>
                    </el-row>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </template>
        </draggable>
        <template v-else>
          <template v-for="(item, key) in fieldGroups">
            <el-row :key="key">
              <el-col :key="key" :span="24">
                <div
                  v-if="item.groupFinal !== ''
                    && (group.groupType == 'T' && group.groupName == item.groupFinal)
                    || (group.groupType !== 'T' && item.typeGroup !== 'T')"
                  :key="key"
                  class="card"
                >
                  <el-card
                    :shadow="isMobile ? 'never' : 'hover'"
                    :body-style="{ padding: '10px' }"
                  >
                    <div slot="header" class="clearfix">
                      <span>
                        {{ item.groupFinal }}
                      </span>
                      <div v-if="!isAvancedQuery" class="select-filter-header">
                        <filter-fields
                          :container-uuid="containerUuid"
                          :panel-type="panelType"
                          :group-field="item.groupFinal"
                          :is-first-group="false"
                        />
                      </div>
                    </div>
                    <el-row :gutter="gutterRow">
                      <template v-for="(subItem, subKey) in item.metadataFields">
                        <field-definition
                          :key="subKey"
                          :parent-uuid="parentUuid"
                          :container-uuid="containerUuid"
                          :metadata-field="{
                            ...subItem,
                            optionCRUD: isEmptyValue(uuidRecord) ? 'create-new' : uuidRecord,
                          }"
                          :record-data-fields="dataRecords[subItem.columnName]"
                          :panel-type="panelType"
                          :in-group="isMutipleGroups && fieldGroups.length > 1"
                        />
                      </template>
                    </el-row>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </template>
        </template>
      </div>
    </el-form>
    <div
      v-else
      key="panel-loading"
      v-loading="!isLoadPanel"
      :element-loading-text="$t('notifications.loading')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      class="loading-panel"
    />
  </div>
</template>

<script>
import FieldDefinition from '@/components/ADempiere/Field'
import FilterFields from '@/components/ADempiere/Panel/filterFields'
import draggable from 'vuedraggable'

export default {
  name: 'PanelFields',
  components: {
    FieldDefinition,
    FilterFields,
    draggable
  },
  props: {
    parentUuid: {
      type: String,
      default: ''
    },
    containerUuid: {
      type: String,
      required: true
    },
    metadata: {
      type: Object,
      default: () => {}
    },
    group: {
      type: Object,
      default: () => ({
        groupType: '',
        groupName: ''
      })
    },
    panelType: {
      type: String,
      default: 'window'
    },
    isReSearch: {
      type: Boolean,
      default: true
    },
    isAvancedQuery: {
      type: Boolean,
      default: false
    },
    windowQuery: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fieldList: [],
      dataRecords: {},
      gutterRow: 0,
      isLoadPanel: false,
      isLoadFromServer: false,
      isLoadRecord: false,
      uuidRecord: this.$route.query.action,
      fieldGroups: [],
      firstGroup: {},
      groupsView: 0,
      isMutipleGroups: Boolean(this.panelType === 'window'),
      tagTitle: {
        base: this.$route.meta.title, action: ''
      }
    }
  },
  computed: {
    getterIsShowedRecordNavigation() {
      if (this.panelType === 'window') {
        return this.$store.getters.getIsShowedRecordNavigation(this.parentUuid)
      }
      return false
    },
    getterFieldList() {
      var panel = this.$store.getters.getPanel(this.containerUuid, this.isAvancedQuery)
      if (panel) {
        return panel.fieldList
      }
      return panel
    },
    getterRecordUuid() {
      return this.$store.getters.getUuid(this.containerUuid)
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterData() {
      return this.$store.getters.getRecordDetail({
        tableName: this.metadata.tableName,
        recordUuid: this.$route.query.action
      })
    },
    getterRowData() {
      if (this.panelType === 'window' && !this.isEmptyValue(this.uuidRecord) && this.uuidRecord !== 'create-new') {
        return this.$store.getters.getRowData(this.containerUuid, this.uuidRecord)
      }
      return false
    },
    getterIsLoadField() {
      if (this.panelType === 'window') {
        return this.$store.getters.getTabIsLoadField(this.parentUuid, this.containerUuid)
      }
      return false
    }
  },
  watch: {
    isLoadFromServer(value) {
      if (value) {
        this.generatePanel(this.getterFieldList)
      }
    },
    // used only panel modal (process associated in browser or window)
    containerUuid() {
      this.generatePanel(this.metadata.fieldList)
    },
    // used if the first load contains a uuid
    isLoadRecord(value) {
      // TODO: Validate UUID value
      if (value && this.panelType === 'window' && this.uuidRecord !== 'create-new' && !this.isEmptyValue(this.uuidRecord)) {
        this.setTagsViewTitle(this.uuidRecord)
      }
    },
    getterIsLoadField(value) {
      if (value) {
        if (this.$route.query.action && this.$route.query.action !== 'create-new') {
          this.$store.dispatch('addCustomWhereClauseFromRoute', {
            actionValue: this.$route.query.action,
            tabUuid: this.containerUuid,
            windowUuid: this.parentUuid
          })
        }
        this.getDataList()
      }
    }
  },
  created() {
    // get tab with uuid
    this.getPanel(this.isAvancedQuery)
  },
  methods: {
    cards() {
      if (this.isMobile || this.groupsView.length < 2 || this.fieldGroups.length < 2 || !this.isMutipleGroups || this.getterIsShowedRecordNavigation) {
        return 'cards-not-group'
      }
      return 'cards-in-group'
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    getPanel(isAvancedQuery) {
      var fieldList = this.getterFieldList
      if (fieldList && Array.isArray(fieldList)) {
        this.generatePanel(fieldList)
      } else {
        this.$store.dispatch('getPanelAndFields', {
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          type: (isAvancedQuery) ? 'table' : this.panelType,
          isAvancedQuery: isAvancedQuery,
          windowQuery: (this.metadata.query !== undefined) ? this.metadata.query : this.windowQuery
        }).then(response => {
          this.isLoadFromServer = true
        }).catch(error => {
          console.warn('Field Load Error ' + error.code + ': ' + error.message)
        })
      }
    },
    generatePanel(fieldList) {
      // order and assign groups
      this.fieldList = fieldList
      this.fieldGroups = this.sortAndGroup(fieldList)
      var firstGroup
      if (this.fieldGroups[0] && this.fieldGroups[0].groupFinal === '') {
        firstGroup = this.fieldGroups[0]
        this.fieldGroups.shift()
      }
      this.firstGroup = firstGroup

      this.isLoadPanel = true

      if (this.panelType === 'window') {
        this.fieldList.forEach(fieldItem => {
          if (this.$route.query.hasOwnProperty(fieldItem.columnName) && !fieldItem.isAvancedQuery) {
            fieldItem.isShowedFromUser = true

            if (String(this.$route.query.isAvancedQuery) === String(fieldItem.isAvancedQuery)) {
              fieldItem.value = this.$route.query[fieldItem.columnName]
              if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
                fieldItem.value = new Date(fieldItem.value)
              } else if (fieldItem.componentPath === 'FieldYesNo') {
                fieldItem.value = Boolean(fieldItem.value)
              }
            }

            if (fieldItem.isRange && this.$route.query[fieldItem.columnName + '_To']) {
              fieldItem.valueTo = this.$route.query[fieldItem.columnName + '_To']
              if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
                fieldItem.valueTo = new Date(fieldItem.valueTo)
              }
            }
          }
        })
      } else {
        if (this.panelType === 'table' && this.$route.query.isAvancedQuery) {
          this.fieldList.forEach(fieldItem => {
            if (this.$route.query.hasOwnProperty(fieldItem.columnName) && fieldItem.isAvancedQuery) {
              fieldItem.isShowedFromUser = true

              if (String(this.$route.query.isAvancedQuery) === String(fieldItem.isAvancedQuery)) {
                fieldItem.value = this.$route.query[fieldItem.columnName]
                if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
                  fieldItem.value = new Date(fieldItem.value)
                } else if (fieldItem.componentPath === 'FieldYesNo') {
                  fieldItem.value = Boolean(fieldItem.value)
                }
              }
              if (fieldItem.isRange && this.$route.query[fieldItem.columnName + '_To']) {
                fieldItem.valueTo = this.$route.query[fieldItem.columnName + '_To']
                if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
                  fieldItem.valueTo = new Date(fieldItem.valueTo)
                }
              }
            }
          })
        } else if (this.panelType === 'process' || this.panelType === 'browser') {
          this.fieldList.forEach(fieldItem => {
            if (this.$route.query.hasOwnProperty(fieldItem.columnName)) {
              fieldItem.isShowedFromUser = true

              fieldItem.value = this.$route.query[fieldItem.columnName]
              if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
                fieldItem.value = new Date(fieldItem.value)
              } else if (fieldItem.componentPath === 'FieldYesNo') {
                fieldItem.value = Boolean(fieldItem.value)
              }

              if (fieldItem.isRange && this.$route.query[fieldItem.columnName + '_To']) {
                fieldItem.valueTo = this.$route.query[fieldItem.columnName + '_To']
                if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
                  fieldItem.valueTo = new Date(fieldItem.valueTo)
                }
              }
            }
          })
        }
      }
    },
    getDataList() {
      this.$store.dispatch('getDataListTab', {
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid
      })
        .then(response => {
          if (response.length) {
            this.$router.push({ name: this.$route.name, query: { action: response[0].UUID, tabNumber: 0 }})
            this.$store.dispatch('notifyPanelChange', {
              parentUuid: this.parentUuid,
              containerUuid: this.containerUuid,
              newValues: response[0],
              isDontSendToEdit: true,
              fieldList: this.fieldList
            })
            this.setTagsViewTitle(this.$route.query.action)
            this.isLoadRecord = true
          }
        })
        .catch(error => {
          console.warn(error)
        })
    },
    /**
     * @param  {string} table Table name in BD
     * @param  {string} uuidRecord Universal Unique Identifier Record
     */
    getData(table = null, uuidRecord = null) {
      // break get data, this record is the same
      if (!this.isEmptyValue(uuidRecord) && uuidRecord === this.getterRecordUuid) {
        return
      }
      if (!table) {
        this.$message({
          message: this.$t('data.emtpyTableName'),
          type: 'error',
          showClose: true
        })
        console.warn('DataRecord Panel - Error: Table Name is not defined ')
        return
      }
      // this data row exists in vuex store
      if (this.getterRowData) {
        this.dataRecords = this.getterRowData
        this.$store.dispatch('notifyPanelChange', {
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          newValues: this.getterRowData,
          isDontSendToEdit: true,
          fieldList: this.fieldList
        }).then(() => {
          this.changeIsLoadRecord()
        })
        this.setTagsViewTitle(this.$route.query.action)
        this.isLoadRecord = true
        return
      }

      this.$store.dispatch('getEntity', {
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid,
        tableName: table,
        recordUuid: uuidRecord
      })
        .then(response => {
          this.dataRecords = response
          this.$router.push({
            name: this.$route.name,
            query: {
              action: this.dataRecords.UUID,
              tabNumber: 0
            }
          })
          this.$store.dispatch('notifyPanelChange', {
            parentUuid: this.parentUuid,
            containerUuid: this.containerUuid,
            newValues: response,
            isDontSendToEdit: true,
            fieldList: this.fieldList
          })
          this.setTagsViewTitle(this.$route.query.action)
          this.isLoadRecord = true
        })
        .catch(error => {
          this.$message({
            message: this.$t('data.errorGetData'),
            type: 'error',
            showClose: true
          })
          console.warn('DataRecord Panel - Error ' + error.code + ': ' + error.message)
        })
    },
    changeIsLoadRecord() {
      // notify record is load
      if (!this.metadata.isLoadRecord) {
        this.$store.dispatch('changeTabIsLoadRecord', {
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          isLoadRecord: true
        })
      }
    },
    /**
     * Group the arrangement into groups of columns that they contain, it must
     * be grouped after having the order
     * @param {array} array
     * @return {array} res
     */
    sortAndGroup(arr) {
      if (arr === undefined) {
        return
      }

      // reduce, create array with number groupAssigned element comun
      var res = arr
        .reduce((res, currentValue) => {
          if (res.indexOf(currentValue.groupAssigned) === -1) {
            res.push(currentValue.groupAssigned)
          }
          return res
        }, [])
        .map(itemGroup => {
          return {
            groupFinal: itemGroup,
            metadataFields: arr.filter(itemField => {
              return itemField.groupAssigned === itemGroup
            })
          }
        })

      // count and add the field numbers according to your group
      Object.keys(res).forEach(key => {
        let count = 0
        const typeG = res[key].metadataFields[0].typeGroupAssigned

        res[key].numberFields = res[key].metadataFields.length
        res[key].typeGroup = typeG
        res[key].numberFields = res[key].metadataFields.length

        res[key].metadataFields.forEach((element, index) => {
          if (element.isAvancedQuery) {
            element.isDisplayed = true
            element.isDisplayedFromLogic = true
            element.isShowedFromUser = true
            if (index > 0) {
              element.isShowedFromUser = false
            }
          }
          if (element.isDisplayed) {
            count++
          }
        })

        if ((this.group.groupType === 'T' && this.group.groupName === res[key].groupFinal) ||
          (this.group.groupType !== 'T' && res[key].typeGroup !== 'T')) {
          this.groupsView = this.groupsView + 1
        }
        res[key].activeFields = count
      })

      return res
    },
    setTagsViewTitle(actionValue) {
      var tempRoute = this.$route
      if (actionValue === 'create-new' || actionValue === '') {
        this.tagTitle.action = this.$t('tagsView.newRecord')
      } else {
        var field = this.fieldList.find(
          fieldItem => fieldItem.isIdentifier === true
        )
        if (field !== undefined) {
          if (this.dataRecords[field.name]) {
            this.tagTitle.action = this.dataRecords[field.name]
          } else {
            this.tagTitle.action = field.value
          }
        } else {
          this.tagTitle.action = this.$t('tagsView.seeRecord')
        }
      }
      if (this.$route.meta && this.$route.meta.type === 'window') {
        var route = Object.assign({}, tempRoute, { title: `${this.tagTitle.base} - ${this.tagTitle.action}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
    },
    setData(dataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData('Text', '')
    }
  }
}
</script>

<style scoped>
  .loading-panel {
    padding: 100px;
    height: 100%;
  }

  .cards-in-group {
    column-count: 2;  /*numbers of columns */
    column-gap: 1em;
  }
  .cards-not-group {
    column-count: 1; /* numbers of columns */
    column-gap: 1em;
    margin-bottom: 5px;
  }

  .card {
    /* padding: 10px; */
    width: 100% !important;
    transition: all 100ms ease-in-out;
    display: inline-block;
    perspective: 1000;
    backface-visibility: hidden;
  }
  .el-card {
    width: 100% !important;
  }
</style>
<style>
  .select-filter {
    width: 280px !important;
    float: right;
    top: 0;
  }
  .select-filter-header {
    width: 60% !important;
    float: right;
    top: 0px;
  }
</style>
