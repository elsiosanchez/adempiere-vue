<template>
  <div class="wrapper">
    <el-form
      v-if="isLoadPanel"
      v-model="dataRecords"
      label-position="top"
      label-width="200px"
    >
      <template
        v-if="typeof firstGroup !== 'undefined' &&
          firstGroup.groupFinal === ''"
      >
        <div v-show="size > 0 && firstGroup.activeFields > 0" class="cards-not-group">
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
                v-if="item.groupFinal.trim() !== ''
                  && (group.groupType == 'T' && group.groupName == item.groupFinal)
                  || (group.groupType !== 'T' && item.typeGroup !== 'T')"
                :key="key"
                :style="columnGroup(item.groupFinal)"
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
                        :in-group="true"
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
      class="load-panel"
    />
  </div>
</template>

<script>
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
      default: ''
    },
    group: {
      type: Object,
      default: () => ({
        groupType: '',
        groupName: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
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
      uuidRecord: this.$route.params.uuidRecord,
      fieldGroups: [],
      firstGroup: {},
      size: 0,
      groupsView: 0
    }
  },
  computed: {
    getterFieldList() {
      return this.$store.getters.getFieldsListFromPanel(this.containerUuid)
    }
  },
  watch: {
    containerUuid() {
      this.generatePanel(this.metadata.fieldList)
    }
  },
  created() {
    // get tab with uuid
    this.getPanel()
  },
  methods: {
    cards() {
      if (this.$store.state.app.device === 'mobile') {
        return 'cards-not-group'
      }
      return 'cards'
    },
    columnGroup(group) {
      var style = {}
      if (this.groupsView === 1) {
        style['column-count'] = 1
      }
      if (this.groupsView === 2) {
        style['column-count'] = 1
      }
      if (group === '' && this.groupsView > 2) {
        style['column-count'] = 1
      }
      if (this.$store.state.app.device === 'mobile') {
        style['column-count'] = 1
      }
      return style
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    getPanel() {
      var fieldList = this.getterFieldList
      if (typeof fieldList === 'undefined' || fieldList.length === 0) {
        this.$store.dispatch('getPanelAndFields', {
          parentUuid: this.parentUuid,
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
      this.fieldList = fieldList
      this.fieldGroups = this.sortAndGroup(fieldList)
      this.firstGroup = undefined
      if (this.fieldGroups[0]) {
        this.firstGroup = this.fieldGroups[0]
        this.size = this.firstGroup.metadataFields.length
      }
      this.fieldGroups.shift()
      this.isLoadPanel = true
      if (this.panelType === 'window' && (this.uuidRecord || this.isEdit)) {
        this.getData(this.tableName, this.uuidRecord)
      }
    },
    /**
     * @param  {string} table Table name in BD
     * @param  {string} uuidRecord Universal Unique Identifier Record
     */
    getData(table = '', uuidRecord = null) {
      if (table === null || table === '') {
        this.$message({
          message: 'Error getting data records',
          type: 'error',
          showClose: true
        })
        console.warn('DataRecord Panel - Error: Table Name is not defined ')
        return
      }
      if (uuidRecord === ':uuidRecord') {
        uuidRecord = undefined
      }

      // if (this.isLoadRecord === false) {
      this.$store.dispatch('getObject', {
        table: table,
        recordUuid: uuidRecord,
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid
      })
        .then(response => {
          this.dataRecords = response
        })
        .catch(err => {
          this.$message({
            message: 'Error getting data records',
            type: 'error',
            showClose: true
          })
          console.warn('DataRecord Panel - Error ' + err.code + ': ' + err.message)
        })
      // }
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
      if (typeof arr === 'undefined') {
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
        .map((itemGroup) => {
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
    }
  }
}
</script>

<style scoped>
  .load-panel{
    padding: 100px;
    height: 100%;
  }
</style>
<style>
  .cards {
    column-count: 2;  /*numbers of columns */
    column-gap: 1em;
    margin-top: 10px;
  }

  .cards-not-group {
    column-count: 1; /* numbers of columns */
    column-gap: 1em;
    margin-top: 10px;
  }

  .card {
    padding: 10px;
    width: 100% !important;
    transition: all 100ms ease-in-out;
    display: inline-block;
    perspective: 1000;
    backface-visibility: hidden;
  }
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
  .el-card {
    width: 100% !important;
  }
</style>
