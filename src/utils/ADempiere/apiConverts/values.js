// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Yamel Senih ysenih@erpya.com www.erpya.com
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export function convertReferencesList(listReferencesToConvert) {
  return {
    recordCount: listReferencesToConvert.record_count,
    referencesList: listReferencesToConvert.records.map(record => {
      return convertReference(record)
    }),
    nextPageToken: listReferencesToConvert.next_page_token
  }
}

export function convertReference(referenceToConvert) {
  const { uuid } = referenceToConvert

  return {
    uuid,
    tableName: referenceToConvert.table_name,
    windowUuid: referenceToConvert.window_uuid,
    displayName: referenceToConvert.display_name,
    whereClause: referenceToConvert.where_clause,
    recordCount: referenceToConvert.record_count
  }
}
