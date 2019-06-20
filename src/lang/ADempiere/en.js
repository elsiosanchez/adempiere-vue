/* import store from '@/store'
function translations() {
  return store.getters.getMessages
}
var messages = translations() */
export default {
  route: {
    dashboard: 'Dashboard',
    documentation: 'Documentation',
    guide: 'Guide',
    profile: 'Profile',
    ProcessActivity: 'Process Activity',
    Role: 'Role',
    SearchWindow: 'Search Window',
    ReportViewer: 'Report Viewer'
  },
  notifications: {
    loading: 'Loading',
    searching: 'Searching records in server',
    succesful: 'Successful',
    error: 'Error',
    succcessSearch: 'The search has been made',
    errorSearch: 'The search has not been completed.',
    processing: 'Processing',
    processExecuted: ' executed, see process activity',
    processError: ' he was not executed'
  },
  components: {
    documentation: 'Documentation',
    binaryButton: 'Upload file',
    binaryTip: 'Only files with a size smaller than 500kb',
    contextMenuRelations: 'Relations',
    contextMenuActions: 'Actions',
    contextMenuReferences: 'References',
    dateStartPlaceholder: 'Start date',
    dateEndPlaceholder: 'End date',
    dialogCancelButton: 'Cancel',
    dialogConfirmButton: 'Confirm',
    filterableItems: 'Optional fields'
  },
  views: {
    SmartBrowser: 'Smart Browser',
    Process: 'Process',
    Window: 'Window'
  }
}
