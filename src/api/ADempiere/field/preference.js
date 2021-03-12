export function requestFieldPreference({
  parentUuid,
  containerUuid,
  panelType,
  attribute,
  value,
  level
}) {
  const { requestUpdateEntity } = require('@/api/ADempiere/persistence.js')

  return requestUpdateEntity({
    parentUuid,
    containerUuid,
    panelType,
    attribute,
    value,
    level
  })
}
