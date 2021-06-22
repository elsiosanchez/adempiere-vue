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
  <el-container style="height: -webkit-fill-available;">
    <el-header class="header">
      <el-steps :active="active" finish-status="success" process-status="finish">
        <el-step
          v-for="(item, index) in step"
          :key="index"
          :title="item.name"
        />
      </el-steps>
    </el-header>
    <el-main class="main">
      <carousel
        :step-reference="metadata.fileName"
        :steps="step"
        :indicator="active"
      >
        <div class="text item">
          <el-form v-if="active === 0" label-position="top" class="from-main">
            <el-form-item>
              <el-row>
                <el-col v-for="(field, index) in fieldsList" :key="index" :span="8">
                  <field
                    :key="field.columnName"
                    :metadata-field="field.componentPath === 'FieldAutocomplete' ? {
                      ...field,
                      loadAll: recordsBusinessPartners
                    } : field"
                    :v-model="field.value"
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
          <payments
            v-if="active === 1"
            :business-partner-uuid="businessPartnerUuid"
          />
          <invoices
            v-if="active === 2"
            :business-partner-uuid="businessPartnerUuid"
          />
          <Summary
            v-if="active === 3"
            :business-partner-uuid="businessPartnerUuid"
          />
        </div>
      </carousel>
    </el-main>
    <el-footer :class="styleFooter">
      <el-button type="primary" icon="el-icon-check" style="float: right;" @click="next" />
      <el-button v-show="active > 0" type="danger" icon="el-icon-close" style="float: right;margin-right: 10px;" @click="prev" />
    </el-footer>
  </el-container>
</template>

<script>

import Payments from './Payments'
import Invoices from './Invoices'
import Summary from './Summary'
import Carousel from '@/components/ADempiere/Carousel'
import formMixin from '@/components/ADempiere/Form/formMixin.js'
import fieldsList from './fieldList.js'
export default {
  name: 'AllocationPayments',
  components: {
    Payments,
    Invoices,
    Summary,
    Carousel
  },
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
      active: 0,
      input: '',
      value: '',
      fieldsList
    }
  },
  computed: {
    recordsBusinessPartners() {
      return this.$store.getters.getBusinessPartnersList
    },
    styleFooter() {
      const showTitle = this.$store.getters.getIsShowTitleForm
      if (showTitle) {
        return 'show-title-footer'
      }
      return 'from-footer'
    },
    step() {
      return [
        {
          name: this.$t('views.searchCriteria'),
          icon: 'el-i.con-search',
          description: this.$t('form.allocationPayments.step.descriptionSearchCriteria')
        },
        {
          name: this.$t('form.allocationPayments.table.payments'),
          icon: 'el-icon-money',
          description: this.$t('form.allocationPayments.step.descriptionPayments')
        },
        {
          name: this.$t('form.allocationPayments.table.invoices'),
          icon: 'el-icon-tickets',
          description: this.$t('form.allocationPayments.step.descriptionInvoices')
        },
        {
          name: this.$t('views.summary'),
          icon: 'el-icon-document',
          description: ''
        }
      ]
    },
    businessPartnerUuid() {
      return this.$store.getters.getValueOfField({
        containerUuid: this.$route.meta.uuid,
        columnName: 'C_BPartner_ID_UUID'
      })
    }
  },
  methods: {
    next() {
      if (this.active < 3) {
        this.active++
      }
      switch (this.step[this.active].name) {
        case this.$t('form.allocationPayments.table.payments'):
          this.$store.dispatch('serverPaymentList', this.businessPartnerUuid)
          break
        case this.$t('form.allocationPayments.table.invoices'):
          this.$store.dispatch('serverBillingList', this.businessPartnerUuid)
          break
        case this.$t('views.summary'):
          this.$store.dispatch('searchServerPaymentAllocationSummaryList', this.businessPartnerUuid)
          break
      }
    },
    prev() {
      this.active--
    }
  }
}
</script>

<style lang="scss" scoped>
 .from-main {
    padding-right: 1% !important;
    padding-bottom: 0px !important;
    padding-top: 0px !important;
    padding-left: 1% !important;
    height: 90%;
  }
  .card-form {
    height: 100% !important;
    overflow: auto;
  }
  .header {
    padding-bottom: 0px;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 4% !important;
  }
  .from-footer {
    height: 10% !important;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .show-title-footer {
    height: 15% !important;
    box-sizing: border-box;
    flex-shrink: 0
  }
  .main {
    display: block;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -ms-flex-preferred-size: auto;
    flex-basis: auto;
    overflow: auto;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding-top: 0px;
    padding-right: 20px;
    padding-bottom: 20px;
    padding-left: 20px;
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
  .el-carousel__container {
    position: relative;
    height: inherit;
  }
</style>
