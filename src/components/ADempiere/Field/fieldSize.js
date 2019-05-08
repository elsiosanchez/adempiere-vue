
const FIELD_SIZE = [
  {
    base: 'Binary',
    types: [
      23, 'Binary'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'Button',
    types: [
      28, 'Button'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'Chart',
    types: [
      53370, 'Chart'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'Color',
    types: [
      27, 'Color'
    ],
    sizeInGroup: {
      max: 6,
      min: 6
    },
    sizeNotGroup: {
      max: 3,
      min: 3
    }
  },
  {
    base: 'Date',
    types: [
      15, 'Date'
    ],
    sizeInGroup: {
      max: 12,
      min: 12
    },
    sizeNotGroup: {
      max: 6,
      min: 6
    }
  },
  {
    base: 'DateTime',
    types: [
      16, 'DateTime'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 6,
      min: 3
    }
  },
  {
    base: 'Time',
    types: [
      24, 'Time'
    ],
    sizeInGroup: {
      max: 12,
      min: 12
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'Textarea',
    types: [
      14, 'Text',
      36, 'TextLong',
      34, 'Memo'
    ],
    sizeInGroup: {
      max: 24,
      min: 24
    },
    sizeNotGroup: {
      max: 24,
      min: 24
    }
  },
  {
    base: 'Number',
    types: [
      12, 'Amount',
      37, 'CostsPrices',
      13, 'ID',
      11, 'Integer',
      24, 'Number',
      29, 'Quantity'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'List',
    types: [
      33, 'Assignment',
      17, 'List',
      21, 'Location',
      31, 'Locator',
      35, 'ProductAttribute',
      30, 'Search',
      18, 'Table',
      19, 'TableDirect'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'String',
    types: [
      25, 'Account',
      39, 'FileName',
      38, 'FilePath',
      53670, 'FilePathOrName',
      42, 'PrinterName',
      10, 'String',
      40, 'Url'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 12,
      min: 6
    }
  },
  {
    base: 'YesNo',
    types: [
      20, 'YesNo'
    ],
    sizeInGroup: {
      max: 12,
      min: 6
    },
    sizeNotGroup: {
      max: 6,
      min: 6
    }
  }
]

export default FIELD_SIZE
