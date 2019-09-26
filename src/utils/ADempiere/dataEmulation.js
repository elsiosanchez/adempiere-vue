
export function contextInitialMap() {
  var context = new Map()
  context.set('AutoCommit', 'Y')
  context.set('AutoNew', 'Y')
  context.set('Login.RememberMe', 'Y')

  context.set('#YYYY', 'Y')
  context.set('#AD_Session_ID', 1001424)
  context.set('#UI', 'WebUI')

  context.set('#AD_Language', 'en_US')
  context.set('#Locale', 'en_US')
  context.set('#LanguageName', 'English')
  context.set('#C_Country_ID', 100)
  context.set('#C_Region_ID', 142)

  context.set('#AD_Org_ID', 0)
  context.set('#AD_Org_Name', '*')

  context.set('#AD_PrintColor_ID', 100)
  context.set('#AD_PrintFont_ID', 163)
  context.set('#AD_PrintPaper_ID', 100)
  context.set('#AD_PrintTableFormat_ID', 100)
  context.set('#AD_SearchDefinition_ID', 50000)
  context.set('#C_ConversionType_ID', 114)
  context.set('#C_UOM_ID', 100)
  context.set('#IsLiberoEnabled', 'Y')
  context.set('#IsLiberoWMEnabled', 'Y')
  context.set('#M_Warehouse_ID', 0)
  context.set('#SalesRep_ID', 100)
  context.set('#ShowAcct', 'N')
  context.set('#ShowAdvanced', 'Y')
  context.set('#ShowTrl', 'Y')
  context.set('#StdPrecision', 2)

  context.set('#A_Asset_Group_ID', 50006)
  context.set('#C_BP_Group_ID', 103)
  context.set('#C_BankAccount_ID', 100)
  context.set('#C_CashBook_ID', 101)
  context.set('#C_DocTypeTarget_ID', 126)
  context.set('#C_Dunning_ID', 100)
  context.set('#C_PaymentTerm_ID', 105)
  context.set('#C_TaxCategory_ID', 107)
  context.set('#C_Tax_ID', 104)
  context.set('#GL_Category_ID', 108)
  context.set('#M_CostElement_ID', 100)
  context.set('#M_Locator_ID', 50006)
  context.set('#M_PriceList_ID', 101)
  context.set('#M_Product_Category_ID', 105)
  context.set('#PP_Product_BOM_ID', 145)
  context.set('#R_StatusCategory_ID', 100)
  context.set('#R_Status_ID', 100)

  context.set('$C_AcctSchema_ID', 101)
  context.set('$C_Currency_ID', 100)
  context.set('$Element_AC', 'Y')
  context.set('$Element_BP', 'Y')
  context.set('$Element_MC', 'Y')
  context.set('$Element_OO', 'Y')
  context.set('$Element_PJ', 'Y')
  context.set('$Element_PR', 'Y')
  context.set('$HasAlias', 'Y')

  return context
}

export function contextInitialObject() {
  const context = {}
  context['AutoCommit'] = 'Y'
  context['AutoNew'] = 'Y'
  context['Login.RememberMe'] = 'Y'

  context['#YYYY'] = 'Y'
  context['#AD_Session_ID'] = 1001424
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
  context['#IsLiberoEnabled'] = 'Y'
  context['#IsLiberoWMEnabled'] = 'Y'
  context['#M_Warehouse_ID'] = 0
  context['#SalesRep_ID'] = 100
  context['#ShowAcct'] = 'N'
  context['#ShowAdvanced'] = 'Y'
  context['#ShowTrl'] = 'Y'
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
  context['$Element_AC'] = 'Y'
  context['$Element_BP'] = 'Y'
  context['$Element_MC'] = 'Y'
  context['$Element_OO'] = 'Y'
  context['$Element_PJ'] = 'Y'
  context['$Element_PR'] = 'Y'
  context['$HasAlias'] = 'Y'

  return context
}
