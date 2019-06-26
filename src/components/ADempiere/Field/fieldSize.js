
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

export const FIELD_DISPLAY_SIZES = [
  {
    type: 'Binary',
    size: {
      xs: 6,
      sm: 6,
      md: 6,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'Button',
    size: {
      xs: 0,
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0
    }
  },
  {
    type: 'Date',
    size: {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'Image',
    size: {
      xs: 6,
      sm: 6,
      md: 6,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'NumberBase',
    size: {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'SelectBase',
    size: {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'TextBase',
    size: {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'TextAreaBase',
    size: {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'Time',
    size: {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    }
  },
  {
    type: 'YesNo',
    size: {
      xs: 6,
      sm: 8,
      md: 8,
      lg: 3,
      xl: 3
    }
  }
]
