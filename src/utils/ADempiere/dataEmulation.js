
export function contextInitial() {
  const context = {}
  context['AutoCommit'] = true
  context['AutoNew'] = true
  context['Login.RememberMe'] = true

  context['#YYYY'] = true
  context['#AD_Session_ID'] = 1001424
  context['#AD_User_ID'] = 100 // Super User ID
  context['#UI'] = 'WebUI'

  context['#AD_Language'] = 'en_US'
  context['#Locale'] = 'en_US'
  context['#LanguageName'] = 'English'
  context['#C_Country_ID'] = 100
  context['#C_Region_ID'] = 142

  context['#AD_Org_ID'] = 0
  context['#AD_Org_Name'] = '*'

  context['#AD_PrintColor_ID'] = 100
  context['#AD_PrintFont_ID'] = 163
  context['#AD_PrintPaper_ID'] = 100
  context['#AD_PrintTableFormat_ID'] = 100
  context['#AD_SearchDefinition_ID'] = 50000
  context['#C_ConversionType_ID'] = 114
  context['#C_UOM_ID'] = 100
  context['#IsLiberoEnabled'] = true
  context['#IsLiberoWMEnabled'] = true
  context['#M_Warehouse_ID'] = 0
  context['#SalesRep_ID'] = 100
  context['#ShowAcct'] = false
  context['#ShowAdvanced'] = true
  context['#ShowTrl'] = true
  context['#StdPrecision'] = 2

  context['#A_Asset_Group_ID'] = 50006
  context['#C_BP_Group_ID'] = 103
  context['#C_BankAccount_ID'] = 100
  context['#C_CashBook_ID'] = 101
  context['#C_DocTypeTarget_ID'] = 126
  context['#C_Dunning_ID'] = 100
  context['#C_PaymentTerm_ID'] = 105
  context['#C_TaxCategory_ID'] = 107
  context['#C_Tax_ID'] = 104
  context['#GL_Category_ID'] = 108
  context['#M_CostElement_ID'] = 100
  context['#M_Locator_ID'] = 50006
  context['#M_PriceList_ID'] = 101
  context['#M_Product_Category_ID'] = 105
  context['#PP_Product_BOM_ID'] = 145
  context['#R_StatusCategory_ID'] = 100
  context['#R_Status_ID'] = 100

  context['$C_AcctSchema_ID'] = 101
  context['$C_Currency_ID'] = 100
  context['$Element_AC'] = true
  context['$Element_BP'] = true
  context['$Element_MC'] = true
  context['$Element_OO'] = true
  context['$Element_PJ'] = true
  context['$Element_PR'] = true
  context['$HasAlias'] = true

  return context
}
