<template>
  <div class="wrapper">
    <el-form
      v-if="isLoadPanel"
      v-model="dataRecords"
      label-position="top"
      label-width="200px"
    >
      <template
        v-if="firstGroup !== undefined &&
          firstGroup.groupFinal === ''"
      >
        <div v-show="firstGroup.activeFields > 0" class="cards-not-group">
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
              />
            </div>
            <el-card
              shadow="hover"
            >
              <el-row :gutter="gutterRow">
                <template v-for="(subItem, subKey) in firstGroup.metadataFields">
                  <field
                    :key="subKey"
                    :parent-uuid="parentUuid"
                    :container-uuid="containerUuid"
                    :metadata-field="subItem"
                    :is-load-record="isLoadRecord"
                    :record-data-fields="dataRecords[subItem.columnName]"
                    :panel-type="panelType"
                    :in-group="getterIsShowedRecordNavigation"
                  />
                </template>
              </el-row>
            </el-card>
          </div>
        </div>
      </template>
      <div :class="cards()">
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
                  shadow="hover"
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
                      />
                    </div>
                  </div>
                  <el-row :gutter="gutterRow">
                    <template v-for="(subItem, subKey) in item.metadataFields">
                      <field
                        :key="subKey"
                        :parent-uuid="parentUuid"
                        :container-uuid="containerUuid"
                        :metadata-field="subItem"
                        :is-load-record="isLoadRecord"
                        :record-data-fields="dataRecords[subItem.columnName]"
                        :panel-type="panelType"
                        :in-group="mutipleGroups"
                      />
                    </template>
                  </el-row>
                </el-card>
              </div>
            </el-col>
          </el-row>
        </template>
      </div>
    </el-form>
    <div
      v-else
      v-loading="!isLoadPanel"
      :element-loading-text="$t('notifications.loading')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      class="loading-panel"
    />
  </div>
</template>

<script>
import { isEmptyValue } from '@/utils/ADempiere'
import Field from '@/components/ADempiere/Field'
import FilterFields from '@/components/ADempiere/Panel/filterFields'

export default {
  name: 'Panel',
  components: {
    Field,
    FilterFields
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
    tableName: {
      type: String,
      default: undefined
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
    }
  },
  data() {
    return {
      fieldList: [],
      dataRecords: {},
      gutterRow: 0,
      isLoadPanel: false,
      isLoadRecord: false,
      uuidRecord: this.$route.query.action,
      fieldGroups: [],
      firstGroup: {},
      groupsView: 0,
      isShowRecordNavigation: false,
      mutipleGroups: Boolean(this.panelType === 'window'),
      tagTitle: { base: this.$route.meta.title, action: '' }
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
      return this.$store.getters.getFieldsListFromPanel(this.containerUuid)
    },
    getterRecordUuid() {
      return this.$store.getters.getUuid(this.containerUuid)
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    }
  },
  watch: {
    containerUuid() {
      this.generatePanel(this.metadata.fieldList)
    },
    '$route.query.action'(actionValue) {
      this.uuidRecord = actionValue

      if (this.panelType === 'window') {
        // TODO: Validate UUID value
        if (actionValue !== 'create-new') {
          this.getData(this.tableName, actionValue)
        } else {
          this.$store.dispatch('resetPanelToNew', {
            containerUuid: this.containerUuid
          })
        }
        this.setTagsViewTitle(actionValue)
      }
    },
    // used if the first load contains a uuid
    isLoadRecord(value) {
      // TODO: Validate UUID value
      if (value && this.panelType === 'window' && this.uuidRecord !== 'create-new' && !this.isEmptyValue(this.uuidRecord)) {
        this.setTagsViewTitle(this.uuidRecord)
      }
    }
  },
  created() {
    // get tab with uuid
    this.getPanel()
  },
  methods: {
    isEmptyValue,
    cards() {
      if (this.isMobile || this.groupsView < 2 || !this.mutipleGroups || this.getterIsShowedRecordNavigation) {
        return 'cards-not-group'
      }
      return 'cards-in-group'
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    getPanel() {
      var fieldList = this.getterFieldList
      if (fieldList && fieldList.length > 0) {
        this.generatePanel(fieldList)
      } else {
        this.$store.dispatch('getPanelAndFields', {
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          type: this.panelType
        }).then(response => {
          this.generatePanel(response.fieldList)
        }).catch(error => {
          console.warn('Field Load Error ' + error.code + ': ' + error.message)
        })
      }
    },
    generatePanel(fieldList) {
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
        this.isShowRecordNavigation = this.getterIsShowedRecordNavigation
        if (this.uuidRecord && this.uuidRecord !== 'create-new') {
          this.getData(this.tableName, this.uuidRecord)
        } else if (this.uuidRecord === 'create-new' && !isEmptyValue(this.getterRecordUuid)) {
          this.$store.dispatch('resetPanelToNew', {
            containerUuid: this.containerUuid
          })
        } else {
          this.$message({
            message: this.$t('data.createNewRecord'),
            showClose: true
          })
        }
      }
    },
    /**
     * @param  {string} table Table name in BD
     * @param  {string} uuidRecord Universal Unique Identifier Record
     */
    getData(table = null, uuidRecord = null) {
      // break get data, this record is the same
      if (!isEmptyValue(uuidRecord) && uuidRecord === this.getterRecordUuid) {
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

      this.$store.dispatch('getEntity', {
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid,
        table: table,
        recordUuid: uuidRecord
      })
        .then(response => {
          this.dataRecords = response
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
    /**
     * Order the fields, then assign the groups to each field, and finally group
     * in an array according to each field group
     * @param  {array} arrFields
     * @return {array} arrFields
     */
    sortAndGroup(arrFields) {
      return this.groupFields(
        this.sortFields(arrFields)
      )
    },
    /**
     * Sorts the column components according to the value that is obtained from
     * the array that contains the JSON objects in the data.SortNo property
     * @param  {array} arr
     * @return {array} order by arr.data.SortNo
     */
    sortFields(arr, orderBy = 'sequence', type = 'asc') {
      if (this.panelType === 'browser') {
        orderBy = 'seqNoGrid'
      }
      arr.sort((itemA, itemB) => {
        return itemA[orderBy] - itemB[orderBy]
        // return itemA[orderBy] > itemB[orderBy]
      })
      if (type.toLowerCase() === 'desc') {
        return arr.reverse()
      }
      return arr
    },
    /**
     * Group the arrangement into groups of columns that they contain, it must
     * be grouped after having the order
     * @param {array} array
     * @return {array} res
     */
    groupFields(arr) {
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

        res[key].metadataFields.forEach(element => {
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

        if (this.dataRecords[field.name]) {
          this.tagTitle.action = this.dataRecords[field.name]
        } else {
          this.tagTitle.action = field.value
        }
      }
      if (this.$route.meta && this.$route.meta.type === 'window') {
        var route = Object.assign({}, tempRoute, { title: `${this.tagTitle.base} - ${this.tagTitle.action}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
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
