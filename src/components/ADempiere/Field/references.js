
// All references
const REFERENCES = [
  {
    id: 25,
    type: 'TextBase',
    support: true,
    description: 'Account Element',
    alias: ['Account']
  },
  {
    id: 12,
    type: 'NumberBase',
    support: true,
    description: 'Number with 4 decimals',
    alias: ['Amount']
  },
  {
    id: 33,
    type: 'SelectBase',
    support: true,
    description: 'Resource Assignment',
    alias: ['Assignment']
  },
  {
    id: 23,
    type: 'Binary',
    support: true,
    description: 'Binary Data',
    alias: ['Binary']
  },
  {
    id: 28,
    type: 'Button',
    support: true,
    description: 'Command Button - starts a process',
    alias: ['Button']
  },
  {
    id: 53370,
    type: 'Chart',
    support: false,
    description: 'Chart',
    alias: ['Chart']
  },
  {
    id: 27,
    type: 'Color',
    support: true,
    description: 'Color element',
    alias: ['Color']
  },
  {
    id: 37,
    type: 'NumberBase',
    support: true,
    description: 'Costs + Prices (minimum currency precision but if exists more)',
    alias: ['CostsPrices', 'Costs+Prices', 'Cost Prices']
  },
  {
    id: 15,
    type: 'Date',
    support: true,
    description: 'Date mm/dd/yyyy',
    alias: ['Date']
  },
  {
    id: 16,
    type: 'DateTime',
    support: true,
    description: 'Date with time',
    alias: ['DateTime', 'Date Time', 'Date+Time']
  },
  {
    id: 39,
    type: 'TextBase',
    support: true,
    description: 'Local File',
    alias: ['FileName', 'File Name']
  },
  {
    id: 38,
    type: 'TextBase',
    support: true,
    description: 'Local File Path',
    alias: ['FilePath', 'File Path']
  },
  {
    id: 53670,
    type: 'TextBase',
    support: true,
    description: 'Local File Path or Name',
    alias: ['FilePathOrName', 'File Path Or Name']
  },
  {
    id: 13,
    type: 'NumberBase',
    support: true,
    description: '10 Digit Identifier',
    alias: ['ID']
  },
  {
    id: 32,
    type: 'Image',
    support: true,
    description: 'Binary Image Data',
    alias: ['Image']
  },
  {
    id: 11,
    type: 'NumberBase',
    support: true,
    description: '10 Digit numeric',
    alias: ['Integer']
  },
  {
    id: 17,
    type: 'SelectBase',
    support: true,
    description: 'Reference List',
    alias: ['List']
  },
  {
    id: 21,
    type: 'SelectBase',
    support: true,
    description: 'Location/Address',
    alias: ['Location', 'Location (Address)', 'Location/Address']
  },
  {
    id: 31,
    type: 'SelectBase',
    support: true,
    description: 'Warehouse Locator Data type',
    alias: ['Locator', 'Locator (WH)', 'Locator/WH']
  },
  {
    id: 34,
    type: 'TextAreaBase',
    support: true,
    description: 'Reference List',
    alias: ['Memo']
  },
  {
    id: 22,
    type: 'NumberBase',
    support: true,
    description: 'Float Number',
    alias: ['Number']
  },
  {
    id: 42,
    type: 'TextBase',
    support: true,
    description: 'Printer Name',
    alias: ['PrinterName', 'Printer Name']
  },
  {
    id: 35,
    type: 'SelectBase',
    support: true,
    description: 'Product Attribute',
    alias: ['ProductAttribute', 'Product Attribute']
  },
  {
    id: 29,
    type: 'NumberBase',
    support: true,
    description: 'Quantity data type',
    alias: ['Quantity']
  },
  {
    id: 30,
    type: 'SelectBase',
    support: true,
    description: 'Search Field',
    alias: ['Search']
  },
  {
    id: 10,
    type: 'TextBase',
    support: true,
    description: 'Character String',
    alias: ['String']
  },
  {
    id: 18,
    type: 'SelectBase',
    support: true,
    description: 'Table List',
    alias: ['Table']
  },
  {
    id: 19,
    type: 'SelectBase',
    support: true,
    description: 'Direct Table Access',
    alias: ['TableDirect', 'Table Direct']
  },
  {
    id: 14,
    type: 'TextAreaBase',
    support: true,
    description: 'Character String up to 2000 characters',
    alias: ['Text']
  },
  {
    id: 36,
    type: 'TextAreaBase',
    support: true,
    description: 'Text (Long) - Text > 2000 characters',
    alias: ['TextLong', 'Text Long']
  },
  {
    id: 24,
    type: 'Time',
    support: true,
    description: 'Time',
    alias: ['Time']
  },
  {
    id: 40,
    type: 'TextBase',
    support: true,
    description: 'URL',
    alias: ['URL', 'Url']
  },
  {
    id: 20,
    type: 'YesNo',
    support: true,
    description: 'CheckBox',
    alias: ['YesNo', 'Yes No', 'Yes-No']
  }
]
export default REFERENCES

export const FIELD_RANGE = [
  {
    id: 12,
    type: 'Amount',
    description: 'Number with 4 decimals',
    alias: ['Amount']
  },
  {
    id: 37,
    type: 'CostsPrices',
    description: 'Costs + Prices (minimum currency precision but if exists more)',
    alias: ['CostsPrices', 'Costs+Prices', 'Cost Prices']
  },
  {
    id: 15,
    type: 'Date',
    description: 'Date mm/dd/yyyy',
    alias: ['Date']
  },
  {
    id: 16,
    type: 'DateTime',
    description: 'Date with time',
    alias: ['DateTime', 'Date Time', 'Date+Time']
  },
  {
    id: 11,
    type: 'Integer',
    description: '10 Digit numeric',
    alias: ['Integer']
  },
  {
    id: 22,
    type: 'Number',
    description: 'Float Number',
    alias: ['Number']
  },
  {
    id: 29,
    type: 'Quantity',
    description: 'Quantity data type',
    alias: ['Quantity']
  },
  {
    id: 24,
    type: 'Time',
    description: 'Time',
    alias: ['Time']
  }
]

export const FIELD_ONLY = [
  {
    id: 28,
    type: 'Button',
    description: 'Command Button - starts a process',
    alias: ['Button']
  }
]
