import { z } from "zod";

export const masterModules = {
  departments: {
    // Backend: GET/POST /api/v1/departments
    // Backend: GET/PATCH /api/v1/departments/:deptCode
    // Backend: PATCH /api/v1/departments/:deptCode/toggle-status
    endpoint: "/departments",
    title: "Departments",
    idField: "deptCode", // used to build /:deptCode URLs
    columns: [
      { header: "Code", accessor: "deptCode" },
      { header: "Description", accessor: "description" },
      { header: "Head", accessor: "departmentHead" },
      { header: "Location", accessor: "location" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "deptCode",
        label: "Department Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      { name: "departmentHead", label: "Department Head", type: "text" },
      { name: "location", label: "Location", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      deptCode: z
        .string()
        .min(1, "Code is required")
        .max(20, "Maximum 20 characters"),
      description: z.string().optional(),
      departmentHead: z.string().optional(),
      location: z.string().optional(),
      isActive: z.boolean().default(true),
    }),
  },

  cities: {
    // Backend: GET/POST /api/v1/cities
    // Backend: GET/PATCH /api/v1/cities/:cityCode
    // Backend: PATCH /api/v1/cities/:cityCode/toggle-status
    // NOTE: stateCode must be a MongoDB ObjectId (_id of a State document)
    endpoint: "/cities",
    title: "Cities",
    idField: "cityCode",
    columns: [
      { header: "Code", accessor: "cityCode" },
      { header: "Description", accessor: "description" },
      { header: "Short Name", accessor: "shortName" },
      { header: "State", accessor: "stateCode.description" }, // populated from backend
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "cityCode",
        label: "City Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      { name: "shortName", label: "Short Name", type: "text" },
      // stateCode rendered as a Select in GenericMasterForm via type:'stateSelect'
      { name: "stateCode", label: "State", type: "stateSelect" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      cityCode: z.string().min(1, "Code is required"),
      description: z.string().min(1, "Description is required"),
      shortName: z.string().optional(),
      stateCode: z.string().min(1, "State is required"), // ObjectId string
      isActive: z.boolean().default(true),
    }),
  },

  crterms: {
    // Backend: GET/POST /api/v1/crterms
    // Backend: GET/PATCH /api/v1/crterms/:termCode
    endpoint: "/crterms",
    title: "Credit Terms",
    idField: "termCode",
    columns: [
      { header: "Code", accessor: "termCode" },
      { header: "Description", accessor: "description" },
      { header: "Days", accessor: "days" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "termCode",
        label: "Term Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      { name: "days", label: "Days", type: "number" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      termCode: z.string().min(1, "Code is required"),
      description: z.string().min(1, "Description is required"),
      days: z.coerce.number().min(0, "Days must be positive"),
      isActive: z.boolean().default(true),
    }),
  },
  states: {
    endpoint: "/states",
    title: "States",
    idField: "stateCode",
    columns: [
      { header: "Code", accessor: "stateCode" },
      { header: "Description", accessor: "description" },
      { header: "Short Name", accessor: "shortName" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "stateCode",
        label: "State Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      { name: "shortName", label: "Short Name", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      stateCode: z.string().min(1, "Code is required"),
      description: z.string().min(1, "Description is required"),
      shortName: z.string().optional(),
      isActive: z.boolean().default(true),
    }),
  },

  uoms: {
    endpoint: "/uoms",
    title: "Units of Measure",
    idField: "uomCode",
    columns: [
      { header: "Code", accessor: "uomCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "uomCode",
        label: "UOM Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      uomCode: z.string().min(1, "Code is required"),
      description: z.string().min(1, "Description is required"),
      isActive: z.boolean().default(true),
    }),
  },

  subsidaries: {
    endpoint: "/subsidaries",
    title: "Subsidiaries",
    idField: "subsidaryCode",
    columns: [
      { header: "Code", accessor: "subsidaryCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "subsidaryCode",
        label: "Subsidiary Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      subsidaryCode: z.string().min(1, "Code is required"),
      description: z.string().min(1, "Description is required"),
      isActive: z.boolean().default(true),
    }),
  },

  assetCategories: {
    endpoint: "/asset-categories",
    title: "Asset Categories",
    idField: "catCode",
    columns: [
      { header: "Code", accessor: "catCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "catCode",
        label: "Asset Category Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      catCode: z.string().min(1, "Code is required"),
      description: z.string().min(1, "Description is required"),
      isActive: z.boolean().default(true),
    }),
  },

  vendors: {
    endpoint: "/vendors",
    title: "Vendors",
    idField: "vendorId",
    columns: [
      { header: "ID", accessor: "vendorId" },
      { header: "Full Name", accessor: "fullName" },
      { header: "Email", accessor: "emailId" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "vendorId",
        label: "Vendor ID",
        type: "text",
        disabledOnEdit: true,
        disabledOnCreate: true,
      },
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "emailId", label: "Email Address", type: "email" },
      {
        name: "registrationType",
        label: "Registration Type",
        type: "select",
        options: [
          { label: "Unregistered", value: "unregistered" },
          { label: "Regular", value: "regular" },
          { label: "Composite Dealer", value: "compositeDealer" },
          { label: "Overseas", value: "overseas" },
          { label: "SEZ", value: "sez" },
        ],
      },
      { name: "registrationNo", label: "Registration No", type: "text" },
      { name: "panNo", label: "PAN No", type: "text" },
      { name: "currency", label: "Currency", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      fullName: z.string().min(1, "Full name is required"),
      emailId: z.string().email("Invalid email address"),
      registrationType: z.string().min(1, "Type is required"),
      registrationNo: z.string().optional(),
      panNo: z.string().optional(),
      currency: z.string().min(1, "Currency is required"),
      isActive: z.boolean().default(true),
    }),
  },

  lineofbusinesses: {
    endpoint: "/line-of-businesses",
    title: "Lines of Business",
    idField: "lobCode",
    columns: [
      { header: "Code", accessor: "lobCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "lobCode",
        label: "LOB Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      lobCode: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      isActive: z.boolean().default(true),
    }),
  },

  chartofaccounts: {
    endpoint: "/chart-of-accounts",
    title: "Chart of Accounts",
    idField: "accountCode",
    columns: [
      { header: "Code", accessor: "accountCode" },
      { header: "Name", accessor: "accountName" },
      { header: "Type", accessor: "accountType" },
      { header: "Group", accessor: "accountGroup" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    fields: [
      {
        name: "accountCode",
        label: "Account Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "accountName", label: "Account Name", type: "text" },
      {
        name: "accountType",
        label: "Account Type",
        type: "select",
        options: [
          { label: "Asset", value: "Asset" },
          { label: "Liability", value: "Liability" },
          { label: "Equity", value: "Equity" },
          { label: "Revenue", value: "Revenue" },
          { label: "Expense", value: "Expense" },
        ],
      },
      { name: "accountGroup", label: "Account Group", type: "text" },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        disabledOnCreate: true,
      },
    ],
    schema: z.object({
      accountCode: z.string().optional(),
      accountName: z.string().min(1, "Name is required"),
      accountType: z.enum([
        "Asset",
        "Liability",
        "Equity",
        "Revenue",
        "Expense",
      ]),
      accountGroup: z.string().optional(),
      isActive: z.boolean().default(true),
    }),
  },
};
