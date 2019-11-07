import Enrollment from '@adempiere/grpc-enrollment-client'
import { HOST_GRPC_ENROLLMENT } from '@/api/ADempiere/constants'

// Get Instance for connection
function Instance() {
  return new Enrollment(
    HOST_GRPC_ENROLLMENT,
    3.9,
    'ADempier-Vue'
  )
}

/**
 * Request from forgot password
 * @param {string} eMailOrUserName
 */
export function forgotPassword(eMailOrUserName) {
  return Instance.call(this).requestResetPassword(eMailOrUserName)
}

/**
 * Request from reset password with token
 * @param {string} token
 * @param {string} password
 */
export function resetPasswordFromToken(token, password) {
  return Instance.call(this).resetPasswordFromToken(token, password)
}
