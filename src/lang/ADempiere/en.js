export default {
  route: {
    dashboard: 'Dashboard',
    documentation: 'Documentation',
    guide: 'Guide',
    page401: '401',
    page404: '404',
    profile: 'Profile',
    ProcessActivity: 'Process Activity',
    Role: 'Role',
    SearchWindow: 'Search Window',
    ReportViewer: 'Report Viewer'
  },
  notifications: {
    completed: 'Completed',
    loading: 'Loading',
    searching: 'Searching records on the server',
    succesful: 'Successful',
    error: 'Error',
    succcessSearch: 'The search has been made',
    errorSearch: 'The search has not been completed',
    processing: 'Processing',
    processExecuted: 'Executed, see process activity',
    processError: 'Was not executed',
    emptyValues: 'Parameter(s) empty value',
    fieldMandatory: 'The field is mandatory',
    Opened: 'Opened',
    requestError: 'Error executing the request',
    successChangeRole: 'The role has been changed',
    errorChangeRole: 'The role has not been changed'
  },
  navbar: {
    dashboard: 'Dashboard',
    github: 'Github',
    logOut: 'Log Out',
    profile: 'Profile',
    theme: 'Theme',
    size: 'Global Size'
  },
  login: {
    noValidUser: 'Please enter the correct user name',
    noValidPassword: 'The password can not be empty',
    title: 'Login Form',
    logIn: 'Login',
    username: 'Username',
    password: 'Password',
    any: 'any',
    thirdparty: 'Or connect with',
    thirdpartyTips: 'Can not be simulated on local, so please combine you own business simulation! ! !'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  permission: {
    addRole: 'New Role',
    editPermission: 'Edit',
    roles: 'Your roles',
    switchRoles: 'Switch roles',
    tips: 'In some cases, using v-permission will have no effect. For example: Element-UI  el-tab or el-table-column and other scenes that dynamically render dom. You can only do this with v-if.',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    binaryButton: 'Upload file',
    binaryTip: 'Only files with a size smaller than 500kb',
    imageError: 'The image exceeds 2MB and does not comply with the valid formats!',
    contextMenuRelations: 'Relations',
    contextMenuActions: 'Actions',
    contextMenuReferences: 'References',
    RunProcess: 'Run',
    ChangeParameters: 'Change Parameters',
    RunProcessAs: 'Run As',
    ExportTo: 'Export to',
    contextMenuDownload: 'Download',
    dateStartPlaceholder: 'Start date',
    dateEndPlaceholder: 'End date',
    timePlaceholder: 'Select time',
    dialogCancelButton: 'Cancel',
    dialogConfirmButton: 'Confirm',
    filterableItems: 'Optional Column',
    fixedleItems: 'Fixed Column',
    resetAllFilters: 'Reset all filters',
    switchActiveText: 'Yes',
    switchInactiveText: 'Not'
  },
  views: {
    SmartBrowser: 'Smart Browser',
    Process: 'Process',
    Window: 'Window',
    noProcess: 'Oops! Not process running',
    logs: 'Logs',
    log: 'Log',
    seeReport: 'See Report',
    summary: 'Summary',
    viewsHelp: 'Help',
    searchCriteria: 'Search Criteria'
  },
  table: {
    ProcessActivity: {
      name: 'Name',
      description: 'Description',
      actions: 'Action',
      status: 'Status',
      Logs: 'Logs',
      Help: 'Help'
    },
    dataTable: {
      search: 'Search',
      records: 'Records',
      selected: 'Selected'
    }
  },
  example: {
    warning: 'Creating and editing pages cannot be cached by keep-alive because keep-alive include does not currently support caching based on routes, so it is currently cached based on component name. If you want to achieve a similar caching effect, you can use a browser caching scheme such as localStorage. Or do not use keep-alive include to cache all pages directly. See details'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  excel: {
    export: 'Export',
    selectedExport: 'Export Selected Items',
    placeholder: 'Please enter the file name (default excel-list)'
  },
  zip: {
    export: 'Export',
    placeholder: 'Please enter the file name (default file)'
  },
  pdf: {
    tips: 'Here we use window.print() to implement the feature of downloading PDF.'
  },
  theme: {
    change: 'Change Theme',
    documentation: 'Theme documentation',
    tips: 'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    tagsView: 'Open Tags-View',
    fixedHeader: 'Fixed Header',
    sidebarLogo: 'Sidebar Logo'
  },
  profile: {
    aboutMe: 'About Me',
    recentItems: 'Recent Items',
    role: 'Role',
    availableRoles: 'Available roles',
    currentRole: 'Current role',
    clientName: 'Client name',
    description: 'Description',
    changeRole: 'Change role',
    changeLanguage: 'Change language',
    changeLanguagePlaceholder: 'Choose a language'
  },
  window: {
    newRecord: 'New Record',
    deleteRecord: 'Delete Record',
    undoNew: 'Undo New Record'
  },
  data: {
    emtpyTableName: 'Error: Table Name is not defined',
    errorGetData: 'Error getting data records'
  }
}
