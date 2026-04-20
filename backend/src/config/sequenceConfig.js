/**
 * Central configuration for auto-generated business codes.
 * maps module keys (as per apiRegistry) to their database field and prefix.
 */
export const sequenceConfig = {
  department: { field: "deptCode", prefix: "DEPT" },
  subsidary: { field: "subCode", prefix: "SUB" },
  city: { field: "cityCode", prefix: "CTY" },
  state: { field: "stateCode", prefix: "STA" },
  location: { field: "locationCode", prefix: "LOC" },
  uom: { field: "uomCode", prefix: "UOM" },
  vendor: { field: "vendorId", prefix: "VEN" },
  item: { field: "itemCode", prefix: "ITM" },
  crterm: { field: "termCode", prefix: "TRM" },
  assetCategory: { field: "catCode", prefix: "CAT" },
  userRole: { field: "roleCode", prefix: "URL" },
  workflowRole: { field: "wfRoleCode", prefix: "WFR" },
  asset: { field: "assetId", prefix: "AST" },
  workflow: { field: "workflowCode", prefix: "WF" },
  emailTemplate: { field: "templateCode", prefix: "EMT" },
  client: { field: "clientCode", prefix: "CLT" },
  license: { field: "licenseCode", prefix: "LIC" },
  vendorInvite: { field: "inviteNo", prefix: "INV" },
};
