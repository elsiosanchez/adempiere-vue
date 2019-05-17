<template>
  <el-form v-model="tableData" :label-position="labelPosition" label-width="200px">
    <div v-show="searchable" :class="{'show':showSearch}" align="right" class="search-detail">
      <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
      <el-input
        ref="headerSearchSelect"
        v-model="search"
        size="mini"
        placeholder="Type to search"
        class="header-search-select"
      />
    </div>
    <el-table
      :data="filterResult()"
      element-loading-text="Loading..."
      element-loading-spinner="el-icon-loading"
      border
      fit
      type="expand"
      height="180"
      class="table"
      size="mini"
    >
      <template v-for="(item, key) in fieldSequence">
        <el-table-column
          v-show="getDisplay(item.isDisplayed)"
          :key="key"
          :prop="item.columnName"
          :label="item.name"
          class="tableitem"
          width="300"
        >
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <field
                :label="false"
                :metadata-field="item"
                :value="scope.row[item.columnName]"
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
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'

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
    metadata: {
      type: Object,
      default: () => {}
    },
    label: {
      type: String,
      default: ''
    },
    tableName: {
      type: String,
      default: ''
    },
    // Show section from search in data
    searchable: {
      type: Boolean,
      default: true
    },
    panelType: {
      type: String,
      default: 'window'
    }
  },
  data() {
    return {
      tableData: [],
      fieldList: [],
      fieldSequence: [],
      getRecords: false,
      edit: false,
      labelPosition: 'top',
      minSizeColumns: 3,
      preSizeColumns: 12,
      maxSizeColumns: 24,
      isLoaded: false,
      listLoading: true,
      showSearch: false,
      search: ''
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
    this.getTable()
  },
  methods: {
    isEmptyValue,
    /**
     * Action table buttons edit and delete records
     */
    handleDblClick(row) {
      row.edit = !row.edit
    },
    click() {
      this.showSearch = !this.showSearch
      if (this.showSearch) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
      }
    },
    close() {
      this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.blur()
      this.options = []
      this.showSearch = false
    },
    confirmEdit(row, newValue, value) {
      row.edit = false
      this.$message({
        message: 'The title has been edited',
        type: 'success'
      })
    },
    filterResult() {
      var data = []
      data = this.tableData.filter((rowItem) => {
        if (!this.isEmptyValue(this.search)) {
          let find = false
          Object.keys(rowItem).forEach(key => {
            if (String(rowItem[key]).includes(String(this.search))) {
              find = true
              return find
            }
          })
          return find
        }
        return true
      })

      if (data.length < 1) {
        data = this.addNewValue()
      }
      return data
    },
    addNewValue() {
      var data = []
      var newValue = {}
      this.fieldList.forEach((item) => {
        newValue[item.columnName] = null
      })
      data.push(newValue)
      this.edit = true
      this.$set(newValue, 'edit', true)
      return data
    },
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    getDisplay(isDisplayed) {
      if (typeof isDisplayed === 'undefined') {
        return false
      }
      return isDisplayed
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     * @param {string} tabUUID universally unique identifier
     */
    getTable() {
      var fieldList = this.$store.getters.getFieldsListFromPanel(
        this.containerUuid
      )
      if (typeof fieldList === 'undefined' || fieldList.length === 0) {
        if (this.panelType === 'window') {
          this.$store.dispatch('getTabAndFieldFromServer', {
            parentUuid: this.parentUuid,
            containerUuid: this.containerUuid
          })
            .then(response => {
              this.generatePanel(response.fieldList)
            })
            .catch(err => {
              console.warn('Dictionay DataTable - Error ' + err.code + ': ' + err.message)
              this.isLoaded = false
            })
        } else {
          this.tableName = undefined
          this.generatePanel(this.metadata.fieldList)
        }
      } else {
        this.generatePanel(fieldList)
      }
    },
    generatePanel(fieldList) {
      this.fieldList = fieldList
      this.fieldSequence = this.sortFields(fieldList)
      this.isLoaded = true
      if (typeof this.tableName !== 'undefined' && this.tableName !== '') {
        this.getData(this.tableName)
      }
    },
    /**
     * @param  {string} table Table name in BD
     */
    getData(table = '') {
      if (this.isLoaded !== true || table === null || table === '') {
        this.$message({
          message: 'Error getting data records',
          type: 'error',
          showClose: true
        })
        return
      }
      var criteria = "IsActive = 'Y'"

      this.$store.dispatch('getObjectListFromCriteria', {
        table: table,
        criteria: criteria
      })
        .then(response => {
          this.tableData = response
          this.getRecords = true
        })
        .catch(err => console.log('Error Panel detail: ' + err.message))
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

<style>
  .table {
    position: relative;
    word-wrap: normal;
    text-overflow: ellipsis;
    vertical-align: middle;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .seachrtable {
    position: relative;
    text-align: center;
    width: 100%;
    right: 80%;
    box-sizing: border-box;
  }
  .avatar {
    width: 54px;
    height: 28px;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 134px;
    height: 5px;
    line-height: 57px;
  }

  .el-tabs__item {
    height: 40px;
    box-sizing: border-box;
    box-sizing: border-box;
    line-height: 40px;
    display: inline-block;
    list-style: none;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: #303133;
  }
  .el-table td div {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
</style>
<style lang="scss" scoped>
  .search-detail {
    font-size: 0 !important;

    .search-icon {
      cursor: pointer;
      font-size: 18px;
      color: #000;
      vertical-align: middle;
    }

    .header-search-select {
      font-size: 18px;
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

    &.show {
      .header-search-select {
        width: 210px;
        margin-left: 10px;
      }
    }
  }
</style>
