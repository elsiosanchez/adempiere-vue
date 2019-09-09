<template>
  <el-form v-if="isLoadPanel" label-position="top">
    <el-header height="60px" class="header-table-records">
      <div class="table-root">
        <div v-if="!isMobile">
          <el-menu :default-active="menuTable" :class="classTableMenu() + ' menu-table-container'" mode="horizontal">
            <el-submenu index="2">
              <template slot="title">
                <i class="el-icon-more" />
              </template>
              <el-menu-item index="optional" @click="optionalPanel()">
                {{ $t('components.filterableItems') }}
              </el-menu-item>
              <el-menu-item index="fixed" @click="fixedPanel()">
                {{ $t('components.fixedleItems') }}
              </el-menu-item>
              <el-menu-item
                v-if="panelType === 'window'"
                :disabled="getDataSelection.length < 1"
                index="delete"
                @click="deleteSelection()"
              >
                {{ $t('table.dataTable.deleteSelection') }}
              </el-menu-item>
              <el-menu-item
                v-if="!isParent && panelType === 'window'"
                :disabled="inEdited.length > 0 || (!isParent && $route.query.action === 'create-new')"
                index="new"
                @click="addNewRow()"
              >
                {{ $t('window.newRecord') }}
              </el-menu-item>
              <el-menu-item
                v-if="panelType === 'window'"
                :disabled="getterTotalDataRecordCount <= 0"
                index="avancedQuery"
                @click="isAvancedQuery = !isAvancedQuery"
              >
                {{ $t('table.dataTable.avancedQuery') }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
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
          <div :class="{'show':showTableSearch}" class="table-search">
            <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
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
            <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
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
            v-show="isParent && panelType === 'window' && isMobile && getDataSelection.length > 0"
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
          <el-button
            v-if="getterTotalDataRecordCount > 0"
            type="text"
            icon="el-icon-edit"
            style="color: black;font-size: 17px;font-weight: 605!important;"
            @click="isAvancedQuery = !isAvancedQuery"
          />
        </div>
      </div>
    </el-header>
    <el-collapse-transition>
      <panel
        v-if="isParent"
        v-show="isAvancedQuery"
        :container-uuid="containerUuid"
        :metadata="getterPanel"
        :panel-type="'table'"
        :is-selection-column="true"
      />
    </el-collapse-transition>
    <el-table
      ref="multipleTable"
      :height="getHeigthTable"
      style="width: 100%"
      border
      :row-key="getterPanel.keyColumn"
      highlight-current-row
      :reserve-selection="true"
      :row-style="rowStyle"
      :data="showTableSearch ? filterResult() : getterDataRecords"
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
          :label="item.name"
          :column-key="item.columnName"
          :prop="item.columnName"
          sortable
          :formatter="changeOrder"
          min-width="200"
          :class-name="cellClass(item)"
          :fixed="item.isFixedTableColumn"
        >
          <template slot-scope="scope">
            <!-- TODO: Support to binary fields. -->
            <template v-if="scope.row.isEdit && !(item.isReadOnly || item.isReadOnlyFromLogic) && !(item.componentPath == 'Image' || item.componentPath == 'Binary')">
              <field
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
    <div class="table-footer">
      <div style="float: right;">
        <el-pagination
          layout="slot, total, prev, pager, next"
          :current-page="currentPage"
          :page-size="defaultMaxPagination"
          :total="getterTotalDataRecordCount"
          @current-change="handleChangePage"
        >
          <template v-slot>
            <span>{{ $t('table.dataTable.selected') }}: {{ getDataSelection.length }} / </span>
          </template>
        </el-pagination>
      </div>
    </div>
  </el-form>
</template>

<script>
import Field from '@/components/ADempiere/Field'
import Sortable from 'sortablejs'
import FilterColumns from '@/components/ADempiere/DataTable/filterColumns'
import FixedColumns from '@/components/ADempiere/DataTable/fixedColumns'
import IconElement from '@/components/ADempiere/IconElement'
import { formatDate } from '@/filters/ADempiere'
import Panel from '@/components/ADempiere/Panel'
import { sortFields } from '@/utils/ADempiere'

export default {
  name: 'DataTable',
  components: {
    Field,
    FilterColumns,
    FixedColumns,
    IconElement,
    Panel
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
      showSearch: false, // show input from search,
      show: false,
      defaultMaxPagination: 100,
      menuTable: '1',
      isOptional: false,
      isFixed: false,
      isLoadPanelFromServer: false,
      tableData: [],
      isEdit: false, // get data
      rowStyle: { height: '52px' },
      sortable: null,
      isExpand: false,
      currentPage: 1,
      inEdited: [],
      uuidCurrentRecordSelected: '',
      showTableSearch: false,
      isAvancedQuery: false
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterPanel() {
      return this.$store.getters.getPanel(this.containerUuid)
    },
    getterDataRecords() {
      return this.$store.getters.getDataRecordsList(this.containerUuid)
    },
    getterTotalDataRecordCount() {
      return this.$store.getters.getDataRecordCount(this.containerUuid)
    },
    getPageNumber() {
      return this.$store.getters.getPageNumber(this.containerUuid)
    },
    getDataSelection() {
      return this.$store.getters.getDataRecordSelection(this.containerUuid)
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
      return this.$store.getters.getSplitHeight
    },
    getterHeight() {
      return this.$store.getters.getHeigth
    },
    getHeigthTable() {
      if (this.panelType === 'window') {
        // table record navigation
        if (this.isParent) {
          return this.getterHeight - 180
        }
        if (!this.isExpand) {
          return this.getHeightPanelBottom
        }
        return this.getterHeight - 220
      } else if (this.panelType === 'browser') {
        // open browser criteria
        if (this.getterIsShowedCriteria) {
          // showed some field query criteria
          if (this.getterFieldIsDisplayed.isDisplayed) {
            return this.getterHeight - 530
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
    }
  },
  created() {
    // get tab with uuid
    this.getPanel()
    // this.getList()
  },
  beforeMount() {
    this.currentPage = this.getPageNumber
    if (this.isParent && this.panelType === 'window') {
      this.$store.dispatch('recordSelection', {
        containerUuid: this.containerUuid,
        selection: [],
        record: []
      })
    }
  },
  mounted() {
    if (this.isTableSelection) {
      this.toggleSelection(this.getDataSelection)
    }
  },
  methods: {
    sortFields,
    /**
     * @param {object} row, row data
     * @param {object} field, field with attributes
     */
    displayedValue(row, field) {
      if (typeof row[field.columnName] === 'boolean') {
        // replace boolean true-false value for 'Yes' or 'Not'
        return row[field.columnName] ? this.$t('components.switchActiveText') : this.$t('components.switchInactiveText')
      } else if (field.componentPath === 'Date' || field.componentPath === 'Time') {
        // replace number timestamp value for date
        return formatDate(row[field.columnName], field.referenceType)
        // return typeof row[field.columnName] === 'number' ? new Date.UTC(row[field.columnName]) : row[field.columnName]
      } else {
        return row['DisplayColumn_' + field.columnName] || row[field.columnName]
      }
    },
    deleteSelection() {
      this.$store.dispatch('deleteSelectionDataList', {
        containerUuid: this.containerUuid,
        parentUuid: this.parentUuid
      })
      this.$store.dispatch('recordSelection', {
        containerUuid: this.containerUuid,
        selection: [],
        record: []
      })
    },
    addNewRow() {
      this.$store.dispatch('addNewRow', {
        containerUuid: this.containerUuid,
        parentUuid: this.parentUuid
      })
      // this.inEdited.push(undefined)
    },
    classTableMenu() {
      if (this.isMobile) {
        return 'menu-table-mobile'
      } else if (this.$store.state.app.sidebar.opened) {
        return 'menu-table'
      }
      return 'menu-table'
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
    /**
     * ASOCIATE WITH SEARCH INPUT
     */
    handleChangeInput(value) {
      this.toggleSelection(this.getDataSelection)
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
    /**
     * @param {object} field
     */
    cellClass(field) {
      var classReturn = ''
      if (field.isReadOnly) {
        classReturn += 'cell-no-edit'
      }
      if (field.componentPath === 'NumberBase') {
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
          // this.$store.dispatch('notifyPanelChange', {
          //   parentUuid: this.parentUuid,
          //   containerUuid: this.containerUuid,
          //   newValues: row,
          //   isDontSendToEdit: true,
          //   fieldList: this.fieldList
          // })
          this.$router.push({
            name: this.$route.name,
            query: {
              action: this.uuidCurrentRecordSelected,
              tabNumber: this.$route.query.tabNumber
            }
          })
        }
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
      this.$store.dispatch('recordSelection', {
        containerUuid: this.containerUuid,
        selection: rowsSelection,
        record: this.getterDataRecords
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
      this.$store.dispatch('recordSelection', {
        containerUuid: this.containerUuid,
        selection: rowsSelection,
        record: this.getterDataRecords
      })
      // rowsSelection.forEach(row => {
      //   row.isEdit = selectAll
      // })
    },
    filterResult() {
      var data = []
      data = this.getterDataRecords.filter(rowItem => {
        if (this.searchTable.trim().length > 0) {
          let find = false
          Object.keys(rowItem).forEach(key => {
            // if exists some selection columns
            if (this.getterPanel.selectionColumn.length > 0) {
              if (this.getterPanel.selectionColumn.indexOf(key) > -1 &&
                String(rowItem[key]).includes(String(this.searchTable))) {
                find = true
                return find
              }
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
    }
  }
}
</script>

<style>
  .header-table-records {
    padding: 0 !important;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    max-height: 25px;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    line-height: 23px;
    padding-left: 10px;
    padding-right: 10px;
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
    padding-right: 5%;
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
</style>
<style lang="scss" scoped>
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
