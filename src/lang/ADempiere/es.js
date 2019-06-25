/* import store from '@/store'
function translations() {
  return store.getters.getMessages
}
var messages = translations() */
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
    SearchWindow: 'Ventana de Búsqueda',
    ReportViewer: 'Visor de Reportes'
  },
  notifications: {
    loading: 'Cargando',
    searching: 'Buscando registros en el servidor',
    succesful: 'Exitoso',
    error: 'Error',
    succcessSearch: 'La búsqueda se ha realizado',
    errorSearch: 'La búsqueda no se ha completado.',
    processing: 'Procesando',
    processExecuted: ' ejecutado, ver actividad de proceso',
    processError: ' no fue ejecutado'
  },
  navbar: {
    logOut: 'Salir',
    dashboard: 'Panel de control',
    github: 'Github',
    theme: 'Tema',
    size: 'Tamaño global',
    profile: 'Perfil'
  },
  login: {
    title: 'Formulario de acceso',
    logIn: 'Acceso',
    username: 'Usuario',
    password: 'Contraseña',
    any: 'nada',
    thirdparty: 'Conectar con',
    thirdpartyTips: 'No se puede simular en local, así que combine su propia simulación de negocios. !'
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
    tips: 'In some cases it is not suitable to use v-permission, such as element Tab component or el-table-column and other asynchronous rendering dom cases which can only be achieved by manually setting the v-if.',
    delete: 'Borrar',
    confirm: 'Confirmar',
    cancel: 'Cancelar'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Ver guía'
  },
  components: {
    documentation: 'Documentación',
    binaryButton: 'Subir archivo',
    binaryTip: 'Solo archivos con un tamaño menor a 500kb',
    contextMenuRelations: 'Relaciones',
    contextMenuActions: 'Acciones',
    contextMenuReferences: 'Referencias',
    dateStartPlaceholder: 'Fecha de inicio',
    dateEndPlaceholder: 'Fecha final',
    dialogCancelButton: 'Cancelar',
    dialogConfirmButton: 'Confirmar',
    filterableItems: 'Campos opcionales'
  },
  views: {
    SmartBrowser: 'Consulta Inteligente',
    Process: 'Proceso',
    Window: 'Ventana'
  },
  tagsView: {
    refresh: 'Actualizar',
    close: 'Cerrar',
    closeOthers: 'Cerrar otros',
    closeAll: 'Cerrar todos'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    tagsView: 'Open Tags-View',
    fixedHeader: 'Fixed Header',
    sidebarLogo: 'Sidebar Logo'
  }
}
