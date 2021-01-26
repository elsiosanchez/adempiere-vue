import store from '@/store'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

class ProcessStructure {
  constructor({
    action,
    containerUuid,
    description,
    download,
    instanceUuid,
    isError,
    isProcessing,
    isReport,
    lastRun,
    logs,
    menuParentUuid,
    name,
    output,
    panelType,
    parameters,
    parametersList,
    parentUuid,
    printFormatUuid,
    processId,
    processIdPath,
    processName,
    processUuid,
    resultTableName,
    summary,
    url,
    uuid
  }) {
    // panel attributes from where it was executed
    this.action = action
    this.containerUuid = containerUuid
    this.description = description
    this.download = download
    this.instanceUuid = instanceUuid
    this.isError = isError
    this.isProcessing = isProcessing
    this.isReport = isReport
    this.lastRun = lastRun
    this.logs = []
    this.menuParentUuid = menuParentUuid
    this.name = name
    this.output = output
    this.parameters = parameters
    this.parametersList = parametersList
    this.parentUuid = parentUuid
    this.printFormatUuid = printFormatUuid
    this.processId = processId
    this.processIdPath = processIdPath
    this.processName = processName
    this.processUuid = processUuid
    this.resultTableName = resultTableName
    this.summary = summary
    this.url = url
    this.uuid = uuid
  }
  addAction(action) {
    this.action = action
  }
  addContainerUuid(containerUuid) {
    this.containerUuid = containerUuid
  }
  addDescription(description) {
    this.description = description
  }
  addDownload(download) {
    this.download = download
  }
  addInstanceUuid(instanceUuid) {
    this.instanceUuid = instanceUuid
  }
  addIsError(isError) {
    this.isError = isError
  }
  addIsProcessing(isProcessing) {
    this.isProcessing = isProcessing
  }
  addIsReport(isReport) {
    this.isReport = isReport
  }
  addLastRun(lastRun) {
    this.lastRun = lastRun
  }
  addlogs(logs) {
    this.logs = logs
  }
  addMenuParentUuid(menuParentUuid) {
    this.menuParentUuid = menuParentUuid
  }
  addName(name) {
    this.name = name
  }
  addOutput({ uuid, name, description, fileName, output, outputStream, reportType }) {
    this.output = {
      uuid,
      name,
      description,
      fileName,
      output,
      outputStream,
      reportType
    }
  }
  addParametersList(parametersList) {
    this.parametersList = parametersList
  }
  addParentUuid(parentUuid) {
    this.parentUuid = parentUuid
  }
  addPrintFormatUuid(printFormatUuid) {
    this.printFormatUuid = printFormatUuid
  }
  addProcessId(processId) {
    this.processId = processId
  }
  addProcessIdPath(processIdPath) {
    this.processIdPath = processIdPath
  }
  addProcessName(processName) {
    this.processName = processName
  }
  addProcessUuid(processUuid) {
    this.processUuid = processUuid
  }
  addResultTableName(resultTableName) {
    this.resultTableName = resultTableName
  }
  addSummary(summary) {
    this.summary = summary
  }
  addUrl(url) {
    this.url = url
  }
  addUuid(uuid) {
    this.uuid = uuid
  }
  addProcessDefinition(processDefinition) {
    this.processDefinition = processDefinition
  }
  // get alo() {
  //   return this.ProcessDefinition()
  // }
  get ProcessResult() {
    // this.findProcess()
    return {
      action: this.action,
      containerUuid: this.containerUuid,
      description: this.description,
      download: this.download,
      instanceUuid: this.instanceUuid,
      isError: this.isError,
      isProcessing: this.isProcessing,
      isReport: this.isReport,
      lastRun: this.lastRun,
      logs: this.logs,
      menuParentUuid: this.menuParentUuid,
      name: this.name,
      output: this.output,
      parameters: this.parameters,
      parametersList: this.parametersList,
      parentUuid: this.parentUuid,
      printFormatUuid: this.printFormatUuid,
      processId: this.processId,
      processIdPath: this.processIdPath,
      processName: this.processName,
      processUuid: this.processUuid,
      resultTableName: this.resultTableName,
      summary: this.summary,
      url: this.url,
      uuid: this.uuid
    }
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
  get paramsProcess() {
    return {
      uuid: this.processUuid,
      id: this.processId,
      parametersList: this.parametersList,
      reportType: this.output.reportType
    }
  }

  findProcess({ isActionDocument, action }) {
    const processDefinition = !isEmptyValue(isActionDocument) ? action : store.getters.getProcess(action.uuid)
    if (!isEmptyValue(processDefinition)) {
      console.log(processDefinition)
      this.action = processDefinition.processName
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
    this.output = process.output
    this.logs = process.logsList
    this.isProcessing = process.isProcessing
    this.isError = process.isError
    this.lastRun = process.lastRun
    this.summary = process.summary
  }
  // assign new attributes
  addAssignAttributes({ url, download, output }) {
    this.url = url
    this.download = download
    this.output = output
  }
  // add Error
  addError({ isError, message, isProcessing }) {
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

export default ProcessStructure
