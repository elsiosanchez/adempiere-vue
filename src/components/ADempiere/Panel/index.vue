<template>
  <div class="wrapper">
    <el-form
      v-model="dataRecords"
      :label-position="labelPosition"
      label-width="200px"
    >
      <template v-if="typeof determinateGroup(firstGroup.groupFinal, 'header') === 'undefined'">
        <div v-show="size > 0 && firstGroup.activeFields > 0" class="cards-not-group">
          <div
            v-if="checkInGroup(firstGroup.groupFinal)
              && (group.groupType == 'T' && group.groupName == firstGroup.groupFinal)
              || (group.groupType !== 'T' && firstGroup.typeGroup !== 'T')"
            :style="determinateGroup(firstGroup.groupFinal, 'style')"
            class="card"
          >
            <el-card
              shadow="hover"
            >
              <div slot="header" class="clearfix">
                <span>
                  {{ determinateGroup(firstGroup.groupFinal, 'header') }}
                </span>
                <el-popover
                  placement="top"
                  title="Selected fields"
                  width="200"
                  trigger="click"
                >
                  <filter-fields
                    :container-uuid="containerUuid"
                    :panel-type="panelType"
                  />
                  <el-button slot="reference" style="float: right; padding: 3px 0">
                    Add Optional Fields
                  </el-button>
                </el-popover>
              </div>
              <el-row :gutter="gutterRow">
                <template v-for="(subItem, subKey) in firstGroup.metadataFields">
                  <field
                    :key="subKey"
                    :parent-uuid="parentUuid"
                    :container-uuid="containerUuid"
                    :metadata-field="subItem"
                    :load-record="loadRecord"
                    :recorddata-fields="dataRecords[subItem.columnName]"
                    :span="checkNextField(firstGroup.metadataFields, subKey)"
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
                v-if="checkInGroup(item.groupFinal)
                  && (group.groupType == 'T' && group.groupName == item.groupFinal)
                  || (group.groupType !== 'T' && item.typeGroup !== 'T')"
                :key="key"
                :style="determinateGroup(item.groupFinal, 'style')"
                class="card"
              >
                <el-card
                  shadow="hover"
                >
                  <div slot="header" class="clearfix">
                    <span>
                      {{ determinateGroup(item.groupFinal, 'header') }}
                    </span>
                    <el-popover
                      placement="top"
                      title="Selected fields"
                      width="200"
                      trigger="click"
                    >
                      <filter-fields
                        :container-uuid="containerUuid"
                        :panel-type="panelType"
                      />
                      <el-button slot="reference" style="float: right; padding: 3px 0">
                        Add Optional Fields
                      </el-button>
                    </el-popover>
                  </div>
                  <el-row :gutter="gutterRow">
                    <template v-for="(subItem, subKey) in item.metadataFields">
                      <field
                        :key="subKey"
                        :parent-uuid="parentUuid"
                        :container-uuid="containerUuid"
                        :metadata-field="subItem"
                        :load-record="loadRecord"
                        :recorddata-fields="dataRecords[subItem.columnName]"
                        :span="countWidthField(item.groupFinal, item.activeFields, subItem)"
                        :panel-type="panelType"
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
  </div>
</template>

<script>
import Field from '@/components/ADempiere/Field'
import FilterFields from '@/components/ADempiere/Panel/filterFields'
import SizeField from '@/components/ADempiere/Field/fieldSize'

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
    parentsTab: {
      type: Boolean,
      default: true
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
      labelPosition: 'top',
      lineNumber: 1,
      gutterRow: 0,
      sizesFields: SizeField,
      minSizeColumns: 3,
      preSizeColumns: 12,
      maxSizeColumns: 24,
      loadPanel: false,
      loadRecord: false,
      uuidRecord: this.$route.params.uuidRecord,
      fieldGroups: [],
      firstGroup: {},
      size: 0,
      groupsView: 0
    }
  },
  watch: {
    containerUuid: function() {
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
    reloadContextMenu() {
      this.$store.dispatch('reloadContextMenu', {
        containerUuid: this.containerUuid
      })
    },
    determinateGroup(group, type) {
      if (type === 'header') {
        if (group !== '') {
          return group
        }
        return undefined
      } else if (type === 'class' || type === 'style') {
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
      }
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    getPanel() {
      var fieldList = this.$store.getters.getFieldsListFromPanel(this.containerUuid)
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
      this.firstGroup = this.fieldGroups[0]
      this.fieldGroups.shift()
      this.size = this.firstGroup.metadataFields.length
      this.loadPanel = true
      if (this.isEdit && this.panelType === 'window') {
        this.getData(this.tableName)
      }
      this.reloadContextMenu()
    },
    notifyPanelChange() {
      this.$store.dispatch('notifyPanelChange', {
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid
      })
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
      // if (this.loadRecord === false) {
      this.$store.dispatch('requestObject', {
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
     * [checkInGroup description]
     * @param  {string | integer} groupFinal [description]
     * @return {bool} if in group field.
     */
    checkInGroup(groupFinal) {
      if (typeof groupFinal === 'undefined' ||
        groupFinal === '') {
        return false
      } else {
        return true
      }
    },
    /**
     * Account the field width according to which it establishes the component,
     * taking maximum by default when it has no field group and the minimum when
     * it has a field group
     * @param  {object} field Attributes of the field
     * @param  {integer} [quantityFields=0] number of active fields that exist in the group
     * @return {integer} size that the field will have
     */
    countWidthField(group, quantityFields = 0, field) {
      var inGroup = false

      if (this.$store.state.app.device === 'mobile') {
        quantityFields = 1
      }
      if (group !== '') {
        inGroup = true
      }
      if (quantityFields === 1) {
        return 24
      } else if (quantityFields === 2) {
        return 12
      }
      var size = this.sizesFields.find((item) => {
        if (item.types.indexOf(field.displayType)) {
          return true
        }
      })

      if (inGroup) {
        return size.sizeInGroup.max
      } else {
        return size.sizeNotGroup.max
      }
    },
    /**
     * Order the fields, then assign the groups to each field, and finally group
     * in an array according to each field group
     * @param  {array} arrFields
     * @return {array} arrFields
     */
    sortAndGroup(arrFields) {
      return this.groupFields(
        this.assignedGroup(
          this.sortFields(arrFields)
        )
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
     * [assignedGroup description]
     * @param  {array} arr [description]
     * @return {array} arrGroup [description]
     */
    assignedGroup(arr) {
      if (typeof arr[0] === 'undefined') {
        return arr
      }

      let firstChangeGroup = false
      let currentGroup = ''
      let typeGroup = ''
      if (arr[0].fieldGroup.name === '' ||
        arr[0].fieldGroup.name === null) {
        currentGroup = ''
        typeGroup = ''
      }

      arr.forEach(fieldElement => {
        // change the first field group, change the band
        if (!firstChangeGroup) {
          if (typeof fieldElement.fieldGroup.name !== 'undefined' &&
            fieldElement.fieldGroup.name !== null &&
            fieldElement.fieldGroup.name !== '' &&
            currentGroup !== fieldElement.fieldGroup.name &&
            fieldElement.isDisplayed) {
            firstChangeGroup = true
          }
        }
        //  if you change the field group for the first time and it is different
        //  from 0, updates the field group, since it is another field group and
        //  assigns the following field items to the current field group whose
        //  field group is '' or null
        if (firstChangeGroup) {
          if (typeof fieldElement.fieldGroup.name !== 'undefined' &&
            fieldElement.fieldGroup.name !== null &&
            fieldElement.fieldGroup.name !== '') {
            currentGroup = fieldElement.fieldGroup.name
            typeGroup = fieldElement.fieldGroup.fieldGroupType
          }
        }

        fieldElement.GroupAssigned = currentGroup
        fieldElement.TypeGroup = typeGroup
      })

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

      // reduce, create array with number GroupAssigned element comun
      var res = arr.reduce((res, currentValue) => {
        if (res.indexOf(currentValue.GroupAssigned) === -1) {
          res.push(currentValue.GroupAssigned)
        }
        return res
      }, [])
        .map((_group) => {
          return {
            groupFinal: _group,
            metadataFields: arr.filter((_el) => {
              return _el.GroupAssigned === _group
            })
              .map((_el) => {
                return _el
              })
          }
        })

      // count and add the field numbers according to your group
      Object.keys(res).forEach(key => {
        let count = 0
        const typeG = res[key].metadataFields[0].TypeGroup

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
    checkNextField(item, position) {
      if (position + 1 < item.length) {
        if (item[position].displayType === 20 && item[position + 1].displayType === 20) {
          // console.log(item[position + 1].columnName)
          var span = 6
        } else {
          span = this.countWidthField(
            item[position].groupFinal, item[position].activeFields, item[position]
          )
        }
      }
      return span
    }
  }
}
</script>

<style scoped>
  .box {
    width: 400px;
  }

  .top {
    text-align: center;
  }

  .bottom {
    clear: both;
    text-align: center;
  }

  .left {
    float: left;
    width: 110px;
  }

  .right {
    float: right;
    width: 110px;
  }

  .item {
    margin: 4px;
  }

  .left .el-tooltip__popper,
  .right .el-tooltip__popper {
    padding: 8px 10px;
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
    margin: 0 0 1em;
    width: 100% !important;
    cursor: pointer;
    transition: all 100ms ease-in-out;
    display: inline-block;
    perspective: 1000;
    backface-visibility: hidden;
  }

  .el-card {
    width: 100% !important;
  }
</style>
