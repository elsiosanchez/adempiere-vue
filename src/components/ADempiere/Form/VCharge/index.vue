<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com
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
  <el-tabs type="card">
    <el-tab-pane :label="$t('form.charge.title')">
      <el-form label-position="top" class="from-main">
        <el-form-item>
          <el-row>
            <el-col v-for="(field, index) in fieldsList" :key="index" :span="6">
              <field
                :key="field.columnName"
                :metadata-field="field"
                :v-model="field.value"
              />
            </el-col>
            <el-col :span="6" style="padding-top: 1.5%;">
              <el-button type="primary" plain icon="el-icon-plus" @click="newCharge">
                {{
                  $t('tagsView.newRecord')
                }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('form.charge.labelTable.header')">
          <el-table
            ref="ChargeTable"
            :data="listAccountsAndCharges"
          >
            <el-table-column
              v-for="(valueOrder, item, key) in labelTableVCharge"
              :key="key"
              :column-key="valueOrder.columnName"
              :label="valueOrder.label"
            >
              <template slot-scope="scope">
                <span>
                  {{ displayedValue(scope.row, valueOrder) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('form.pos.tableProduct.options')"
              width="200"
            >
              <template slot-scope="scope">
                <span>
                  <el-button type="text" @click="handleClick(scope.row)">
                    <i class="el-icon-edit-outline" />  {{ $t('form.charge.labelTable.createFromAccount') }}
                  </el-button>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import formMixin from '@/components/ADempiere/Form/formMixin.js'
import fieldsList from './fieldList.js'
import labelTableVCharge from './labelTableVCharge.js'
import {
  chargeList,
  createCharge,
  createChargeAccount
} from '@/api/ADempiere/form/charger.js'

export default {
  name: 'VCharge',
  mixins: [
    formMixin
  ],
  props: {
    metadata: {
      type: Object,
      required: true,
      default: () => {
        return {
          uuid: 'v-charge',
          containerUuid: 'v-charge',
          fieldsList
        }
      }
    }
  },
  data() {
    return {
      fieldsList,
      labelTableVCharge,
      listAccountsAndCharges: []
    }
  },
  mounted() {
    this.loadChargeList()
  },
  methods: {
    chargeList,
    createCharge,
    createChargeAccount,
    displayedValue(row, field) {
      const { columnName } = field
      let valueToShow = row[columnName]
      if (columnName === 'spending') {
        valueToShow = row[columnName]
          ? this.$t('components.switchActiveText')
          : this.$t('components.switchInactiveText')
      }
      return valueToShow
    },
    loadChargeList() {
      this.chargeList({
        fromUuid: this.$route.meta.uuid
      })
        .then(response => {
          this.listAccountsAndCharges = response
        })
    },
    handleClick(account) {
      this.createChargeAccount({
        fromUuid: this.$route.meta.uuid,
        accounUuid: account.uuid
      })
    },
    newCharge(value, name, spending) {
      value = this.$store.getters.getValueOfField({
        containerUuid: this.$route.meta.uuid,
        columnName: 'Value'
      })
      name = this.$store.getters.getValueOfField({
        containerUuid: this.$route.meta.uuid,
        columnName: 'Name'
      })
      spending = this.$store.getters.getValueOfField({
        containerUuid: this.$route.meta.uuid,
        columnName: 'spending'
      })
      this.createCharge({
        fromUuid: this.$route.meta.uuid,
        value,
        name,
        spending
      })
    }
  }
}
</script>
<style scoped>
  .header {
    padding: 0px;
    margin: 0px;
    height: -webkit-fill-available !important;
    display: contents;
  }
  .main  {
    padding: 0px;
    overflow: hidden;
    display: inline-table;
  }
  aside {
    background: white;
    width: 20%;
    overflow: hidden;
    height: 130% !important;
  }
  .aside-mobile {
    background: white;
    width: 64%!important;
    overflow: hidden;
    height: 65% !important;
    padding: 0px;
    margin: 0px;
}
  .weight {
    font-size: 140px;
    font-weight: bold;
    margin: 0;
    height: 100%;
    line-height: 100%;
  }
  .button-action {
    float: right;
  }
  .button-scale {
    float: left;
  }
  .container-number-mobile {
    display: contents
  }
  .title {
    padding: 0px;
    margin: 0px;
    margin-top: 15%;
    font-size: 5em;
  }
</style>
