import store from '@/store'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
/**
 * Process Builder
 * @author Edwin Betancourt <EdwinBetanc0urt@outlook.com>
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
class ProcessBuilder {
  static ProcessBuilder() {
    return new ProcessBuilder()
  }
  get reportParameters() {
    return {
      processUuid: this.processUuid,
      instanceUuid: this.instanceUuid,
      processId: this.processId,
      tableName: this.output.tableName,
      printFormatUuid: this.output.printFormatUuid,
      reportViewUuid: this.output.reportViewUuid
    }
  }
  // get info metadata process
  findProcess({ isActionDocument, action }) {
    const processDefinition = !isEmptyValue(isActionDocument) ? action : store.getters.getProcess(action.uuid)
    if (!isEmptyValue(processDefinition)) {
      this.action = processDefinition.processName
      this.lastRun = (new Date()).getTime()
      this.name = processDefinition.processName
      this.description = processDefinition.description
      this.processUuid = processDefinition.uuid
      this.processId = processDefinition.id
      this.processName = processDefinition.processName
      this.isReport = processDefinition.isReport
    }
  }
  runProcess(process) {
    this.instanceUuid = process.instanceUuid
    this.output = isEmptyValue(process.output) ? {} : process.output
    this.logs = isEmptyValue(process.logsList) ? [] : process.logsList
    this.isProcessing = process.isProcessing
    this.isError = process.isError
    this.lastRun = process.lastRun
    this.summary = process.summary
    return this
  }
  // Parent Menu
  withMenuParent({ menuParentUuid }) {
    this.menuParentUuid = menuParentUuid
  }
  // assign new attributes
  withAssignAttributes({ url, download, output }) {
    this.url = url
    this.download = download
    this.output = output
  }
  // with list the Parameters
  withParametersList({ parameters }) {
    if (isEmptyValue(parameters)) {
      this.parameters = store.getters.getParametersToServer({
        containerUuid: this.processUuid
      })
    } else {
      this.parameters = parameters
    }
  }
  // with Error
  withError({ isError, message, isProcessing }) {
    this.isError = isError
    this.message = message
    this.isProcessing = isProcessing
  }
  // Reporte

  // Report views List to context menu
  reportListContextMenu(reportViewList) {
    const contextMenuMetadata = store.getters.getContextMenu(this.processUuid)
    if (!isEmptyValue(reportViewList)) {
      reportViewList.childs = store.getters.getReportViewList(this.processUuid)
      if (!isEmptyValue(reportViewList.childs.length)) {
        store.dispatch('getReportViewsFromServer', this.reportParameters)
          .then(responseReportView => {
            reportViewList.childs = responseReportView
            if (reportViewList.childs.length) {
              // Get contextMenu metadata and concat print report views with contextMenu actions
              contextMenuMetadata.actions.push(reportViewList)
            }
          })
      }
    }
  }
  // Print formats to context menu
  printFormat(printFormatList) {
    const contextMenuMetadata = store.getters.getContextMenu(this.processUuid)
    if (!isEmptyValue(printFormatList)) {
      printFormatList.childs = store.getters.getPrintFormatList(this.processUuid)
      if (printFormatList && !printFormatList.childs.length) {
        store.dispatch('getListPrintFormats', this.reportParameters)
          .then(printFormarResponse => {
            printFormatList.childs = printFormarResponse
            if (printFormatList.childs.length) {
              // Get contextMenu metadata and concat print Format List with contextMenu actions
              contextMenuMetadata.actions.push(printFormatList)
            }
          })
      } else {
        const index = contextMenuMetadata.actions.findIndex(action => action.option === 'printFormat')
        if (index !== -1) {
          contextMenuMetadata.actions[index] = printFormatList
        }
      }
    }
  }
  // Drill Tables to context menu
  drillTable(drillTablesList) {
    if (!isEmptyValue(drillTablesList)) {
      const contextMenuMetadata = store.getters.getContextMenu(this.processUuid)
      if (!isEmptyValue(this.output.tableName)) {
        drillTablesList.childs = store.getters.getDrillTablesList(this.processUuid)
        if (drillTablesList && isEmptyValue(drillTablesList.childs)) {
          store.dispatch('getDrillTablesFromServer', this.reportParameters)
            .then(drillTablesResponse => {
              drillTablesList.childs = drillTablesResponse
              if (drillTablesList.childs.length) {
                // Get contextMenu metadata and concat print Format List with contextMenu actions
                contextMenuMetadata.actions.push(drillTablesList)
              }
            })
        }
      }
    }
  }
}

export default ProcessBuilder
