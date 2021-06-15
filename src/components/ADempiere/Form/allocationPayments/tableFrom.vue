<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanchez@erpya.com www.erpya.com
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->
<template>
  <div
    class="card-form"
  >
    <el-table
      :data="metadata"
      style="width: 100%"
      max-height="200"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="50"
      />
      <el-table-column
        v-for="(valueOrder) in label"
        :key="valueOrder.columnName"
        :column-key="valueOrder.columnName"
        :label="valueOrder.label"
        width="auto"
        :min-width="!valueOrder.isNumeric ? valueOrder.size : valueOrder.size"
        :align="valueOrder.isNumeric ? 'right' : 'left'"
        :prop="valueOrder.columnName"
      />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'TableFrom',
  props: {
    label: {
      type: Array,
      default: () => []
    },
    metadata: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      multipleSelection: []
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>

<style lang="scss" scoped>
  .card-form {
    height: 100% !important;
    overflow: auto;
  }
</style>
