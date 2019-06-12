<template>
  <el-form :label-position="labelPosition">
    <div v-show="isSearchable" :class="{'show-input-seacrh':showSearch}" align="rigth" class="search-detail">
      <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
      <el-input
        ref="headerSearchInput"
        v-model="searchTable"
        size="mini"
        placeholder="Type to search"
        class="header-search-input"
      />
    </div>
    <el-table
      ref="multipleTable"
      fit
      height="200"
      style="width: 100%"
      stripe
      highlight-current-row
      :row-key="keyColumn"
      :data="getDataDetail"
      @select="handleSelection"
    >
      <el-table-column
        v-if="isTableSelection"
        type="selection"
        :prop="keyColumn"
        fixed
        min-width="50"
      />
      <template v-for="(item, key) in fieldList">
        <el-table-column
          v-if="isDisplayed(item)"
          :key="key"
          :label="item.name"
          :prop="item.columnName"
          :column-key="item.columnName"
          width="150"
        >
          <template slot-scope="scope">
            <template v-if="scope.row.edit && (item.isIdentifier || item.isUpdateable)">
              <field
                :is-show-label="false"
                :metadata-field="item"
                :recorddata-fields="scope.row[item.columnName]"
                size="small"
                @keyup.enter.native="confirmEdit(scope.row)"
              />
            </template>
            <span v-else @dblclick="scope.row.edit=!scope.row.edit">
              {{ scope.row[item.columnName] }}
            </span>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </el-form>
</template>

<script>
import Field from '@/components/ADempiere/Field'
export default {
  name: 'DataTable',
  components: {
    Field
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
      default: true
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
      fieldList: [],
      isLoaded: false,
      keyColumn: '', // column as isKey in fieldList
      tableData: this.getDataDetail,
      multipleSelection: this.getDataSelection,
      edit: false
    }
  },
  computed: {
    getterPanel() {
      return this.$store.getters.getPanel(this.containerUuid)
    },
    getDataDetail() {
      return this.$store.getters.getDataRecordDetail(this.containerUuid)
    },
    getDataSelection() {
      return this.$store.getters.getDataRecordSelection(this.containerUuid)
    }
  },
  watch: {
    isLoaded: function() {
      if (typeof this.tableName !== 'undefined') {
        this.getData(this.tableName)
      }
    },
    showSearch(value) {
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
  },
  mounted() {
    this.toggleSelection(this.getDataSelection)
  },
  methods: {
    /**
     * ASOCIATE WITH SEARCH INPUT
     */
    click() {
      if (this.searchTable.trim().length > 0) {
        this.showSearch = true
      } else {
        this.showSearch = !this.showSearch
      }
      if (this.showSearch) {
        this.$refs.headerSearchInput && this.$refs.headerSearchInput.focus()
      }
    },
    close() {
      if (this.searchTable.trim().length > 0) {
        this.showSearch = true
      } else {
        this.$refs.headerSearchInput && this.$refs.headerSearchInput.blur()
        this.showSearch = false
      }
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
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleDblClick(row) {
      row.edit = !row.edit
    },
    confirmEdit(row, newValue, value) {
      row.edit = false
      this.$message({
        message: 'The title has been edited',
        type: 'success'
      })
    },
    handleSelection(row, index) {
      this.$store.dispatch('recordSelection', {
        containerUuid: this.containerUuid,
        selection: row,
        record: this.getDataDetail
      })
    },
    filterResult() {
      var data = []
      data = this.getDataDetail.filter((rowItem) => {
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
      var isDisplayed = field.isDisplayed && field.isDisplayedFromLogic
      //  Verify for displayed and is active
      return field.isActive && isDisplayed
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    getPanel() {
      var panel = this.getterPanel
      if (typeof panel === 'undefined' || panel.fieldList.length === 0) {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.containerUuid,
          type: this.panelType.trim()
        }).then(response => {
          this.panel = response
          this.generatePanel()
        }).catch(err => {
          console.warn('Field Load Error ' + err.code + ': ' + err.message)
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
      this.fieldList = this.sortFields(panel.fieldList)
      this.isLoaded = true
      // this.fieldList = this.sortFields(panel.fieldList, 'SortNo')
      if (this.isEdit && this.panelType === 'window') {
        this.getData(this.tableName)
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-detail {
    font-size: 0 !important;
    .search-icon {
      cursor: pointer;
      font-size: 18px;
      color: #000;
      position: fixed;
      vertical-align: middle;
      left: 224px;
    }
    .header-search-input {
      font-size: 16px;
      transition: width 0.2s;
      width: 0;
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
    &.show-input-seacrh {
      .header-search-input {
        width: 210px;
        margin-left: 50px;
      }
    }
  }
</style>
