export default {
  route: {
    dashboard: 'Panel de control',
    documentation: 'Documentación',
    guide: 'Guía',
    page401: '401',
    page404: '404',
    profile: 'Perfil',
    ProcessActivity: 'Actividad de Procesos',
    Role: 'Rol',
    ReportViewer: 'Visor de Reportes'
  },
  notifications: {
    completed: 'Completado',
    loading: 'Cargando',
    searching: 'Buscando registros en el servidor',
    succesful: 'Exitoso',
    error: 'Error',
    succcessSearch: 'La búsqueda se ha realizado',
    errorSearch: 'La búsqueda no se ha completado.',
    processing: 'Procesando',
    processExecuted: 'Ejecutado, ver actividad de proceso',
    processError: 'No fue ejecutado',
    emptyValues: 'Parametro(s) con valores vacios',
    fieldMandatory: 'El campo es obligatorio',
    Opened: 'Abierto',
    requestError: 'Error al ejecutar la petición',
    successChangeRole: 'El rol se ha cambiado',
    errorChangeRole: 'El rol no se ha cambiado'
  },
  navbar: {
    badge: {
      Notifications: 'Notificaciones',
      link: 'ir a actividad de proceso'
    },
    logOut: 'Salir',
    dashboard: 'Panel de control',
    github: 'Github',
    theme: 'Tema',
    size: 'Tamaño global',
    profile: 'Perfil'
  },
  login: {
    noValidUser: 'Por favor ingrese el nombre de usuario correcto',
    noValidPassword: 'La contraseña no puede estar vacía',
    invalidLogin: 'ID de usuario o contraseña no válida',
    unexpectedError: 'Se ha producido un error inesperado, intente nuevamente',
    capsLock: 'Bloqueo de mayúsculas activado',
    title: 'Formulario de acceso',
    logIn: 'Acceso',
    username: 'Usuario',
    password: 'Contraseña',
    any: 'nada',
    thirdparty: 'Conectar con',
    thirdpartyTips: 'No se puede simular en local, así que combine su propia simulación de negocios.'
  },
  documentation: {
    documentation: 'Documentación',
    github: 'Repositorio Github'
  },
  permission: {
    addRole: 'Nuevo rol',
    editPermission: 'Permiso de edición',
    roles: 'Tus permisos',
    switchRoles: 'Cambiar permisos',
    tips: 'En algunos casos, no es adecuado usar v-permission, como el componente Element Tab o el-table-column y otros casos de dom de representación asíncrona que solo se pueden lograr configurando manualmente v-if.',
    delete: 'Borrar',
    confirm: 'Confirmar',
    cancel: 'Cancelar'
  },
  guide: {
    description: 'La página de guía es útil para algunas personas que ingresaron al proyecto por primera vez. Puede introducir brevemente las características del proyecto. Demo se basa en ',
    button: 'Ver guía'
  },
  components: {
    date: {
      Today: 'Hoy',
      Yesterday: 'Ayer',
      Week: 'Hace una semana'
    },
    documentation: 'Documentación',
    binaryButton: 'Subir archivo',
    binaryTip: 'Solo archivos con un tamaño menor a 500kb',
    imageError: 'La imagen excede los 2MB y no cumple con los formato validos!',
    contextMenuRelations: 'Relaciones',
    contextMenuActions: 'Acciones',
    contextMenuReferences: 'Referencias',
    contextMenuDownload: 'Descargar',
    RunProcess: 'Ejecutar',
    ChangeParameters: 'Cambiar Parametros',
    RunProcessAs: 'Ejecutar como',
    ExportTo: 'Exportar a',
    dateStartPlaceholder: 'Fecha inicial',
    dateEndPlaceholder: 'Fecha final',
    timePlaceholder: 'Seleccione tiempo',
    dialogCancelButton: 'Cancelar',
    dialogConfirmButton: 'Confirmar',
    filterableItems: 'Columna opcionales',
    fixedleItems: 'Columna Fijas',
    resetAllFilters: 'Reiniciar todos los filtros',
    switchActiveText: 'Si',
    switchInactiveText: 'No'
  },
  views: {
    SmartBrowser: 'Consulta Inteligente',
    Process: 'Proceso',
    Window: 'Ventana',
    noProcess: 'No hay procesos en ejecución',
    logs: 'Bitacoras',
    log: 'Bitacora',
    seeReport: 'Ver Reporte',
    summary: 'Resumen',
    viewsHelp: 'Ayuda',
    searchCriteria: 'Criterio de Búsqueda',
    unsupportedSorry: 'Lo sentimos',
    unsupportedHeadline: 'Esta vista no está disponible actualmente',
    unsupportedInfo: 'Verifique que la vista sea compatible con esta versión, o haga clic en el botón a continuación para volver a la página de inicio.',
    unsupportedButton: 'Volver al Panel de control'
  },
  table: {
    ProcessActivity: {
      Name: 'Nombre',
      Description: 'Descripción',
      FileName: 'Nombre de Archivo',
      Output: 'Salida',
      Action: 'Acción',
      Status: 'Estado',
      Logs: 'Bitacora',
      Summary: 'Resumen',
      Help: 'Ayuda'
    },
    dataTable: {
      search: 'Buscar',
      records: 'Registros',
      selected: 'Seleccionados',
      deleteSelection: 'Eliminar registros seleccionados',
      avancedQuery: 'Consulta avanzada'
    },
    recentItems: {
      search: 'Filtrar por nombre, descripción o fecha',
      date: 'Fecha',
      name: 'Nombre',
      description: 'Descripción'
    }
  },
  tagsView: {
    refresh: 'Actualizar',
    close: 'Cerrar',
    closeOthers: 'Cerrar otros',
    closeAll: 'Cerrar todos',
    newRecord: 'Nuevo Registro',
    seeRecord: 'Ver Registro'
  },
  settings: {
    title: 'Configuración de estilo de página',
    theme: 'Color del tema',
    tagsView: 'Habilitar Tags-View',
    fixedHeader: 'Encabezado fijo',
    sidebarLogo: 'Logotipo de la barra lateral'
  },
  profile: {
    aboutMe: 'Sobre Mi',
    recentItems: 'Artículos recientes',
    role: 'Rol',
    availableRoles: 'Roles disponibles',
    currentRole: 'Rol actual',
    clientName: 'Nombre del cliente',
    description: 'Descripción',
    changeRole: 'Cambiar rol',
    changeLanguage: 'Cambiar idioma',
    changeLanguagePlaceholder: 'Elija un idioma'
  },
  window: {
    newRecord: 'Nuevo Registro',
    deleteRecord: 'Eliminar Registro',
    undoNew: 'Descartar Nuevo Registro'
  },
  data: {
    emtpyTableName: 'Error: El nombre de la tabla no esta definida',
    errorGetData: 'Error obteniendo los datos de registro',
    createRecordSuccessful: 'Nuevo registro creado con exito',
    createNewRecord: 'Modo nuevo registro',
    createRecordError: 'Error al crear nuevo registro',
    deleteRecordSuccessful: 'Registro eliminado exitosamente',
    deleteRecordError: 'Error al eliminar el regitro',
    selectionRequired: 'Debe seleccionar un registro'
  }
}
