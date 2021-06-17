// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// List of fields to send in search
import language from '@/lang'

export default [
  {
    elementColumnName: 'C_BPartner_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      handleFocusGained: true,
      handleFocusLost: true,
      handleKeyPressed: true,
      handleKeyReleased: true,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      size: 24,
      sequence: 1,
      componentPath: 'FieldAutocomplete',
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Date
  {
    elementColumnName: 'T_Date',
    isFromDictionary: true,
    overwriteDefinition: {
      handleFocusGained: true,
      handleFocusLost: true,
      handleKeyPressed: true,
      handleKeyReleased: true,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      size: 24,
      sequence: 2,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // AD_Org_ID
  {
    elementColumnName: 'AD_Org_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      sequence: 3,
      handleActionPerformed: true,
      handleContentSelection: true,
      handleActionKeyPerformed: true
    }
  },
  // Currency
  {
    tableName: 'C_Order',
    columnName: 'C_Currency_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      sequence: 4,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Multi-currency
  {
    columnName: 'MultiCurrency',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      name: language.t('form.allocationPayments.field.multiCurrency'),
      sequence: 5,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      componentPath: 'FieldYesNo',
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // CP - CC
  {
    elementColumnName: 'APAR',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      sequence: 6,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      componentPath: 'FieldSelect',
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // AutoWriteOff
  {
    elementColumnName: 'AutoWriteOff',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      name: language.t('form.allocationPayments.field.automaticAdjustment'),
      sequence: 7,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      componentPath: 'FieldYesNo',
      isActiveLogics: true,
      isMandatory: true
    }
  },
  {
    elementColumnName: 'T_Qty',
    isFromDictionary: true,
    overwriteDefinition: {
      handleFocusGained: true,
      handleFocusLost: true,
      handleKeyPressed: true,
      handleKeyReleased: true,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      size: 24,
      sequence: 8,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Date
  {
    elementColumnName: 'C_Charge_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      handleFocusGained: true,
      handleFocusLost: true,
      handleKeyPressed: true,
      handleKeyReleased: true,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      size: 24,
      sequence: 9,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // AD_Org_ID
  {
    columnName: 'AD_Org_ID_Top',
    elementColumnName: 'AD_Org_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      sequence: 10,
      handleActionPerformed: true,
      handleContentSelection: true,
      handleActionKeyPerformed: true
    }
  },
  // Currency
  {
    elementColumnName: 'Description',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      sequence: 11,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      isActiveLogics: true,
      isMandatory: true
    }
  }
]
