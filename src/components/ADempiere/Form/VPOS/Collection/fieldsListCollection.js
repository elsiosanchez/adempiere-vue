const tableName = 'C_Payment'

export default [
  // Amont
  {
    tableName,
    elementColumnName: 'PayAmt',
    columnName: 'PayAmt',
    isFromDictionary: true,
    overwriteDefinition: {
      handleContentSelection: true,
      handleActionPerformed: true,
      size: 24,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // TenderType
  {
    tableName,
    elementColumnName: 'TenderType',
    columnName: 'TenderType',
    isFromDictionary: true,
    overwriteDefinition: {
      defaultValue: 'X',
      handleActionKeyPerformed: true,
      handleContentSelection: true,
      handleActionPerformed: true,
      size: 8,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Bank
  {
    tableName,
    elementColumnName: 'C_Bank_ID',
    columnName: 'C_Bank_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      handleContentSelection: true,
      displayLogic: `@TenderType@=='D'`,
      size: 8,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Date
  {
    tableName,
    elementColumnName: 'DateTrx',
    isFromDictionary: true,
    overwriteDefinition: {
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      size: 8,
      displayLogic: `@TenderType@=='K'`,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // Currency
  {
    tableName: 'C_Order',
    elementColumnName: 'C_Currency_ID',
    columnName: 'C_Currency_ID',
    isFromDictionary: true,
    overwriteDefinition: {
      size: 8,
      handleActionKeyPerformed: true,
      handleActionPerformed: true,
      validationCode: 'C_Currency.C_Currency_ID = 100',
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // ReferenceNo
  {
    tableName: 'HR_Attribute',
    elementColumnName: 'ReferenceNo',
    columnName: 'ReferenceNo',
    isFromDictionary: true,
    overwriteDefinition: {
      handleActionKeyPerformed: true,
      handleContentSelection: true,
      handleActionPerformed: true,
      displayLogic: `@TenderType@<>'X'&@TenderType@<>'C' `,
      size: 8,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // type credit card
  {
    tableName,
    elementColumnName: 'creditcardtype',
    columnName: 'creditcardtype',
    isFromDictionary: true,
    overwriteDefinition: {
      defaultValue: 'M',
      handleActionKeyPerformed: true,
      handleContentSelection: true,
      handleActionPerformed: true,
      size: 8,
      displayLogic: `@TenderType@=='C'`,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // number credit card
  {
    tableName,
    elementColumnName: 'creditcardnumber',
    columnName: 'creditcardnumber',
    isFromDictionary: true,
    overwriteDefinition: {
      handleActionKeyPerformed: true,
      handleContentSelection: true,
      handleActionPerformed: true,
      size: 8,
      displayLogic: `@TenderType@=='C'`,
      isActiveLogics: true,
      isMandatory: true
    }
  },
  // accountno
  {
    tableName,
    elementColumnName: 'accountno',
    columnName: 'accountno',
    isFromDictionary: true,
    overwriteDefinition: {
      handleActionKeyPerformed: true,
      handleContentSelection: true,
      handleActionPerformed: true,
      size: 8,
      displayLogic: `@TenderType@=='M'`,
      isActiveLogics: true,
      isMandatory: true
    }
  }
]
