<template>
  <el-dropdown trigger="click">
    <el-button type="text" :disabled="fieldAttributes.readonly">
      <i class="el-icon-notebook-2 el-icon--right" @click="isActive = !isActive" />
    </el-button>

    <el-dropdown-menu slot="dropdown" class="dropdown-calc">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>
            {{ $t('components.preference.title') }}
            {{ fieldAttributes.name }}
          </span>
        </div>
        <div class="text item">
          <el-form
            :inline="true"
            class="demo-form-inline"
          >
            <el-form-item :label="$t('components.preference.attribute')">
              <el-input
                v-model="fieldAttributes.name"
                :disabled="true"
              />
            </el-form-item>
            <el-form-item>
              {{ fieldAttributes.columnName }}
            </el-form-item>
          </el-form>
          <el-form
            :inline="true"
            class="demo-form-inline"
          >
            <el-form-item
              :label="$t('components.preference.code')"
            >
              <el-input
                v-model="code"
                :disabled="true"
              />
            </el-form-item>
            <el-form-item>
              {{ code }}
            </el-form-item>
          </el-form>
          <el-form
            label-position="top"
            :inline="true"
            class="demo-form-inline"
          >
            <el-form-item
              v-for="(field) in metadataList"
              :key="field.columnName"
              :label="field.name"
            >
              <el-switch
                v-model="field.value"
              />
            </el-form-item>
          </el-form>
        </div>
        <br>
        <el-row>
          <el-col :span="24">
            <samp style="float: right; padding-right: 10px;">
              <el-button
                type="danger"
                class="custom-button-address-location"
                icon="el-icon-close"
              />
              <el-button
                type="primary"
                class="custom-button-address-location"
                icon="el-icon-check"
              />
            </samp>
          </el-col>
        </el-row>
      </el-card>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
// import { ID, INTEGER } from '@/utils/ADempiere/references'
import filelistPreference from './filelistPreference.js'
import { requestFieldPreference } from '@/api/ADempiere/field/preference.js'
import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
import { attributePreference } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'Preference',
  props: {
    fieldAttributes: {
      type: [Object],
      required: true,
      default: null
    },
    fieldValue: {
      type: [String, Number, Boolean, Date, Array, Object],
      required: true,
      default: ''
    },
    containerUuid: {
      type: String,
      default: 'fiel-reference'
    },
    panelType: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      filelistPreference,
      metadataList: [],
      code: '',
      isActive: false,
      unsubscribe: () => {}
    }
  },
  watch: {
    isActive(value) {
      const preferenceValue = this.isEmptyValue(this.fieldValue) ? this.fieldAttributes.value : this.fieldValue
      if (value && this.isEmptyValue(this.metadataList)) {
        this.setFieldsList()
      }
      if (!this.isEmptyValue(preferenceValue)) {
        this.code = (typeof preferenceValue !== 'string') ? preferenceValue.toString() : preferenceValue
      }
    }
  },
  created() {
    this.unsubscribe = this.subscribeChanges()
  },
  beforeDestroy() {
    this.unsubscribe()
  },
  methods: {
    createFieldFromDictionary,
    attributePreference,
    notSubmitForm(event) {
      event.preventDefault()
      return false
    },
    setFieldsList() {
      const fieldsList = []
      // Product Code
      this.filelistPreference.forEach(element => {
        this.createFieldFromDictionary(element)
          .then(metadata => {
            const data = metadata
            fieldsList.push({
              ...data,
              containerUuid: 'fiel-reference'
            })
          }).catch(error => {
            console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
      })
      this.metadataList = fieldsList
    },
    sendValue(list) {
      const preference = this.attributePreference({
        containerUuid: this.containerUuid,
        panelType: this.panelType,
        attribute: this.fieldAttributes.columnName,
        value: this.code,
        level: list
      })
      requestFieldPreference(preference)
    },
    changeValue(value) {
      switch (value.columName) {
        // case 'options':
        case 'AD_Client_ID':
          this.$store.commit('updateValueOfField', {
            containerUuid: 'fiel-reference',
            columnName: value.columName,
            value: value.value
          })
          break
        case 'AD_Org_ID':
          this.$store.commit('updateValueOfField', {
            containerUuid: 'fiel-reference',
            columnName: value.columName,
            value: value.value
          })
          break
        case 'AD_User_ID':
          this.$store.commit('updateValueOfField', {
            containerUuid: 'fiel-reference',
            columnName: value.columName,
            value: value.value
          })
          break
        case 'AD_Window_ID':
          this.$store.commit('updateValueOfField', {
            containerUuid: 'fiel-reference',
            columnName: value.columName,
            value: value.value
          })
          break
      }
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          // const values = this.$store.getters.getValuesView({
          //   containerUuid: mutation.payload.containerUuid,
          //   format: 'object'
          // })
          // this.changeValue(values)
        }
      })
    }
  }
}
</script>

<style>
  .calculator-input > .el-input__inner,
  .calculator-input .el-input__inner {
    border-radius: 0px !important;
  }

  .calculator-input {
    width: 202px;
    font-size: 16px;
    padding-left: 4px;
  }

  /* row color with hover */
	.el-table--enable-row-hover .el-table__body tr:hover > td {
		background-color: #ffffff !important;
	}

  .calculator-table .el-table__body-wrapper > table {
    border-spacing: 5px;
  }

  /* Button shadow and border */
  .calculator-table .el-table__body tr > td {
    box-shadow: 0px 0px 2px 0px rgba(0,0,0,0.5);
    border-radius: 5px;
    cursor: pointer;
  }

  .calculator-table th, .calculator-table td,
  .calculator-table > th, .calculator-table > td {
    padding: 0px !important;
    height: 0px !important;
    padding-left: 0px !important;
  }

  .calculator-table .el-table .cell {
    padding-right: 5px !important;
    padding-left: 5px !important;
  }
  .calculator-table .el-table > .cell, .calculator-table .el-table .cell {
    padding-left: 0px !important;
  }
  .calculator-table .el-table th.is-leaf, .el-table td {
    border-bottom: 0px solid #dfe6ec !important;
  }
</style>
