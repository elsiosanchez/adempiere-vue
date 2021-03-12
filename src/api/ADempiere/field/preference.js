export function requestFieldPreference({
  attributes
}) {
  const { requestUpdateEntity } = require('@/api/ADempiere/persistence.js')

  return requestUpdateEntity(attributes)
}
