<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
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
  <!-- <el-card class="box-card" shadow="always"> -->
  <el-container style="height: -webkit-fill-available;">
    <el-header class="header">
      <el-form label-position="top" class="from-main">
        <el-form-item style="margin: 0px !important;">
          <template
            v-for="(field) in fieldsList"
          >
            <field
              v-if="field.columnName !== 'QtyEntered'"
              :key="field.columnName"
              :metadata-field="field"
              :v-model="field.value"
            />
          </template>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main id="mainFrom" style="padding-left: 20px;padding-right: 20px;">
      <!-- Table Pay -->
      <el-tabs type="border-card">
        <el-tab-pane label="Pago">
          <table-from
            :label="labelTablePay"
            :metadata="tableData"
          />
        </el-tab-pane>
      </el-tabs>
      <!-- Table Invoice -->
      <el-tabs type="border-card" style="padding-top: 10px">
        <el-tab-pane label="Factura">
          <table-from
            :label="labelTableInvoce"
            :metadata="tableData"
          />
        </el-tab-pane>
      </el-tabs>
    </el-main>
    <el-footer :class="styleFooter">
      <el-form label-position="top" :inline="true">
        <el-row style="padding-right: 2%;padding-left: 2%;">
          <el-col :span="5">
            <el-form-item label="Diferencia VES">
              <el-input-number v-model="num" :controls="false" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Cargo">
              <el-select v-model="value" placeholder="Select">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Organizacion">
              <el-select v-model="value" placeholder="Select">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Descripción">
              <el-input v-model="input" placeholder="Descripción" />
            </el-form-item>
          </el-col>
          <el-col :span="4" style="padding-top: 2.5%;">
            <el-button type="primary" icon="el-icon-check" style="float: right;" />
            <el-button type="danger" icon="el-icon-close" style="float: right;margin-right: 5%;" />
          </el-col>
        </el-row>
      </el-form>
    </el-footer>
  </el-container>
  <!-- </el-card> -->
</template>

<script>
import formMixin from '@/components/ADempiere/Form/formMixin.js'
import fieldsList from './fieldList.js'
import labelTablePay from './labelTablePay.js'
import labelTableInvoce from './labelTableInvoce.js'
import tableFrom from './tableFrom'

export default {
  name: 'AllocationPayments',
  components: {
    tableFrom
  },
  mixins: [
    formMixin
  ],
  props: {
    metadata: {
      type: Object,
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
      fieldsList,
      labelTablePay,
      labelTableInvoce,
      num: 0,
      input: '',
      tableData: [{
        Date: '2016-05-03',
        CPCC: 'AP',
        Descripcion: 'No. 189, Grove St, Los Angeles'
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {}, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }, {
        Date: '2016-05-02',
        CPCC: 'AR',
        Descripcion: 'No. 189, Grove St, Los Angeles',
        convert: 1955936557.20
      }],
      options: [{
        value: 'Option1',
        label: 'Option1'
      }, {
        value: 'Option2',
        label: 'Option2'
      }, {
        value: 'Option3',
        label: 'Option3'
      }, {
        value: 'Option4',
        label: 'Option4'
      }, {
        value: 'Option5',
        label: 'Option5'
      }],
      value: ''
    }
  },
  computed: {
    styleFooter() {
      const showTitle = this.$store.getters.getIsShowTitleForm
      if (showTitle) {
        return 'show-title-footer'
      }
      return 'footer'
    }
  }
}
</script>

<style lang="scss" scoped>
 .from-main {
    padding-right: 1% !important;
    padding-bottom: 0px !important;
    padding-left: 1% !important;
  }
  .card-form {
    height: 100% !important;
    overflow: auto;
  }
  .header {
    padding: 0 20px;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 20% !important;
  }
  footer {
    padding: 0px;
    height: 10% !important;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .show-title-footer {
    padding: 0px;
    height: 15% !important;
    box-sizing: border-box;
    flex-shrink: 0
  }
</style>
<style lang="scss">
  .el-tabs__header {
    padding: 0;
    position: relative;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 5px;
    margin-left: 0px;
  }
</style>
