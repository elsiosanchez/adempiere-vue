<template>
  <el-form label-position="top">
    <div class="table-root">
      <div>
        <!-- <icon-element icon="el-icon-search">
          <el-input
            v-model="searchTable"
            size="mini"
            :placeholder="$t('table.dataTable.search')"
            class="header-search-input"
            clearable
          />
        </icon-element> -->
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
          </el-submenu>
        </el-menu>
        <icon-element v-show="isFixed" icon="el-icon-news">
          <fixed-columns
            :container-uuid="containerUuid"
            :panel-type="panelType"
            class="header-search-input"
          />
        </icon-element>
        <filter-columns
          v-show="isOptional"
          :container-uuid="containerUuid"
          :panel-type="panelType"
          class="fiel-optional"
        />
        <div style="display: flex;height: 20px;padding-top: 20px;">
          <el-button
            v-show="isParent && panelType === 'window'"
            type="text"
            icon="el-icon-search"
            style="color: black;font-size: 17px;font-weight: 605!important;float: right;"
            @click="tableSearch()"
          />
          <transition name="el-fade-in-linear">
            <div v-show="showSearch">
              <el-input
                v-model="searchTable"
                size="mini"
                :placeholder="$t('table.dataTable.search')"
                clearable
              />
            </div>
          </transition>
        </div>
        <!-- <div v-show="showSearch">
          <el-input
            v-model="searchTable"
            size="mini"
            :placeholder="$t('table.dataTable.search')"
            clearable
          />
        </div>
        <el-button
          v-show="isParent && panelType === 'window'"
          type="text"
          icon="el-icon-search"
          style="color: black;font-size: 17px;font-weight: 605!important;float: right;"
          @click="tableSearch()"
        /> -->
      </div>
      <div class="panel-expand">
        <i v-show="!isParent && panelType === 'window'" style="cursor: pointer;" class="el-icon-arrow-up" @click="expandPanel()" />
        <i v-show="!isParent && panelType === 'window'" style="cursor: pointer;" class="el-icon-arrow-down" @click="expandPanel(false)" />
      </div>
    </div>
    <el-table
      ref="multipleTable"
      fit
      :height="getHeigthTable"
      style="width: 100%"
      stripe
      border
      :row-key="keyColumn"
      highlight-current-row
      :reserve-selection="true"
      :row-style="rowStyle"
      :data="filterResult()"
      cell-class-name="datatable-max-cell-height"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      @select="handleSelection"
      @select-all="handleSelectionAll"
    >
      <el-table-column
        v-if="isTableSelection"
        type="selection"
        :prop="keyColumn"
        fixed
        min-width="50"
        :class-name="'is-cell-selection'"
      />
      <template v-for="(item, key) in fieldList">
        <el-table-column
          v-if="isDisplayed(item)"
          :key="key"
          :label="item.name"
          :prop="item.columnName"
          :column-key="item.columnName"
          sortable
          :formatter="changeOrder"
          min-width="200"
          height="300"
          :class-name="cellClass(item)"
          :fixed="item.isFixedTableColumn"
        >
          <template slot-scope="scope">
            <template v-if="scope.row.isEdit && !(item.isReadOnly || item.isReadOnlyFromLogic)">
              <field
                :is-data-table="true"
                :is-show-label="false"
                :in-table="true"
                :metadata-field="{
                  ...item,
                  displayColumn: scope.row['DisplayColumn_' + item.columnName],
                  tableIndex: scope.$index,
                  rowKey: scope.row[keyColumn],
                  keyColumn: keyColumn,
                  recordUuid: scope.row.UUID
                }"
                :record-data-fields="scope.row[item.columnName]"
                size="mini"
                @keyup.enter.native="confirmEdit(scope.row)"
              />
            </template>
            <span v-else>
              <template v-if="typeof scope.row[item.columnName] === 'boolean'">
                <!-- replace boolean true-false value for 'Yes' or 'Not' -->
                {{ scope.row[item.columnName] ? $t('components.switchActiveText') : $t('components.switchInactiveText') }}
              </template>
              <template v-else>
                {{ scope.row['DisplayColumn_' + item.columnName] || scope.row[item.columnName] }}
              </template>
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

export default {
  name: 'DataTable',
  components: {
    Field,
    FilterColumns,
    FixedColumns,
    IconElement
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
      panel: {},
      show: false,
      defaultMaxPagination: 100,
      fieldList: [],
      menuTable: '1',
      isOptional: false,
      isFixed: false,
      isLoaded: false,
      keyColumn: '', // column as isKey in fieldList
      tableData: [],
      isEdit: false, // get data
      rowStyle: { height: '52px' },
      sortable: null,
      isExpand: false,
      currentPage: 0,
      page: '',
      uuidCurrentRecordSelected: '',
      Search: false
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
    getNextToken() {
      return this.$store.getters.getPageNextToken(this.containerUuid)
    },
    getPageCount() {
      return this.$store.getters.getPageCount(this.containerUuid)
    },
    getDataSelection() {
      return this.$store.getters.getDataRecordSelection(this.containerUuid)
    },
    getParamsBrowser() {
      return this.$store.getters.getBrowser(this.containerUuid).isMandatoryParams
    },
    getshowCriteria() {
      return this.$store.getters.getBrowser(this.containerUuid).isShowedCriteria
    },
    getHeigthTable() {
      var displayHeight = this.$store.getters.getHeigth()
      if (this.panelType !== 'window') {
        var table = ''
        if (this.getterDataRecords.length === 0 && this.getshowCriteria && this.getParamsBrowser) {
          table = displayHeight - 520
        } else if (this.getterDataRecords.length === 0 && !this.getshowCriteria && this.getParamsBrowser) {
          table = displayHeight - 290
        } else if (!this.getshowCriteria && !this.getParamsBrowser) {
          table = displayHeight - 290
        } else if (!this.getParamsBrowser && this.getshowCriteria) {
          table = displayHeight - 400
        }
        return table
      } else {
        if (this.isParent) {
          return displayHeight - 250
        } else {
          if (!this.isExpand) {
            return displayHeight - 550
          } else {
            return displayHeight - 300
          }
          // return displayHeight - 520
        }
      }
    }
  },
  watch: {
    show(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  created() {
    // get tab with uuid
    this.getPanel()
    this.getList()
    this.currentPage = this.getPageCount
  },
  mounted() {
    this.toggleSelection(this.getDataSelection)
  },
  methods: {
    tableSearch() {
      this.showSearch = !this.showSearch
    },
    addNewRow() {
      this.$store.dispatch('addNewRow', {
        containerUuid: this.containerUuid
      })
    },
    deleteSelection() {
      this.$store.dispatch('deleteSelectionDataList', {
        containerUuid: this.containerUuid,
        parentUuid: this.parentUuid
      })
      console.log(this.getDataSelection)
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
      this.isOptional = !this.isOptional
    },
    fixedPanel() {
      this.isFixed = !this.isFixed
    },
    expandPanel(option = true) {
      this.isExpand = option
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
      if (field.isReadOnly) {
        return 'cell-no-edit'
      }
      // return 'cell-edit'
      return undefined
    },
    /**
     * Select or unselect rows
     * USE ONLY MOUNTED
     */
    toggleSelection(rowsSelection) {
      if (rowsSelection) {
        rowsSelection.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    confirmEdit(row, newValue, value) {
      if (row.isEdit) {
        row.isEdit = false
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
            params: {
              action: this.uuidCurrentRecordSelected
            }
          })
        }
      } else {
        if (!row.isEdit) {
          row.isEdit = true
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
      // index.isEdit = !index.isEdit
      // rowSelected.isEdit = !rowSelected.isEdit
      // if (this.isAllSelected(rows.length)) {
      //   index.isEdit = true
      // }
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
            if (this.panel.selectionColumn.length > 0) {
              if (this.panel.selectionColumn.indexOf(key) > -1 &&
                String(rowItem[key]).includes(String(this.searchTable))) {
                find = true
                return find
              }
            } else {
              // not selection column, search in all rows
              if (String(rowItem[key]).includes(String(this.searchTable))) {
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
      var panel = this.getterPanel
      if (panel && panel.fieldList.length > 0) {
        this.panel = panel
        this.generatePanel()
      } else {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.containerUuid,
          type: this.panelType
        }).then(response => {
          this.panel = response
          this.generatePanel()
        }).catch(error => {
          console.warn('FieldList Load Error ' + error.code + ': ' + error.message)
          this.isLoaded = false
        })
      }
    },
    generatePanel() {
      var panel = this.panel
      this.keyColumn = panel.keyColumn
      this.fieldList = this.sortFields(panel.fieldList, 'SortNo')
      this.isLoaded = true
    },
    /**
     * Sorts the column components according to the value that is obtained from
     * the array that contains the JSON objects in the data.SortNo property
     * @param  {array} arr
     * @return {array} order by arr.data.SortNo
     */
    sortFields(arr, orderBy = 'sequence', type = 'asc') {
      arr.sort((itemA, itemB) => {
        return itemA[orderBy] - itemB[orderBy]
        // return itemA[orderBy] > itemB[orderBy]
      })
      if (type.toLowerCase() === 'desc') {
        return arr.reverse()
      }
      return arr
    },
    dataTable() {
      var dataTable = this.getterDataRecords
      if (this.page === this.getNextToken) {
        return dataTable.slice(99,)
      }
      return dataTable
    },
    handleChangePage(newPage) {
      if (newPage > 1) {
        this.currentPage = newPage
        this.page = this.getNextToken
      } else {
        this.currentPage = newPage
        this.page = newPage
      }
      this.$store.dispatch('setPageNumber', {
        containerUuid: this.containerUuid,
        pageNumber: this.page
      })
    }
  }
}
</script>

<style>
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
   /* .el-submenu {
    float: right !important;
  } */
  .menu-table {
    width: 75px;
    float: right;
    /* position: absolute;
    bottom: 388px;
    right: 9px; */
  }
  .menu-table-mobile {
    width: 35px;
    float: right;
    /* position: absolute;
    bottom: 388px;
    right: 9px; */
  }
  .el-submenu__title {
    border-bottom: 0px !important;
    color: #303133;
  }
  .panel-expand {
    float: right;
    padding-top: 2%;
    padding-right: 0%;
  }
  .fiel-optional {
    width: 227px;
    float: right;
    margin-top: 20px;
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

  // .menu-table-container {
  //   max-height: 40px;
  // }

  .table-root {
    padding-right: 0px;
    .table-footer {
      bottom: 0px;
      float: right;
      text-align: right;
      padding: 10px;
    }
  }

</style>
