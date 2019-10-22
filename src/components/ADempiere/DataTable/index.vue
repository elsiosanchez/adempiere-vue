<template>
  <el-container v-if="isLoadPanel" label-position="top" style="height: inherit;">
    <el-main style="padding: 0px!important; overflow: hidden;">
      <el-container style="height: 100%;">
        <el-header :style="isAdvancedQuery ? this.activeName ? {height: '50%',overflow: 'auto'} :{height: '12%',overflow: 'hidden'} : { height: '5%' }">
          <div>
            <div v-if="!isMobile">
              <el-menu :default-active="menuTable" :class="classTableMenu() + ' menu-table-container'" mode="horizontal">
                <el-submenu index="2">
                  <template slot="title">
                    <i class="el-icon-more" />
                  </template>
                  <el-menu-item
                    v-if="!isParent && panelType === 'window'"
                    :disabled="Boolean(inEdited.length || !getterPanel.isInsertRecord || (!isParent && $route.query.action === 'create-new'))"
                    index="new"
                    @click="addNewRow()"
                  >
                    {{ $t('window.newRecord') }}
                  </el-menu-item>
                  <el-menu-item
                    v-if="panelType === 'window'"
                    :disabled="Boolean(getDataSelection.length < 1)"
                    index="delete"
                    @click="deleteSelection()"
                  >
                    {{ $t('table.dataTable.deleteSelection') }}
                  </el-menu-item>
                  <el-menu-item
                    v-if="isParent && panelType === 'window'"
                    :disabled="Boolean(getterDataRecords.length <= 0)"
                    index="advancedQuery"
                    @click="activeAdvancedQuery(!isAdvancedQuery)"
                  >
                    {{ $t('table.dataTable.advancedQuery') }}
                  </el-menu-item>
                  <el-menu-item index="optional" @click="optionalPanel()">
                    {{ $t('components.filterableItems') }}
                  </el-menu-item>
                  <el-menu-item index="fixed" @click="fixedPanel()">
                    {{ $t('components.fixedleItems') }}
                  </el-menu-item>
                </el-submenu>
              </el-menu>
              <el-button
                v-if="!isParent && panelType === 'window'"
                type="text"
                icon="el-icon-circle-plus"
                style="float: right;padding-top: 10px;font-size: large;padding-left: 6px;"
                :disabled="Boolean(inEdited.length || !getterPanel.isInsertRecord || (!isParent && $route.query.action === 'create-new'))"
                @click="addNewRow()"
              />
              <icon-element v-if="isFixed && !isMobile" icon="el-icon-news">
                <fixed-columns
                  :container-uuid="containerUuid"
                  :panel-type="panelType"
                  class="header-search-input"
                />
              </icon-element>
              <filter-columns
                v-if="isOptional"
                :container-uuid="containerUuid"
                :panel-type="panelType"
                class="field-optional"
              />
              <!-- <i class="el-icon-circle-plus-outline" /> -->
              <div :class="{'show':showTableSearch}" class="table-search">
                <svg-icon class-name="search-icon" icon-class="search" @click.stop="click()" />
                <el-input
                  ref="headerSearchSelect"
                  v-model="searchTable"
                  size="mini"
                  :placeholder="$t('table.dataTable.search')"
                  class="header-search-select"
                  clearable
                />
              </div>
            </div>
            <div v-else>
              <div v-if="!isParent">
                <el-menu :default-active="menuTable" :class="classTableMenu() + ' menu-table-container'" mode="horizontal">
                  <el-submenu index="2">
                    <template slot="title">
                      <i class="el-icon-more" />
                    </template>
                    <el-menu-item
                      v-if="panelType === 'window'"
                      :disabled="Boolean(getDataSelection.length < 1)"
                      index="delete"
                      @click="deleteSelection()"
                    >
                      {{ $t('table.dataTable.deleteSelection') }}
                    </el-menu-item>
                    <el-menu-item
                      v-if="isParent && panelType === 'window'"
                      :disabled="Boolean(getterDataRecords.length <= 0)"
                      index="advancedQuery"
                      @click="activeAdvancedQuery(!isAdvancedQuery)"
                    >
                      {{ $t('table.dataTable.advancedQuery') }}
                    </el-menu-item>
                    <el-menu-item index="optional" @click="optionalPanel()">
                      {{ $t('components.filterableItems') }}
                    </el-menu-item>
                    <el-menu-item index="fixed" @click="fixedPanel()">
                      {{ $t('components.fixedleItems') }}
                    </el-menu-item>
                    <el-menu-item
                      v-if="!isParent && panelType === 'window'"
                      :disabled="Boolean(inEdited.length || !getterPanel.isInsertRecord || (!isParent && $route.query.action === 'create-new'))"
                      index="new"
                      @click="addNewRow()"
                    >
                      {{ $t('window.newRecord') }}
                    </el-menu-item>
                  </el-submenu>
                </el-menu>
                <icon-element v-if="isFixed" icon="el-icon-news">
                  <fixed-columns
                    :container-uuid="containerUuid"
                    :panel-type="panelType"
                    class="header-search-input"
                  />
                </icon-element>
                <filter-columns
                  v-if="isOptional"
                  :container-uuid="containerUuid"
                  :panel-type="panelType"
                  class="field-optional"
                />
                <div :class="{'show':showTableSearch}" class="table-search">
                  <svg-icon class-name="search-icon" icon-class="search" @click.stop="click()" />
                  <el-input
                    ref="headerSearchSelect"
                    v-model="searchTable"
                    size="mini"
                    :placeholder="$t('table.dataTable.search')"
                    class="header-search-select"
                    clearable
                  />
                </div>
              </div>
              <div v-else class="panel-expand">
                <div :class="{'show':showTableSearch}" class="table-search">
                  <svg-icon class-name="search-icon" icon-class="search" @click.stop="click()" />
                  <el-input
                    ref="headerSearchSelect"
                    v-model="searchTable"
                    size="mini"
                    :placeholder="$t('table.dataTable.search')"
                    class="header-search-select-mobile"
                    clearable
                  />
                </div>
                <el-button
                  v-show="isParent && panelType === 'window' && isMobile && getDataSelection.length"
                  type="text"
                  icon="el-icon-delete"
                  style="color: black;font-size: 17px;font-weight: 605!important;"
                  @click="deleteSelection()"
                />
                <icon-element icon="el-icon-news" style="padding-top: 0px;" @click="searchRecordNavegation()">
                  <fixed-columns
                    :container-uuid="containerUuid"
                    :panel-type="panelType"
                    class="header-search-input-mobile"
                  />
                </icon-element>
              </div>
            </div>
          </div>
          <br>
          <el-collapse-transition>
            <!-- // TODO: Evaluate when isAdvancedQuery not request to server -->
            <!-- // TODO: Copy panell with getter and filter fields -->
            <el-collapse
              v-if="isParent && isAdvancedQuery"
              v-show="$route.query.action === 'advancedQuery'"
              v-model="activeName"
              accordion
            >
              <el-collapse-item :title="$t('table.dataTable.advancedQuery')" name="1">
                <main-panel
                  :container-uuid="containerUuid"
                  :parent-uuid="parentUuid"
                  :metadata="getterPanel"
                  :panel-type="'table'"
                  :is-advanced-query="true"
                  style="height: 171; overflow: hidden; width:100%;"
                />
              </el-collapse-item>
            </el-collapse>
          </el-collapse-transition>
        </el-header>
        <el-main style="padding: 0px!important; overflow: hidden;">
          <el-table
            ref="multipleTable"
            v-loading="isLoaded"
            :height="getHeigthTable"
            style="width: 100%"
            border
            :row-key="getterPanel.keyColumn"
            highlight-current-row
            :reserve-selection="true"
            :row-style="rowStyle"
            :data="showTableSearch ? filterResult() : getterDataRecords"
            :element-loading-text="$t('notifications.loading')"
            element-loading-background="rgba(255, 255, 255, 0.8)"
            element-loading-spinner="el-icon-loading"
            cell-class-name="datatable-max-cell-height"
            @row-click="handleRowClick"
            @row-dblclick="handleRowDblClick"
            @select="handleSelection"
            @select-all="handleSelectionAll"
          >
            <el-table-column
              v-if="isTableSelection"
              type="selection"
              :prop="getterPanel.keyColumn"
              fixed
              min-width="50"
            />
            <template v-for="(item, key) in fieldList">
              <el-table-column
                v-if="isDisplayed(item)"
                :key="key"
                :label="headerLabel(item)"
                :column-key="item.columnName"
                :prop="item.columnName"
                sortable
                :formatter="changeOrder"
                min-width="200"
                :class-name="cellClass(item)"
                :fixed="item.isFixedTableColumn"
              >
                <template slot-scope="scope">
                  <template v-if="scope.row.isEdit && !isReadOnly(scope.row, item)">
                    <field-definition
                      :is-data-table="true"
                      :is-show-label="false"
                      :in-table="true"
                      :metadata-field="{
                        ...item,
                        parentUuid: parentUuid,
                        displayColumn: scope.row['DisplayColumn_' + item.columnName],
                        tableIndex: scope.$index,
                        rowKey: scope.row[getterPanel.keyColumn],
                        keyColumn: getterPanel.keyColumn,
                        recordUuid: scope.row.UUID
                      }"
                      :record-data-fields="scope.row[item.columnName]"
                      size="mini"
                      @keyup.enter.native="confirmEdit(scope.row)"
                    />
                  </template>
                  <span v-else>
                    {{ displayedValue(scope.row, item) }}
                  </span>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </el-main>
      </el-container>
    </el-main>
    <el-footer style="height: 30px;">
      <div>
        <div style="float: right;">
          <el-pagination
            layout="slot, total, prev, pager, next"
            :current-page="currentPage"
            :page-size="defaultMaxPagination"
            :total="getterDataRecords.length"
            @current-change="handleChangePage"
          >
            <template v-slot>
              <span>{{ $t('table.dataTable.selected') }}: {{ getDataSelection.length }} / </span>
            </template>
          </el-pagination>
        </div>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import FieldDefinition from '@/components/ADempiere/Field'
import Sortable from 'sortablejs'
import FilterColumns from '@/components/ADempiere/DataTable/filterColumns'
import FixedColumns from '@/components/ADempiere/DataTable/fixedColumns'
import IconElement from '@/components/ADempiere/IconElement'
import { formatDate } from '@/filters/ADempiere'
import MainPanel from '@/components/ADempiere/Panel'
import { sortFields } from '@/utils/ADempiere'

export default {
  name: 'DataTable',
  components: {
    FieldDefinition,
    FilterColumns,
    FixedColumns,
    IconElement,
    MainPanel
  },
  props: {
    parentUuid: {
      type: String,
      default: ''
    },
    containerUuid: {
      type: String,
      default: ''
    },
    panelType: {
      type: String,
      default: 'window'
    },
    // is used in root view with primary records
    isParent: {
      type: Boolean,
      default: false
    },
    // Show input section from search in data
    isSearchable: {
      type: Boolean,
      default: false
    },
    // Show check from selection row
    isTableSelection: {
      type: Boolean,
      default: true
    },
    // Show check from selection row, send to panel form
    isShowedPanelRecord: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchTable: '', // text from search
      defaultMaxPagination: 100,
      menuTable: '1',
      activeName: '1',
      isOptional: false,
      isFixed: false,
      isLoadPanelFromServer: false,
      rowStyle: { height: '52px' },
      sortable: null,
      isExpand: false,
      currentPage: 1,
      inEdited: [],
      uuidCurrentRecordSelected: '',
      showTableSearch: false,
      isAdvancedQuery: false
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterPanel() {
      return this.$store.getters.getPanel(this.containerUuid)
    },
    getterDataRecordsAndSelection() {
      return this.$store.getters.getDataRecordAndSelection(this.containerUuid)
    },
    getterDataRecords() {
      return this.getterDataRecordsAndSelection.record
    },
    getPageNumber() {
      return this.getterDataRecordsAndSelection.pageNumber
    },
    isLoaded() {
      return !this.getterDataRecordsAndSelection.isLoaded
    },
    getDataSelection() {
      return this.getterDataRecordsAndSelection.selection
    },
    getterFieldIsDisplayed() {
      return this.$store.getters.getFieldsIsDisplayed(this.containerUuid)
    },
    getterIsShowedCriteria() {
      var browser = this.$store.getters.getBrowser(this.containerUuid)
      if (browser) {
        return browser.isShowedCriteria
      }
      return false
    },
    getHeightPanelBottom() {
      return this.$store.getters.getSplitHeight - 25
    },
    getterHeight() {
      return this.$store.getters.getHeigth
    },
    getHeigthTable() {
      if (this.panelType === 'window') {
        // table record navigation
        if (this.isParent) {
          if (this.isAdvancedQuery) {
            if (!this.activeName) {
              return this.getterHeight - 220
            } else {
              return this.getterHeight - 550
            }
          } else {
            return this.getterHeight - 180
          }
        }
        if (!this.isExpand) {
          return this.getHeightPanelBottom + 'vh'
        }
        return this.getterHeight - 220
      } else if (this.panelType === 'browser') {
        // open browser criteria
        if (this.getterIsShowedCriteria) {
          // showed some field query criteria
          if (this.getterFieldIsDisplayed.isDisplayed) {
            return this.getterHeight - 495
          }
          return this.getterHeight - 415
        }
        return this.getterHeight - 290
      }
      return this.getterHeight - 300
    },
    fieldList() {
      if (this.getterPanel && this.getterPanel.fieldList) {
        return this.sortFields(
          this.getterPanel.fieldList,
          this.panelType !== 'browser' ? 'seqNoGrid' : 'sequence'
        )
      }
      return []
    },
    isLoadPanel() {
      if (this.getterPanel && this.getterPanel.fieldList) {
        return true
      }
      return false
    },
    windowFields() {
      if (this.isAdvancedQuery) {
        return this.$store.getters.getPanelParameters(this.containerUuid, false, [], this.isAdvancedQuery).params
      }
      return undefined
    }
  },
  created() {
    this.getPanel()
  },
  beforeMount() {
    this.currentPage = this.getPageNumber
  },
  mounted() {
    if (this.isTableSelection) {
      this.toggleSelection(this.getDataSelection)
    }
  },
  methods: {
    sortFields,
    handleChange(val) {
      val = !val
    },
    headerLabel(field) {
      if (field.isMandatory || field.isMandatoryFromLogic) {
        return '* ' + field.name
      }
      return field.name
    },
    /**
     * @param {object} row, row data
     * @param {object} field, field with attributes
     */
    displayedValue(row, field) {
      if (typeof row[field.columnName] === 'boolean') {
        // replace boolean true-false value for 'Yes' or 'Not'
        return row[field.columnName] ? this.$t('components.switchActiveText') : this.$t('components.switchInactiveText')
      } else if (field.componentPath === 'FieldDate' || field.componentPath === 'FieldTime') {
        let cell = row[field.columnName]
        if (Object.prototype.toString.call(cell) === '[object Date]') {
          cell = cell.getTime()
        }
        // replace number timestamp value for date
        return formatDate(cell, field.referenceType)
        // return typeof row[field.columnName] === 'number' ? new Date.UTC(row[field.columnName]) : row[field.columnName]
      } else {
        return row['DisplayColumn_' + field.columnName] || row[field.columnName]
      }
    },
    isReadOnly(row, field) {
      // TODO: Add support to its type fields
      if (field.componentPath === 'FieldImage' || field.componentPath === 'FieldBinary') {
        return true
      }

      const isUpdateableAllFields = field.isReadOnly || field.isReadOnlyFromLogic
      if (this.panelType === 'window') {
        // edit mode is diferent to create new
        const editMode = !this.isEmptyValue(row.UUID)
        return (!field.isUpdateable && editMode) || (isUpdateableAllFields || field.isReadOnlyFromForm)
      } else if (this.panelType === 'browser') {
        // browser result
        return field.isReadOnly
      }
      // other type of panels (process/reports)
      return isUpdateableAllFields
    },
    deleteSelection() {
      this.$store.dispatch('deleteSelectionDataList', {
        containerUuid: this.containerUuid,
        parentUuid: this.parentUuid
      })
      this.$store.dispatch('setRecordSelection', {
        containerUuid: this.containerUuid,
        selection: [],
        record: []
      })
    },
    addNewRow() {
      this.$store.dispatch('addNewRow', {
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid,
        fieldList: this.fieldList,
        isEdit: true,
        isSendServer: false
      })
      // this.inEdited.push(undefined)
    },
    optionalPanel() {
      this.showTableSearch = false
      this.isOptional = !this.isOptional
    },
    fixedPanel() {
      this.showTableSearch = false
      this.isFixed = !this.isFixed
    },
    expandPanel() {
      this.isExpand = !this.isExpand
    },
    async getList() {
      this.oldgetDataDetail = this.getterDataRecords.map(v => v.id)
      this.newgetDataDetail = this.oldgetDataDetail.slice()
      this.$nextTick(() => {
        this.setSort()
      })
    },
    setSort() {
      if (!this.isMobile) {
        const el = this.$refs.multipleTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
        this.sortable = Sortable.create(el, {
          ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
          setData: function(dataTransfer) {
            // to avoid Firefox bug
            // Detail see : https://github.com/RubaXa/Sortable/issues/1012
            dataTransfer.setData('Text', '')
          },
          onEnd: evt => {
            const targetRow = this.getterDataRecords.splice(evt.oldIndex, 1)[0]
            this.getterDataRecords.splice(evt.newIndex, 0, targetRow)

            // for show the changes, you can delete in you code
            const tempIndex = this.newgetDataDetail.splice(evt.oldIndex, 1)[0]
            this.newgetDataDetail.splice(evt.newIndex, 0, tempIndex)
          }
        })
      }
    },
    changeOrder() {
      var reversed = this.getterDataRecords.reverse()
      return reversed
    },
    classTableMenu() {
      if (this.isMobile) {
        return 'menu-table-mobile'
      } else if (this.$store.state.app.sidebar.opened) {
        return 'menu-table'
      }
      return 'menu-table'
    },
    /**
     * @param {object} field
     */
    cellClass(field) {
      var classReturn = ''
      if (field.isReadOnly) {
        classReturn += 'cell-no-edit'
      }
      if (field.componentPath === 'FieldNumber') {
        classReturn += 'cell-align-right'
      }
      // return 'cell-edit'
      return classReturn
    },
    /**
     * Select or unselect rows
     * USE ONLY MOUNTED
     */
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    confirmEdit(row, newValue, value) {
      if (row.isEdit) {
        row.isEdit = false
        this.inEdited = this.inEdited.filter(item => item !== row.UUID)
      }
    },
    handleRowClick(row, column, event) {
      if (this.isShowedPanelRecord && this.isParent) {
        if (this.uuidCurrentRecordSelected !== row.UUID) {
          this.uuidCurrentRecordSelected = row.UUID
          // disabled rollback when change route
          this.$store.dispatch('setDataLog', {})
        }
        this.$router.push({ query: {
          ...this.$route.query,
          action: row.UUID
        }})
      } else {
        if (!row.isEdit) {
          row.isEdit = true
          this.inEdited.push(row.UUID)
          /*
          var inSelection = this.getDataSelection.some(item => {
            return JSON.stringify(item) === JSON.stringify(row)
          })
          if (inSelection) {
            row.isEdit = true
          }
          */
        }
      }
    },
    handleRowDblClick(row, column, event) {
      if (!this.isShowedPanelRecord) {
        this.confirmEdit(row, null, null)
      }
    },
    handleSelection(rowsSelection, rowSelected) {
      this.$store.dispatch('setSelection', {
        containerUuid: this.containerUuid,
        selection: rowsSelection
      })
    },
    isAllSelected(selection = 0) {
      if (selection > 0) {
        var data = this.getterDataRecords
        return data.length === selection
      }
      return false
    },
    handleSelectionAll(rowsSelection) {
      // var selectAll = false
      // if (this.isAllSelected(rowsSelection.length)) {
      //   selectAll = true
      // }
      this.$store.dispatch('setSelection', {
        containerUuid: this.containerUuid,
        selection: rowsSelection
      })
      // rowsSelection.forEach(row => {
      //   row.isEdit = selectAll
      // })
    },
    filterResult() {
      var data = []
      data = this.getterDataRecords.filter(rowItem => {
        if (this.searchTable.trim().length) {
          let find = false
          Object.keys(rowItem).forEach(key => {
            if (String(rowItem[key]).toLowerCase().includes(String(this.searchTable).toLowerCase())) {
              find = true
              return find
            }
          })
          return find
        }
        return true
      })
      return data
    },
    /**
     * Verify is displayed field in column table
     */
    isDisplayed(field) {
      var isDisplayed = field.isDisplayed && field.isDisplayedFromLogic && field.isShowedTableFromUser && !field.isKey
      //  Verify for displayed and is active
      return field.isActive && isDisplayed
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    getPanel() {
      // get panel from server only window and tab children
      if (this.panelType === 'window' && !this.isParent && !this.getterPanel) {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.containerUuid,
          parentUuid: this.parentUuid,
          type: this.panelType
        }).then(response => {
          this.isLoadPanelFromServer = true
        }).catch(error => {
          console.warn('FieldList Load Error ' + error.code + ': ' + error.message)
        })
      }
    },
    handleChangePage(newPage) {
      this.$store.dispatch('setPageNumber', {
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid,
        pageNumber: newPage,
        panelType: this.panelType
      })
    },
    click() {
      this.isOptional = false
      this.showTableSearch = !this.showTableSearch
      if (this.showTableSearch) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
      }
    },
    activeAdvancedQuery(value) {
      this.isAdvancedQuery = value
      if (value) {
        this.$store.dispatch('setOldAction', this.$route.query.action)
        this.$router.push({ query: { ...this.$route.query, action: 'advancedQuery' }})
      }
      if (!value) {
        var oldAction = this.$store.getters.getOldAction
        this.$router.push({ query: { ...this.$route.query, action: oldAction }})
      }
    },
    fallbackCopyTextToClipboard(text) {
      var textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        var successful = document.execCommand('copy')
        if (successful) {
          var message = this.$t('notifications.copySuccessful')
          this.clipboardMessage(message)
        }
      } catch (err) {
        message = this.$t('notifications.copyUnsuccessful')
        this.clipboardMessage(message)
      }
      document.body.removeChild(textArea)
    },
    activeClipboard(text) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text)
        return
      }
      navigator.clipboard.writeText(text)
        .then(() => {
          var message = this.$t('notifications.copySuccessful')
          this.clipboardMessage(message)
        })
        .catch(() => {
          var message = this.$t('notifications.copyUnsuccessful')
          this.clipboardMessage(message)
        })
      navigator.clipboard.writeText(text)
    },
    clipboardMessage(message) {
      this.$message({
        message: message,
        type: 'success',
        duration: 1500
      })
    }
  }
}
</script>

<style lang="scss">
  .el-table-row {
    .hover-row {
      background-color: black;
    }
    .current-row {
      .hover-row {
        background-color: initial !important;
      }
    }
  }
</style>
<style>
  .el-table > .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    max-height: 41px;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    line-height: 23px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    max-height: 50px;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    line-height: 50px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .tr.current-row > td {
    background-color: initial !important;
    /* background-color: #e8f4ff; */
  }
  .hover-row > tr {
    background-color: initial !important;
  }
  .hover-row > td {
    background-color: initial !important;
  }
  .header-table-records {
    height: 45px !important;
    padding: 0 !important;
  }
  .icon-mobile {
    padding-right: 5%;
  }
  .el-table th, .el-table td {
    padding: 12px 0;
    min-width: 0;
    height: 64px;
    max-height: 407px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    position: relative;
    text-align: left;
  }
  .el-menu.el-menu--horizontal {
    border-bottom: solid 0px transparent !important;
  }
  .menu-table {
    width: 75px;
    float: right;
    height: 39px !important;
  }
  .menu-table-mobile {
    height: 39px !important;
    width: 35px;
    float: right;
  }
  ul.menu-table > .el-submenu {
    height: 39px !important;
    line-height: 39px !important;
    padding: 0 10px;
  }
  ul.menu-table > .el-submenu > .el-submenu__title {
    line-height: 39px !important;
    height: 39px !important;
    padding: 0;
  }
  .el-submenu__title {
    border-bottom: 0px !important;
    color: #303133;
  }
  .panel-expand {
    float: right;
    padding-right: 40px;
    display: flex;
  }
  .field-optional {
    margin: 3px 10px;
    float: right;
  }

  /* used in cell type number */
  td.cell-align-right {
    text-align: right !important;
  }
  .el-collapse {
    border-top: 1px solid #e6ebf5;
    border-bottom: 1px solid #e6ebf5;
    overflow: hidden;
    width: 100%;
  }
</style>
<style lang="scss" scoped>
  .el-table__header-wrapper {
    .el-table__footer-wrapper {
      overflow: auto;
      /* background: black; */
    }
  }
  /* style in cursor if cell is no edit */
  .cell-no-edit {
    cursor: not-allowed !important;
  }
  .cell-edit {
    cursor: pointer !important;
  }

  .table-root {
    padding-right: 0px;
    .table-footer {
      bottom: 0px;
      float: right;
      text-align: right;
      padding: 10px;
    }
  }
  .table-search {
    font-size: 0 !important;
    float: right;
    color: #5a5e66;
    height: 39px !important;
    line-height: 39px !important;
      .search-icon {
        cursor: pointer;
        font-size: 18px;
        vertical-align: middle;
      }
    .header-search-select {
      transition: width 0.2s;
      width: 0 !important;
      overflow: hidden;
      background: transparent;
      border-radius: 0;
      display: inline-block;
      vertical-align: middle;

      /deep/ .el-input__inner {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #d9d9d9;
        vertical-align: middle;
      }
    }
    &.show {
      .header-search-select {
        width: 190px !important;
        margin-left: 10px;
      }
    }
    .header-search-select-mobile {
      transition: width 0.2s;
      width: 0 !important;
      overflow: hidden;
      background: transparent;
      border-radius: 0;
      display: inline-block;
      vertical-align: middle;

      /deep/ .el-input__inner {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #d9d9d9;
        vertical-align: middle;
      }
    }
    &.show{
      .header-search-select-mobile {
        width: 120px !important;
        margin-left: 5px;
      }
    }
  }
</style>
