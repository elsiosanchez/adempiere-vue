<template>
  <div>
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
      style="width: 100%"
    >
      <el-table-column
        prop="c_bpartner_id"
        label="c_bpartner_id"
      />
      <el-table-column
        prop="ad_client_id"
        label="ad_client_id"
      />
      <el-table-column
        prop="ad_org_id"
        label="ad_org_id"
      />
      <el-table-column
        prop="isactive"
        label="isactive"
      />
      <el-table-column
        prop="created"
        label="created"
      />
      <el-table-column
        prop="createdby"
        label="createdby"
      />
      <el-table-column
        prop="updated"
        label="updated"
      />
      <el-table-column
        prop="updated"
        label="updated"
      />
      <el-table-column
        prop="updatedby"
        label="updatedby"
      />
      <el-table-column
        prop="value"
        label="value"
      />
      <el-table-column
        prop="name"
        label="name"
      />
    </el-table>
  </div>
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
