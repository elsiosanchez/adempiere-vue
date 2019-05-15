<template>
  <div>
    <el-row :gutter="20">
      <search id="header-search" class="right-menu-item" />
      <data-table />
    </el-row>
  </div>
</template>

<script>
import DataTable from '@/components/ADempiere/DataTable'
import Search from '@/components/HeaderSearch'

export default {
  name: 'SearchWindow',
  components: {
    DataTable,
    Search
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
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
      show: false,
      // inputWidth: 'width: 50%',
      search: ''
    }
  },
  watch: {
    isLoaded: function() {
      if (typeof this.tableName !== 'undefined') {
        this.getData(this.tableName)
      }
    },
    show(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  methods: {
    /**
     * Action table buttons edit and delete records
     */
    handleDblClick(row) {
      row.edit = !row.edit
    },
    click() {
      this.show = !this.show
      if (this.show) {
        // this.inputWidth = 'width: 50%'
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
      }
    },
    close() {
      this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.blur()
      this.options = []
      this.show = false
      // this.inputWidth = 'width: 0%'
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
        if (!this.search) {
          Object.keys(rowItem).forEach(key => {
            if (String(rowItem[key]).includes(String(this.search))) {
              return true
            }
          })
        }
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

    generatePanel(fieldList) {
      this.fieldList = fieldList
      this.fieldSequence = this.sortFields(fieldList)
      this.isLoaded = true
      // if (typeof this.tableName !== 'undefined') {
      this.getData(this.tableName)
      // }
    },
    getTab() {
      var fieldList = this.$store.getters.getFieldsListFromPanel('8aaf0d42-fb40-11e8-a479-7a0060f0aa01  ')
      if (typeof fieldList === 'undefined' || fieldList.length === 0) {
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
        this.generatePanel(fieldList)
      }
    },
    /**
     * @param  {string} table Table name in BD
     */
    getProcess(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }
      var process = this.$store.getters.getProcess('a42a7450-fb40-11e8-a479-7a0060f0aa01')
      if (typeof process === 'undefined') {
        this.$store.dispatch('getPanelAndFields', {
          parentUuid: uuid,
          containerUuid: uuid,
          type: 'process'
        }).then(response => {
          this.processMetadata = response
          this.loading = true
        }).catch(err => {
          this.loading = true
          console.log('Dictionary Process - Error ' + err.code + ': ' + err.message)
        })
        // this.$store.dispatch('getProcessFromServer', uuid)
        //   .then(response => {
        //     this.processMetadata = response
        //     this.loading = true
        //     // this.reloadContextMenu()
        //   })
        //   .catch(err => {
        //
        //   })
      } else {
        this.loading = true
        this.processMetadata = process
        console.log('holaaaaaa')
        // this.reloadContextMenu()
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
