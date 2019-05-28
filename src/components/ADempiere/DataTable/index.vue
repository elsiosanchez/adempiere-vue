<template>
  <el-form v-model="tableData" label-position="labelPosition">
    <div v-show="searchable" :class="{'show-input-seacrh':showSearch}" align="rigth" class="search-detail">
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
      :data="tableData"
      max-height="250"
      border
      style="width: 1100px"
      type="expand"
    >
      <el-table-column
        v-if="tableSelection"
        type="selection"
        fixed
      />

      <template v-for="(item, key) in fieldList">
        <el-table-column
          v-if="isDisplayed(item)"
          :key="key"
          :label="item.name"
          :prop="item.columnName"
        >
          <template slot-scope="scope">
            <template v-if="scope.row.edit && (item.isIdentifier || item.isUpdateable)">
              <field
                :label="false"
                :metadata-field="item"
                :recorddata-fields="scope.row[item.columnName]"
                size="small"
                @keyup.enter.native="confirmEdit(scope.row)"
              />
            </template>
            <span v-else @dblclick="scope.row.edit=!scope.row.edit">
              {{ item.value }}
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
    // Show section from search in data
    searchable: {
      type: Boolean,
      default: true
    },
    // Show check from selection row
    tableSelection: {
      type: Boolean,
      default: true
    },
    panelType: {
      type: String,
      default: 'window'
    },
    dataRecord: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      labelPosition: 'top',
      searchTable: '', // text from search
      showSearch: false, // show input from search
      fieldList: [],
      tableData: this.dataRecord,
      edit: false
    }
  },
  computed: {
    getFields() {
      return this.$store.getters.getFieldsListFromPanel(this.containerUuid)
    }
  },
  watch: {
    showSearch(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    },
    dataRecord() {
      this.tableData = this.dataRecord
    }
  },
  beforeMount() {
    this.fieldList = this.getFieldList()
  },
  methods: {
    /**
     * ASOCIATE WITH SEARCH INPUT
     */
    click() {
      this.showSearch = !this.showSearch
      if (this.showSearch) {
        this.$refs.headerSearchInput && this.$refs.headerSearchInput.focus()
      }
    },
    close() {
      this.$refs.headerSearchInput && this.$refs.headerSearchInput.blur()
      if (this.searchTable.trim().length > 0) {
        this.showSearch = true
      } else {
        this.showSearch = false
      }
    },
    /**
     * Action table buttons edit and delete records
     */
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
    /**
     * Verify is displayed field in column table
     */
    isDisplayed(field) {
      var isMandatory = field.isMandatory && field.isMandatoryFromLogic
      // var isDisplayed = field.isDisplayed && field.isShowedFromUser && (isMandatory || field.isDisplayedFromLogic)
      //  Verify for displayed and is active
      return field.isActive && field.isDisplayed && field.isDisplayedFromLogic || isMandatory
    },
    getFieldList() {
      var fields = this.$store.getters.getFieldsListFromPanel(this.containerUuid)
      return this.sortFields(fields, 'SortNo')
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

    .header-search-input {
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

    &.show-input-seacrh {
      .header-search-input {
        width: 210px;
        margin-left: 10px;
      }
    }
  }
</style>
