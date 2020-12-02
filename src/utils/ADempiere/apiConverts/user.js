
export function convertSession(sessionToConvert) {
  return {
    id: sessionToConvert.id,
    uuid: sessionToConvert.uuid,
    name: sessionToConvert.name,
    userInfo: sessionToConvert.user_info,
    role: convertRole(
      sessionToConvert.role
    ),
    processed: sessionToConvert.processed,
    defaultContext: sessionToConvert.default_context,
    // system info
    countryId: sessionToConvert.country_id,
    costingPrecision: sessionToConvert.costing_precision,
    countryCode: sessionToConvert.country_code,
    countryName: sessionToConvert.country_name,
    currencyIsoCode: sessionToConvert.currency_iso_code,
    currencyName: sessionToConvert.currency_name,
    currencySymbol: sessionToConvert.currency_symbol,
    displaySequence: sessionToConvert.display_sequence,
    language: sessionToConvert.language,
    standardPrecision: sessionToConvert.standard_precision
  }
}

export function convertRole(roleToConvert) {
  const { id, uuid, name, description } = roleToConvert

  return {
    id,
    uuid,
    name,
    description,
    clientId: roleToConvert.client_id,
    clientName: roleToConvert.client_name,
    is_allow_html_view: roleToConvert.is_allow_html_view,
    is_allow_info_account: roleToConvert.is_allow_info_account,
    is_allow_info_asset: roleToConvert.is_allow_info_asset,
    is_allow_info_business_partner: roleToConvert.is_allow_info_business_partner,
    is_allow_info_cash_journal: roleToConvert.is_allow_info_cash_journal,
    is_allow_info_crp: roleToConvert.is_allow_info_crp,
    is_allow_info_in_out: roleToConvert.is_allow_info_in_out,
    is_allow_info_invoice: roleToConvert.is_allow_info_invoice,
    is_allow_info_mrp: roleToConvert.is_allow_info_mrp,
    is_allow_info_order: roleToConvert.is_allow_info_order,
    is_allow_info_payment: roleToConvert.is_allow_info_payment,
    is_allow_info_product: roleToConvert.is_allow_info_product,
    is_allow_info_resource: roleToConvert.is_allow_info_resource,
    is_allow_info_schedule: roleToConvert.is_allow_info_schedule,
    is_allow_xls_view: roleToConvert.is_allow_xls_view,
    isCanExport: roleToConvert.is_can_export,
    isCanReport: roleToConvert.is_can_report,
    isPersonalAccess: roleToConvert.is_personal_access,
    isPersonalLock: roleToConvert.is_personal_lock
  }
}
