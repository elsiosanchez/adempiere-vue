<template>
  <el-container style=" border: 1px solid #eee">
    <el-header>
      <div v-show="searchable" :class="{'show':showSearch}" align="left" class="search-detail">
        <el-button @click="clearFilter">{{ $t('components.resetAllFilters') }}</el-button>
      </div>
    </el-header>
    <el-main>
      <el-table
        ref="filterTable"
        :data="filterResult()"
        :border="true"
        :stripe="true"
        :height="getHeigthTable"
      >
        <el-table-column
          prop="c_bpartner_id"
          label="c_bpartner_id"
          width="180"
        />
        <el-table-column
          prop="ad_client_id"
          label="ad_client_id"
          width="180"
        />
        <el-table-column
          prop="ad_org_id"
          label="ad_org_id"
          width="180"
          column-key="ad_org_id"
          :filters="[{text: '0', value: '0'}, {text: '11', value: '11'}]"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="isactive"
          label="isactive"
          width="180"
        />
        <el-table-column
          prop="created"
          label="created"
          width="180"
        />
        <el-table-column
          prop="createdby"
          label="createdby"
          width="180"
          column-key="createdby"
          :filters="[{text: '0', value: '0'}, {text: '100', value: '100'}]"
          :filter-method="filterHandler"
        />
        <el-table-column
          prop="updated"
          label="updated"
          width="180"
        />
        <el-table-column
          prop="updated"
          label="updated"
          width="180"
        />
        <el-table-column
          prop="updatedby"
          label="updatedby"
          width="180"
        />
        <el-table-column
          prop="value"
          label="value"
          width="180"
        />
        <el-table-column
          prop="name"
          label="name"
          width="180"
        />
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import c_bpartner from '@/views/ADempiere/SearchWindow/datalist.json'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'

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
    }
  },
  data() {
    return {
      datalis: c_bpartner,
      showSearch: false,
      data: [],
      search: ''
    }
  },
  computed: {
    getHeigthTable() {
      if (this.getDataDetail !== 'undefined') {
        return this.$store.getters.getHeigth() - 150
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
  methods: {
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
    clearFilter() {
      this.$refs.filterTable.clearFilter()
    },
    formatter(row, column) {
      return row.address
    },
    filterHandler(value, row, column) {
      const property = column['property']
      return row[property] === value
    },
    filterResult() {
      return this.datalis.filter((rowItem) => {
        if (!this.isEmptyValue(this.search)) {
          let find = false
          Object.keys(rowItem).forEach(key => {
            if (typeof rowItem[key] !== 'undefined' && String(rowItem[key]).includes(this.search)) {
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
