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
export default [
  // tableName: 'C_Payment',
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
    // tableName: 'C_Payment',
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
    columnName: 'AD_Org_ID',
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
    columnName: 'Multy',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      name: 'Multimoneda',
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
    columnName: 'CP-CC',
    elementColumnName: 'CP-CC',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      name: 'CP - CC',
      sequence: 6,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      componentPath: 'FieldSelect',
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Ajuste Automático
  {
    columnName: 'Adjustment',
    elementColumnName: 'Adjustment',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 24,
      name: 'Ajuste Automático',
      sequence: 7,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      componentPath: 'FieldYesNo',
      isActiveLogics: true,
      isMandatory: true
    }
  }
]
