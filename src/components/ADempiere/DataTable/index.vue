<template>
  <el-form :label-position="labelPosition">
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
        <el-menu :default-active="MenuTable" :class="classTableMenu() + ' menu-table-container'" mode="horizontal">
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-more" />
            </template>
            <el-menu-item index="optional" @click="OptionalPanel()"> {{ $t('components.filterableItems') }} </el-menu-item>
            <el-menu-item index="fixed" @click="FixedPanel()"> {{ $t('components.fixedleItems') }} </el-menu-item>
          </el-submenu>
        </el-menu>
        <icon-element v-show="fixed" icon="el-icon-news">
          <fixed-columns
            :container-uuid="containerUuid"
            :panel-type="panelType"
            class="header-search-input"
          />
        </icon-element>
        <filter-columns
          v-show="optional"
          :container-uuid="containerUuid"
          :panel-type="panelType"
          class="fiel-optional"
        />
      </div>
      <div v-show="isMobile && panelType === 'window'" class="panel-expand">
        <i class="el-icon-upload2" @click="ExpandPanel()" />
        <i class="el-icon-download" @click="RestorePanel()" />
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
      :data="dataTable()"
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
            <template v-if="scope.row.isEdit && !item.isReadOnly">
              <field
                :is-data-table="true"
                :is-show-label="false"
                :in-table="true"
                :metadata-field="{
                  ...item,
                  displayColumn: scope.row['DisplayColumn_' + item.columnName],
                  tableIndex: scope.$index,
                  rowKey: scope.row[keyColumn],
                  keyColumn: keyColumn
                }"
                :record-data-fields="scope.row[item.columnName]"
                size="mini"
                @keyup.enter.native="confirmEdit(scope.row)"
              />
            </template>
            <span v-else>
              {{ scope.row['DisplayColumn_' + item.columnName] || scope.row[item.columnName] }}
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
          :page-size="Pagination"
          :total="getDataDetail.length"
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
    // Show input section from search in data
    isSearchable: {
      type: Boolean,
      default: false
    },
    // Show check from selection row
    isTableSelection: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      labelPosition: 'top',
      searchTable: '', // text from search
      showSearch: false, // show input from search,
      panel: {},
      Pagination: 100,
      fieldList: [],
      MenuTable: '1',
      optional: false,
      fixed: false,
      isLoaded: false,
      keyColumn: '', // column as isKey in fieldList
      tableData: [],
      multipleSelection: [],
      isEdit: false, // get data
      rowStyle: { height: '52px' },
      sortable: null,
      oldprocessListData: [],
      newprocessListData: [],
      Expand: false,
      currentPage: 0,
      page: ''
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterPanel() {
      return this.$store.getters.getPanel(this.containerUuid)
    },
    getAllRecords() {
      return this.$store.getters.getDataAllRecord(this.containerUuid)
    },
    getDataDetail() {
      return this.$store.getters.getDataRecordDetail(this.containerUuid)
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
      if (this.panelType !== 'window') {
        var table = ''
        if (this.getDataDetail.length === 0 && this.getshowCriteria && this.getParamsBrowser) {
          table = this.$store.getters.getHeigth() - 490
        } else if (this.getDataDetail.length === 0 && !this.getshowCriteria && this.getParamsBrowser) {
          table = this.$store.getters.getHeigth() - 290
        } else if (!this.getshowCriteria && !this.getParamsBrowser) {
          table = this.$store.getters.getHeigth() - 290
        } else if (!this.getParamsBrowser && this.getshowCriteria) {
          table = this.$store.getters.getHeigth() - 400
        }
        return table
      } else {
        if (!this.Expand) {
          return this.$store.getters.getHeigth() - 500
        } else {
          return this.$store.getters.getHeigth() - 190
        }
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
    classTableMenu() {
      if (this.isMobile) {
        return 'menu-table-mobile'
      } else if (this.$store.state.app.sidebar.opened) {
        return 'menu-table'
      }
      return 'menu-table'
    },
    OptionalPanel() {
      this.optional = !this.optional
    },
    FixedPanel() {
      this.fixed = !this.fixed
    },
    ExpandPanel() {
      this.Expand = true
    },
    RestorePanel() {
      this.Expand = false
    },
    /**
     * ASOCIATE WITH SEARCH INPUT
     */
    handleChangeInput(value) {
      this.toggleSelection(this.getDataSelection)
    },
    async getList() {
      this.oldgetDataDetail = this.getDataDetail.map(v => v.id)
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
            const targetRow = this.getDataDetail.splice(evt.oldIndex, 1)[0]
            this.getDataDetail.splice(evt.newIndex, 0, targetRow)

            // for show the changes, you can delete in you code
            const tempIndex = this.newgetDataDetail.splice(evt.oldIndex, 1)[0]
            this.newgetDataDetail.splice(evt.newIndex, 0, tempIndex)
          }
        })
      }
    },
    changeOrder() {
      var reversed = this.getDataDetail.reverse()
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
      if (!row.isEdit) {
        /*
        var inSelection = this.getDataSelection.some(item => {
          return JSON.stringify(item) === JSON.stringify(row)
        })
        if (inSelection) {
          row.isEdit = true
        }
        */
        row.isEdit = true
      }
    },
    handleRowDblClick(row, column, event) {
      this.confirmEdit(row, null, null)
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
        record: this.getDataDetail
      })
    },
    isAllSelected(selection = 0) {
      if (selection > 0) {
        var data = this.$store.getters.getDataRecordDetail(this.containerUuid)
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
        record: this.getDataDetail
      })
      // rowsSelection.forEach(row => {
      //   row.isEdit = selectAll
      // })
    },
    filterResult() {
      var data = []
      data = this.getDataDetail.filter(rowItem => {
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
      if (panel === undefined || panel.fieldList.length === 0) {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.containerUuid,
          type: this.panelType.trim()
        }).then(response => {
          this.panel = response
          this.generatePanel()
        }).catch(error => {
          console.warn('Field Load Error ' + error.code + ': ' + error.message)
          this.isLoaded = false
        })
      } else {
        this.panel = panel
        this.generatePanel()
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
      var dataTable = this.getDataDetail
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
    padding-top: 7%;
    padding-right: 2%;
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
