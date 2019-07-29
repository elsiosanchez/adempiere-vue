<template>
  <el-container style=" border: 1px solid #eee">
    <el-header style="height: 16px;">
      <div v-show="searchable" :class="{'show':showSearch}" align="left" class="search-detail">
        <el-button type="text" @click="clearFilter">{{ $t('components.resetAllFilters') }}</el-button>
        <el-button type="text" @click="isFixed = !isFixed">Fixed Column key</el-button>
      </div>
    </el-header>
    <el-main>
      <el-table
        ref="dragTable"
        :data="filterResult()"
        :border="true"
        :highlight-current-row="true"
        :height="getHeigthTable"
        @row-click="setCurrentRow"
        @current-change="handleCurrentChange"
      >
        <template v-for="(item, index) in fieldList">
          <el-table-column :key="index" :label="item.name" sortable>
            <template slot-scope="scope">
              {{ scope.row['DisplayColumn_' + item.columnName] || scope.row[item.columnName] }}
            </template>
          </el-table-column>
        </template>
        <!-- <el-table-column
          prop="c_bpartner_id"
          label="c_bpartner_id"
          width="180"
          sortable
          :fixed="isFixed"
          column-key="c_bpartner_id"
          :filters="[{text: '50005', value: ' 50005'},{text: '113', value:113}]"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="ad_client_id"
          label="ad_client_id"
          width="180"
          sortable
          :filters="[{text: '11', value:11}]"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="ad_org_id"
          label="ad_org_id"
          width="180"
          sortable
          :filters="[{text: '0', value:0},{text: '11', value:11}]"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="isactive"
          label="isactive"
          width="180"
          sortable
        />
        <el-table-column
          prop="created"
          label="created"
          width="180"
          sortable
        />
        <el-table-column
          prop="createdby"
          label="createdby"
          width="180"
          sortable
        />
        <el-table-column
          prop="updated"
          label="updated"
          width="180"
          sortable
        />
        <el-table-column
          prop="updated"
          label="updated"
          width="180"
          sortable
        />
        <el-table-column
          prop="updatedby"
          label="updatedby"
          width="180"
          sortable
        />
        <el-table-column
          prop="value"
          label="value"
          width="180"
          sortable
        />
        <el-table-column
          prop="name"
          label="name"
          width="180"
          sortable
        /> -->
      </el-table>
      <div class="table-footer">
        {{ $t('table.dataTable.records') }}: {{ tableRecords.length }}
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'
import Sortable from 'sortablejs'

export default {
  name: 'SearchWindow',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: true
    },
    tableName: {
      type: String,
      default: ''
    },
    windowUuid: {
      type: String,
      default: ''
    },
    tabUuid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showSearch: false,
      data: [],
      search: '',
      sortable: null,
      olddatalist: [],
      newdatalist: [],
      isFixed: true,
      fieldList: [],
      recordSelected: {}
    }
  },
  computed: {
    tableRecords() {
      return this.$store.getters.getDataRecordDetail(this.windowUuid)
    },
    getterPanel() {
      if (this.tabUuid !== undefined) {
        return this.$store.getters.getPanel(this.tabUuid)
      }
      return undefined
    },
    getHeigthTable() {
      if (this.getDataDetail !== undefined) {
        return this.$store.getters.getHeigth() - 180
      } else {
        return this.$store.getters.getHeigth()
      }
    }
  },
  watch: {
    showSearch(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  mounted() {
    // get tab with uuid
    this.getList()
    this.generatePanel()
  },
  methods: {
    setCurrentRow(row) {
      this.$refs.dragTable.setCurrentRow(row)
    },
    handleCurrentChange(value) {
      this.recordSelected = value
      this.$store.dispatch('setRecordSelected', this.recordSelected)
    },
    /**
     * Get the tab object with all its attributes as well as the fields it contains
     */
    generatePanel() {
      var panel = this.getterPanel
      if (panel === undefined || panel.fieldList.length === 0) {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.tabUuid,
          type: 'window'
        }).then(response => {
          this.fieldList = this.sortFields(response.fieldList)
        }).catch(error => {
          console.warn('Field Load Error ' + error.code + ': ' + error.message)
        })
      } else {
        this.fieldList = this.sortFields(panel.fieldList)
      }
    },
    sortFields(arr, orderBy = 'sequence', type = 'asc') {
      arr.sort((itemA, itemB) => {
        return itemA[orderBy] - itemB[orderBy]
      })
      if (type.toLowerCase() === 'desc') {
        return arr.reverse()
      }
      return arr
    },
    async getList() {
      this.olddatalist = this.tableRecords.map(v => v.id)
      this.newdatalist = this.olddatalist.slice()
      this.$nextTick(() => {
        this.setSort()
      })
    },
    changeOrder() {
      var reversed = this.tableRecords.reverse()
      return reversed
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function(dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.tableRecords.splice(evt.oldIndex, 1)[0]
          this.tableRecords.splice(evt.newIndex, 0, targetRow)

          // for show the changes, you can delete in you code
          const tempIndex = this.newdatalist.splice(evt.oldIndex, 1)[0]
          this.newdatalist.splice(evt.newIndex, 0, tempIndex)
        }
      })
    },
    isEmptyValue,
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
    formatter(row, column) {
      return row.address
    },
    clearFilter() {
      this.$refs.dragTable.clearFilter()
    },
    filterHandler(value, row, column) {
      const property = column['property']
      return row[property] === value
    },
    filterResult() {
      return this.tableRecords.filter((rowItem) => {
        if (!this.isEmptyValue(this.search)) {
          let find = false
          Object.keys(rowItem).forEach(key => {
            if (rowItem[key] !== undefined && String(rowItem[key]).includes(this.search)) {
              find = true
              return find
            }
          })
          return find
        }
        return true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-footer {
    bottom: 0px;
    text-align: right;
    padding: 10px;
  }
  .search-detail {
    font-size: 0 !important;

    .search-icon {
      cursor: grabbing;
      font-size: 23px;
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
