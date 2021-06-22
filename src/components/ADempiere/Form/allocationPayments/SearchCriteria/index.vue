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
  <el-form label-position="top" class="from-main">
    <el-form-item>
      <el-row>
        <el-col v-for="(field, index) in fieldsList" :key="index" :span="8">
          <field
            v-if="field.sequence <= 7"
            :key="field.columnName"
            :metadata-field="field"
            :v-model="field.value"
          />
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script>
import formMixin from '@/components/ADempiere/Form/formMixin.js'
import fieldsList from './fieldList.js'

export default {
  name: 'SearchCriteria',
  mixins: [
    formMixin
  ],
  props: {
    metadata: {
      type: Object,
      required: true,
      default: () => {
        return {
          uuid: 'Bar-code-Reader',
          containerUuid: 'Bar-code-Reader',
          fieldsList
        }
      }
    }
  },
  data() {
    return {
      fieldsList
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
<style>
.el-table .warning-row {
    background:#ff4949a6;
  }

  .el-table .success-row {
    background: #8ff6bd80;
  }
</style>
