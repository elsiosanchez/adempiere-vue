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
  <el-container style="height: 100% !important;">
    <el-header class="header">
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('form.activity.title')">
          <el-table
            ref="WFActivity"
            v-loading="isEmptyValue(activityList)"
            :data="activityList"
            highlight-current-row
            style="width: 100%"
            border
            @current-change="handleCurrentChange"
          >
            <el-table-column
              v-for="(valueOrder) in orderLineDefinition"
              :key="valueOrder.columnName"
              :column-key="valueOrder.columnName"
              :label="valueOrder.label"
              :align="valueOrder.isNumeric ? 'right' : 'left'"
              :prop="valueOrder.columnName"
            />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-header>
    <el-main class="main">
      <el-card shadow="hover" class="search">
        <el-form v-if="!isEmptyValue(fieldsList)" :disabled="isEmptyValue(currentActivity)" label-position="top" class="from-main">
          <el-form-item>
            <el-row>
              <el-col v-for="(field, index) in fieldsList" :key="index" :span="6">
                <field
                  :key="field.columnName"
                  :metadata-field="field"
                  :v-model="field.value"
                />
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
    <el-footer :class="styleFooter">
      <div>
        <el-button type="primary" icon="el-icon-check" style="float: right;" :disabled="isEmptyValue(currentActivity)" @click="action" />
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import formMixin from '@/components/ADempiere/Form/formMixin.js'
import fieldsList from './fieldsList.js'
import { listActivity } from '@/api/ADempiere/form/wf-activity.js'

export default {
  name: 'WFActivity',
  mixins: [
    formMixin
  ],
  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'WF-Activity',
          containerUuid: 'WF-Activity',
          fieldsList
        }
      }
    }
  },
  data() {
    return {
      fieldsList,
      orderLineDefinition: [
        {
          columnName: 'Priority',
          label: this.$t('form.activity.table.priority'),
          isNumeric: true
        },
        {
          columnName: 'AD_WF_Node_ID',
          label: this.$t('form.activity.table.node'),
          isNumeric: false
        },
        {
          columnName: 'Summary',
          label: this.$t('table.ProcessActivity.Summary'),
          isNumeric: false
        }
      ]
    }
  },
  computed: {
    styleFooter() {
      const showTitle = this.$store.getters.getIsShowTitleForm
      if (showTitle) {
        return 'show-title-footer'
      }
      return 'footer'
    },
    activityList() {
      const list = this.$store.getters.getActivity
      if (!this.isEmptyValue(list)) {
        return list
      }
      return []
    },
    currentActivity() {
      return this.$store.getters.getCurrentActivity
    }
  },
  mounted() {
    this.$store.dispatch('serverListActivity', { formUuid: this.$route.meta.uuid })
    if (!this.isEmptyValue(this.currentActivity)) {
      this.setCurrent()
    }
  },
  methods: {
    setCurrent() {
      const activity = this.activityList.find(activity => activity.node === this.currentActivity.node)
      this.$refs.WFActivity.setCurrentRow(activity)
    },
    handleCurrentChange(activity) {
      this.$store.dispatch('selectedActivity', activity)
    },
    action() {
      const message = this.$store.getters.getValueOfField({
        containerUuid: this.$route.meta.uuid,
        columnName: 'TextMsg'
      })
      const forward = this.$store.getters.getValueOfField({
        containerUuid: this.$route.meta.uuid,
        columnName: 'Forward'
      })
      listActivity({
        formUuid: this.$route.meta.uuid,
        activity: this.currentActivity,
        message,
        forward
      })
        .then(response => {
          this.$message({
            type: 'success',
            message: response,
            showClose: true
          })
        })
        .catch(error => {
          this.$message({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
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
  }
  .card-form {
    height: 100% !important;
    overflow: auto;
  }
  .header {
    padding-bottom: 0px;
    padding-top: 1.5%;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 75% !important;
    padding-left: 1%;
    padding-right: 1%;
  }
  .from-footer {
    height: 5% !important;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .footer {
    padding-top: 0px;
    height: 5% !important;
    padding-bottom: 0px;
  }
  .main {
    padding-bottom: 0px;
    padding-top: 0px;
  }
  .search {
    height: 100%;
  }
  .show-title-footer {
    padding-top: 0px;
    height: 8% !important;
    padding-bottom: 0px;
  }
</style>
