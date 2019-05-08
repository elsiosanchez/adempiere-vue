import { getMenu } from '@/api/user'
import { getToken } from '@/utils/auth'

/* Layout  */
import Layout from '@/layout'

// Get Menu from server
export function loadMainMenu() {
  return getMenu(getToken()).then(menu => {
    const asyncRouterMap = [
      {
        path: '*',
        redirect: '/dashboard',
        hidden: true
      }
    ]
    menu.getChildsList().forEach(function(menu) {
      const optionMenu = getRouteFromMenuItem(menu)
      if (menu.getIssummary()) {
        menu.getChildsList().forEach(function(menu) {
          optionMenu.children.push(getChildFromAction(menu))
        })
      } else {
        optionMenu.children.push(getChildFromAction(menu))
      }
      asyncRouterMap.push(optionMenu)
    })
    return asyncRouterMap
  }).catch(error => {
    console.log('Error with Login: ' + error)
  })
}

// Get Only Child
function getChildFromAction(menu) {
  const action = menu.getAction()
  var actionParameters = convertAction(action)
  var routeIdentifier = actionParameters.name + '/' + menu.getReferenceuuid()
  let selectedComponent
  if (action === 'W') {
    selectedComponent = () => import('@/components/ADempiere/Window/window')
  } else if (action === 'S') {
    selectedComponent = () => import('@/components/ADempiere/Browser')
  } else if (action === 'P' || action === 'R') {
    selectedComponent = () => import('@/components/ADempiere/Process')
  } else {
    routeIdentifier = actionParameters.name + '/' + menu.getUuid()
  }
  var option = {
    path: routeIdentifier,
    component: selectedComponent,
    name: menu.getReferenceuuid(),
    hidden: actionParameters.hidden,
    alwaysShow: false,
    meta: {
      title: menu.getName(),
      uuid: menu.getReferenceuuid(),
      type: actionParameters.name,
      parentUuid: menu.getParentuuid(),
      icon: actionParameters.icon,
      noCache: false
    }
  }
  return option
}

// Convert menu item from server to Route
function getRouteFromMenuItem(menu) {
  const action = menu.getAction()
  var actionParameters = convertAction(action)
  var optionMenu = []
  optionMenu = {
    path: '/' + menu.getUuid().replace(/ /g, ''),
    component: Layout,
    name: menu.getUuid(),
    meta: {
      title: menu.getName(),
      type: actionParameters.name,
      icon: actionParameters.icon,
      noCache: true
    },
    children: []
  }
  return optionMenu
}

// Convert action to action name for route
function convertAction(action) {
  var actionParameters = {
    name: '',
    icon: '',
    hidden: false
  }
  switch (action) {
    case 'B':
      actionParameters.name = 'workbech'
      break
    case 'F':
      actionParameters.name = 'workflow'
      actionParameters.icon = 'example'
      break
    case 'P':
      actionParameters.name = 'process'
      actionParameters.icon = 'component'
      break
    case 'R':
      actionParameters.name = 'report'
      actionParameters.icon = 'skill'
      break
    case 'S':
      actionParameters.name = 'browser'
      actionParameters.icon = 'search'
      break
    case 'T':
      actionParameters.name = 'task'
      break
    case 'W':
      actionParameters.name = 'window'
      actionParameters.icon = 'tab'
      break
    case 'X':
      actionParameters.name = 'form'
      actionParameters.icon = 'form'

      break
    default:
      actionParameters.name = 'summary'
      actionParameters.icon = 'nested'
      actionParameters.hidden = true
      break
  }
  return actionParameters
}
