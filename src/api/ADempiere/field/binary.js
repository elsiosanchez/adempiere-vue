/**
 * Get entity with binary by identifier
 * @param {number} recordId
 * @param {string} recordUuid
 */
export function requestgetResource({
  id,
  uuid,
  tableName
}) {
  const { requestGetEntity } = require('@/api/ADempiere/persistence.js')

  return requestGetEntity({
    recordId: id,
    recordUuid: uuid,
    tableName
  })
}

/**
 * Update an existing binary by id or uuid
 * @param {number} recordId
 * @param {string} recordUuid
 * @param {object} binary
 * @param {array} attributesList
 */
export function requestUpdateResource({
  recordId: id,
  recordUuid: uuid,
  tableName
}) {
  const { requestUpdateEntity } = require('@/api/ADempiere/persistence.js')

  return requestUpdateEntity({
    recordId: id,
    recordUuid: uuid,
    tableName
  })
}
