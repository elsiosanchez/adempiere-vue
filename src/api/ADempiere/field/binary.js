/**
 * Get entity with binary by identifier
 * @param {number} recordId
 * @param {string} recordUuid
 * @param {object} binary
 */
export function requestGetBinary({
  id,
  uuid,
  tableName,
  binary
}) {
  const { requestGetEntity } = require('@/api/ADempiere/persistence.js')

  return requestGetEntity({
    recordId: id,
    recordUuid: uuid,
    tableName,
    binary
  })
}

/**
 * Update an existing binary by id or uuid
 * @param {number} recordId
 * @param {string} recordUuid
 * @param {object} binary
 * @param {array} attributesList
 */
export function requestUpdateBinary({
  recordId: id,
  recordUuid: uuid,
  tableName,
  attributesList
}) {
  const { requestUpdateEntity } = require('@/api/ADempiere/persistence.js')

  return requestUpdateEntity({
    recordId: id,
    recordUuid: uuid,
    tableName,
    binary: attributesList
  })
}
