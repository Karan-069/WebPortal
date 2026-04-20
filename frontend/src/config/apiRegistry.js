import { z } from "zod";

// ─── System Information section (reused across all masters) ─────────────────
const systemInfoSection = {
  title: "System Information",
  icon: "Database",
  fields: [
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      help: "Marking this inactive will hide the record from all picklists and selections.",
    },
    { name: "createdBy", label: "Created By", type: "text", disabled: true },
    { name: "createdAt", label: "Created Date", type: "text", disabled: true },
    { name: "updatedBy", label: "Updated By", type: "text", disabled: true },
    { name: "updatedAt", label: "Updated Date", type: "text", disabled: true },
  ],
};

export const apiRegistry = {
  department: {
    endpoint: "/departments",
    title: "Departments",
    singularTitle: "Department",
    icon: "building",
    idField: "_id",
    displayIdField: "deptCode",
    columns: [
      { header: "Code", accessor: "deptCode" },
      { header: "Description", accessor: "description" },
      { header: "Head", accessor: "departmentHead" },
      { header: "Location", accessor: "location" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
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
    formSections: [
      {
        title: "General Information",
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
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        deptCode: z.string().min(1, "Required").max(20),
        description: z.string().optional(),
        departmentHead: z.string().optional(),
        location: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  subsidary: {
    endpoint: "/subsidaries",
    title: "Subsidiaries",
    singularTitle: "Subsidiary",
    icon: "building",
    idField: "_id",
    displayIdField: "subCode",
    columns: [
      { header: "Code", accessor: "subCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "subCode", label: "Subsidiary Code", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "subCode",
            label: "Subsidiary Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        subCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  city: {
    endpoint: "/cities",
    title: "Cities",
    singularTitle: "City",
    icon: "mappin",
    idField: "_id",
    displayIdField: "cityCode",
    columns: [
      { header: "Code", accessor: "cityCode" },
      { header: "Description", accessor: "description" },
      { header: "State", accessor: "stateCode.description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "cityCode", label: "City Code", type: "text" },
      { name: "description", label: "Description", type: "text" },
      {
        name: "stateCode",
        label: "State",
        type: "asyncSelect",
        endpoint: "/states",
      },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "cityCode",
            label: "City Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
          {
            name: "stateCode",
            label: "State",
            type: "asyncSelect",
            endpoint: "/states",
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        cityCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        stateCode: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  state: {
    endpoint: "/states",
    title: "States",
    singularTitle: "State",
    icon: "globe",
    idField: "_id",
    displayIdField: "stateCode",
    columns: [
      { header: "Code", accessor: "stateCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "stateCode", label: "State Code", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "gstCode", label: "GST Code", type: "text" },
      { name: "region", label: "Region", type: "text" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "stateCode",
            label: "State Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
          { name: "gstCode", label: "GST Code", type: "text" },
          { name: "region", label: "Region", type: "text" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        stateCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        gstCode: z.string().optional(),
        region: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  location: {
    endpoint: "/locations",
    title: "Locations",
    singularTitle: "Location",
    icon: "mappin",
    idField: "_id",
    displayIdField: "locationCode",
    columns: [
      { header: "Code", accessor: "locationCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "locationCode", label: "Location Code", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "locationCode",
            label: "Location Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
          {
            name: "subsidary",
            label: "Subsidiary",
            type: "asyncSelect",
            endpoint: "/subsidaries",
          },
          { name: "address1", label: "Address Line 1", type: "text" },
          { name: "address2", label: "Address Line 2", type: "text" },
          { name: "zipCode", label: "Zip Code", type: "number" },
          {
            name: "city",
            label: "City",
            type: "asyncSelect",
            endpoint: "/cities",
          },
          {
            name: "state",
            label: "State",
            type: "asyncSelect",
            endpoint: "/states",
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        locationCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        subsidary: z.string().optional().nullable(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        zipCode: z.coerce.number().min(0).optional(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  uom: {
    endpoint: "/uoms",
    title: "Units of Measure",
    singularTitle: "UOM",
    icon: "calculator",
    idField: "_id",
    displayIdField: "uomCode",
    columns: [
      { header: "Code", accessor: "uomCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "uomCode", label: "UOM Code", type: "text" },
      { name: "description", label: "Description", type: "text" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "uomCode",
            label: "UOM Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        uomCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  vendor: {
    endpoint: "/vendors",
    title: "Vendor Master",
    singularTitle: "Vendor",
    icon: "user",
    idField: "_id",
    displayIdField: "vendorId",
    columns: [
      { header: "ID", accessor: "vendorId" },
      { header: "Name", accessor: "fullName" },
      { header: "Email", accessor: "emailId" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "emailId", label: "Email", type: "email" },
      { name: "panNo", label: "PAN No", type: "text" },
      { name: "currency", label: "Currency", type: "text" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "vendorId",
            label: "Vendor ID",
            type: "text",
            disabled: true,
          },
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
          },
          { name: "emailId", label: "Email", type: "email", required: true },
          { name: "panNo", label: "PAN No", type: "text" },
          { name: "currency", label: "Currency", type: "text" },
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
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        fullName: z.string().min(1, "Required"),
        emailId: z.string().email("Invalid email"),
        panNo: z.string().optional(),
        currency: z.string().optional(),
        registrationType: z.string().optional(),
        registrationNo: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  item: {
    endpoint: "/items",
    title: "Item Master",
    singularTitle: "Item",
    icon: "box",
    idField: "_id",
    displayIdField: "itemCode",
    columns: [
      { header: "Code", accessor: "itemCode" },
      { header: "Description", accessor: "description" },
      { header: "Category", accessor: "itemType" },
      { header: "Inv Type", accessor: "inventoryType" },
      { header: "Base Unit", accessor: "baseUnit.description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],

    formSections: [
      {
        title: "General Information",
        icon: "Info",
        fields: [
          {
            name: "itemCode",
            label: "Item Code",
            type: "text",
            placeholder: "Auto-generated",
          },
          {
            name: "description",
            label: "Item Description",
            type: "text",
            required: true,
          },
          {
            name: "shName",
            label: "Short Name",
            type: "text",
            required: true,
            help: "Internal display name used in search lists.",
          },
          {
            name: "itemType",
            label: "Item Category (Nature)",
            type: "select",
            options: [
              { label: "Goods", value: "goods" },
              { label: "Services", value: "services" },
              { label: "Capital Goods", value: "capitalGoods" },
            ],
            required: true,
            help: "Determines the GST treatment and stock handling.",
          },
          {
            name: "inventoryType",
            label: "Inventory / Detailed Type",
            type: "select",
            options: [
              {
                label: "Lot Numbered Inventory",
                value: "Lot Numbered Inventory",
              },
              { label: "Inventory", value: "Inventory" },
              { label: "Service for Purchase", value: "Service for Purchase" },
              { label: "Service for Sale", value: "Service for Sale" },
              {
                label: "Non-Inventory for Purchase",
                value: "Non-Inventory for Purchase",
              },
              {
                label: "Non-Inventory for Sale",
                value: "Non-Inventory for Sale",
              },
              { label: "Assembly", value: "Assembly" },
              {
                label: "Lot Numbered Assembly",
                value: "Lot Numbered Assembly",
              },
            ],
            help: "Internal detailed classification for reporting.",
          },
          {
            name: "canBeFulfilled",
            label: "Item Receipt (Can be Fulfilled)",
            type: "checkbox",
          },
          { name: "itemCategory", label: "Item Group", type: "text" },
          {
            name: "hsnCode",
            label: "HSN Code",
            type: "text",
            required: true,
            help: "Mandatory for GST Compliance.",
          },
          {
            name: "gstRate",
            label: "GST Rate (%)",
            type: "number",
            required: true,
          },
          { name: "lineOfBusiness", label: "Line of Business", type: "text" },
        ],
      },

      {
        title: "Units of Measure",
        icon: "Scale",
        fields: [
          {
            name: "baseUnit",
            label: "Base Unit",
            type: "asyncSelect",
            endpoint: "/uoms",
            labelFormat: "uomCode",
          },
          {
            name: "saleUnit",
            label: "Primary Sale Unit",
            type: "asyncSelect",
            endpoint: "/uoms",
            labelFormat: "uomCode",
          },
          {
            name: "purchaseUnit",
            label: "Primary Purchase Unit",
            type: "asyncSelect",
            endpoint: "/uoms",
            labelFormat: "uomCode",
          },
          {
            name: "consumptionUnit",
            label: "Primary Consumption Unit",
            type: "asyncSelect",
            endpoint: "/uoms",
            labelFormat: "uomCode",
          },
        ],
      },
      {
        title: "Pricing & Business Rules",
        icon: "DollarSign",
        fields: [
          {
            name: "pricingModel",
            label: "Pricing Model",
            type: "select",
            options: [
              { label: "FIFO", value: "FIFO" },
              { label: "LIFO", value: "LIFO" },
              { label: "Average", value: "Average" },
              { label: "Standard", value: "Standard" },
              { label: "COCO", value: "COCO" },
              { label: "FOFO", value: "FOFO" },
            ],
          },

          { name: "saleToCoco", label: "Transfer to COCO", type: "checkbox" },
          {
            name: "nonInvCoco",
            label: "Non-Inventory for COCO",
            type: "checkbox",
          },
          { name: "saleToFofo", label: "Sale to FOFO", type: "checkbox" },
        ],
      },
      {
        title: "Accounting Configuration",
        icon: "BookOpen",
        fields: [
          { name: "incomeAccount", label: "Income Account", type: "text" },
          { name: "expenseAccount", label: "Expense Account", type: "text" },
          { name: "assetAccount", label: "Asset Account", type: "text" },
          { name: "cogsAccount", label: "COGS Account", type: "text" },
          { name: "gainLossAccount", label: "Gain/Loss Account", type: "text" },
          {
            name: "priceVarianceAccount",
            label: "Price Variance Account",
            type: "text",
          },
          {
            name: "quantityVarianceAccount",
            label: "Quantity Variance Account",
            type: "text",
          },
          {
            name: "vendorReturnAccount",
            label: "Vendor Return Account",
            type: "text",
          },
          {
            name: "customerReturnAccount",
            label: "Customer Return Account",
            type: "text",
          },
          {
            name: "pricePurchaseVarianceAccount",
            label: "Price Purchase Variance Account",
            type: "text",
          },
        ],
      },
      {
        title: "Operational & Stock Control",
        icon: "Package",
        fields: [
          { name: "useBins", label: "Use Bins", type: "checkbox" },
          {
            name: "purchaseLeadTime",
            label: "Purchase Lead Time (Days)",
            type: "number",
          },
          {
            name: "safetyStockLevel",
            label: "Safety Stock Level",
            type: "number",
          },
        ],
      },
      {
        title: "System Information",
        icon: "Database",
        fields: [
          { name: "isActive", label: "Active", type: "checkbox" },
          {
            name: "createdBy",
            label: "Created By",
            type: "text",
            disabled: true,
          },
          {
            name: "createdAt",
            label: "Created Date",
            type: "text",
            disabled: true,
          },
          {
            name: "updatedBy",
            label: "Updated By",
            type: "text",
            disabled: true,
          },
          {
            name: "updatedAt",
            label: "Updated Date",
            type: "text",
            disabled: true,
          },
          {
            name: "approvedBy",
            label: "Approved By",
            type: "text",
            disabled: true,
          },
          {
            name: "approvedDate",
            label: "Approved Date",
            type: "text",
            disabled: true,
          },
        ],
      },
    ],
    schema: z
      .object({
        itemCode: z.string().optional(),
        description: z.string().min(1, "Required"),
        shName: z.string().min(1, "Required"),
        itemType: z.string().min(1, "Required"),
        inventoryType: z.string().optional().nullable(),
        gstRate: z.coerce.number().min(0, "Must be positive"),
        hsnCode: z.string().min(1, "Required"),
        baseUnit: z.string().optional().nullable(),
        saleUnit: z.string().optional().nullable(),
        purchaseUnit: z.string().optional().nullable(),
        consumptionUnit: z.string().optional().nullable(),
        pricingModel: z.string().optional(),
        isActive: z.boolean().default(true),
        canBeFulfilled: z.boolean().default(true),
        useBins: z.boolean().default(false),
        purchaseLeadTime: z.coerce.number().min(0).optional().default(0),
        safetyStockLevel: z.coerce.number().min(0).optional().default(0),
      })
      .passthrough(),
  },

  crterm: {
    endpoint: "/crterms",
    title: "Credit Terms",
    singularTitle: "Credit Term",
    icon: "creditcard",
    idField: "_id",
    displayIdField: "termCode",
    columns: [
      { header: "Code", accessor: "termCode" },
      { header: "Days", accessor: "days" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "termCode", label: "Term Code", type: "text" },
      { name: "days", label: "Days", type: "number" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "termCode",
            label: "Term Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
          { name: "days", label: "Days", type: "number" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        termCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        days: z.coerce.number().min(0).optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  assetCategory: {
    endpoint: "/asset-categories",
    title: "Asset Categories",
    singularTitle: "Asset Category",
    icon: "layers",
    idField: "_id",
    displayIdField: "catCode",
    columns: [
      { header: "Code", accessor: "catCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "catCode", label: "Category Code", type: "text" },
      { name: "description", label: "Description", type: "text" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "catCode",
            label: "Category Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        catCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  userRole: {
    endpoint: "/user-roles",
    title: "System Roles",
    singularTitle: "User Role",
    icon: "shield",
    idField: "_id",
    displayIdField: "roleCode",
    columns: [
      { header: "Role Code", accessor: "roleCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      {
        name: "roleCode",
        label: "Role Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "roleCode",
            label: "Role Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "description", label: "Description", type: "text" },
        ],
      },
      {
        title: "Menu Access Rights",
        fields: [
          {
            name: "menus",
            label: "Assigned Menus",
            type: "array",
            schema: {
              fields: [
                {
                  name: "menuId",
                  label: "App Menu",
                  type: "asyncSelect",
                  endpoint: "/app-menus",
                  labelFormat: (m) =>
                    m ? `${m.menuId} - ${m.description}` : "",
                },
                {
                  name: "permissions",
                  label: "Permissions",
                  type: "select",
                  multiple: true,
                  options: [
                    { label: "View", value: "view" },
                    { label: "Add", value: "add" },
                    { label: "Edit", value: "edit" },
                    { label: "Approve", value: "approve" },
                    { label: "Submit", value: "submit" },
                    { label: "All", value: "all" },
                  ],
                },
              ],
            },
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        roleCode: z.string().min(1, "Required"),
        description: z.string().min(1, "Required"),
        menus: z
          .array(
            z.object({
              menuId: z.any(),
              permissions: z
                .array(z.string())
                .min(1, "Select at least one permission"),
            }),
          )
          .optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  workflowRole: {
    endpoint: "/workflow-roles",
    title: "Workflow Roles",
    singularTitle: "W/F Role",
    icon: "shield",
    idField: "wfRoleCode",
    displayIdField: "wfRoleCode",
    columns: [
      { header: "Role Code", accessor: "wfRoleCode" },
      { header: "Description", accessor: "description" },
      { header: "Workflow", accessor: "wfRoleType" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      {
        name: "wfRoleCode",
        label: "Role Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "roleName", label: "Role Name", type: "text" },
      {
        name: "wfRoleType",
        label: "Workflow Type",
        type: "select",
        options: [
          { label: "Submit", value: "submit" },
          { label: "Approve", value: "approve" },
          { label: "Reject", value: "reject" },
          { label: "Delegate", value: "delegate" },
          { label: "Admin", value: "admin" },
        ],
      },
      { name: "description", label: "Description", type: "text" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "wfRoleCode",
            label: "Role Code",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "roleName", label: "Role Name", type: "text" },
          { name: "description", label: "Description", type: "text" },
          {
            name: "wfRoleType",
            label: "Workflow Type",
            type: "select",
            options: [
              { label: "Submit", value: "submit" },
              { label: "Approve", value: "approve" },
              { label: "Reject", value: "reject" },
              { label: "Delegate", value: "delegate" },
              { label: "Admin", value: "admin" },
            ],
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        wfRoleCode: z.string().min(1, "Required"),
        description: z.string().optional(),
        roleName: z.string().optional(),
        wfRoleType: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  asset: {
    endpoint: "/assets",
    title: "Physical Assets",
    singularTitle: "Asset",
    icon: "box",
    idField: "_id",
    displayIdField: "assetCode",
    columns: [
      { header: "Tag", accessor: "assetTag" },
      { header: "Name", accessor: "assetName" },
      { header: "Category", accessor: "assetCategory.description" },
      { header: "Location", accessor: "location.description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "assetTag", label: "Asset Tag", type: "text" },
      { name: "assetName", label: "Asset Name", type: "text" },
      {
        name: "assetCategory",
        label: "Category",
        type: "asyncSelect",
        endpoint: "/asset-categories",
      },
      {
        name: "location",
        label: "Location",
        type: "asyncSelect",
        endpoint: "/locations",
      },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          { name: "assetId", label: "Asset ID", type: "text", disabled: true },
          {
            name: "assetCode",
            label: "Asset Code",
            type: "text",
            disabledOnEdit: true,
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            required: true,
          },
          { name: "name", label: "Name", type: "text" },
          {
            name: "assetCategory",
            label: "Category",
            type: "asyncSelect",
            endpoint: "/asset-categories",
          },
          {
            name: "assetLocation",
            label: "Location",
            type: "asyncSelect",
            endpoint: "/locations",
          },
        ],
      },
      {
        title: "Details",
        fields: [
          { name: "make", label: "Make", type: "text" },
          { name: "model", label: "Model", type: "text" },
          { name: "serial", label: "Serial", type: "text" },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiry", label: "Warranty Expiry", type: "date" },
          { name: "assignedUser", label: "Assigned User", type: "text" },
          {
            name: "condition",
            label: "Condition",
            type: "select",
            options: [
              { label: "Good", value: "Good" },
              { label: "Faulty", value: "Faulty" },
            ],
          },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        assetCode: z.string().min(1, "Required"),
        description: z.string().min(1, "Required"),
        name: z.string().optional(),
        assetCategory: z.string().optional().nullable(),
        assetLocation: z.string().optional().nullable(),
        make: z.string().optional(),
        model: z.string().optional(),
        serial: z.string().optional(),
        condition: z.string().optional(),
        remarks: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  workflow: {
    endpoint: "/workflows",
    title: "Workflows",
    singularTitle: "Workflow",
    icon: "gauge",
    idField: "workflowCode",
    displayIdField: "workflowCode",
    columns: [
      { header: "Code", accessor: "workflowCode" },
      { header: "Description", accessor: "description" },
      { header: "Module", accessor: "transactionType" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "workflowCode",
            label: "Workflow Code",
            type: "text",
            disabledOnEdit: true,
          },
          {
            name: "description",
            label: "Workflow Name",
            type: "text",
            required: true,
          },
          {
            name: "transactionType",
            label: "Module",
            type: "select",
            required: true,
            options: [
              { label: "Bill", value: "Bill" },
              { label: "Vendor", value: "Vendor" },
              { label: "Item", value: "Item" },
            ],
          },
          {
            name: "initiatorRole",
            label: "Initiator Role",
            type: "asyncSelect",
            endpoint: "/workflow-roles",
            labelFormat: "roleName",
            required: true,
          },
        ],
      },
      {
        title: "Workflow Stages",
        fields: [
          {
            name: "WorkflowStage",
            label: "Stages",
            type: "array",
            schema: {
              fields: [
                {
                  name: "stageNumber",
                  label: "No.",
                  type: "number",
                  required: true,
                },
                {
                  name: "stageName",
                  label: "Name",
                  type: "text",
                  required: true,
                },
                {
                  name: "stageApproverRole",
                  label: "Approver Role",
                  type: "asyncSelect",
                  endpoint: "/workflow-roles",
                  labelFormat: "roleName",
                },
                { name: "minAmount", label: "Min Amt", type: "number" },
                { name: "maxAmount", label: "Max Amt", type: "number" },
                {
                  name: "isNotificationOnly",
                  label: "Notify Only",
                  type: "checkbox",
                },
              ],
            },
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        description: z.string().min(1, "Workflow name is required"),
        transactionType: z.string().min(1, "Module is required"),
        initiatorRole: z.string().min(1, "Initiator role is required"),
        isActive: z.boolean().default(true),
        WorkflowStage: z
          .array(
            z.object({
              stageNumber: z.coerce
                .number()
                .min(1, "Stage number must be at least 1"),
              stageName: z.string().min(1, "Stage name is required"),
              stageApproverRole: z
                .string()
                .optional()
                .nullable()
                .or(z.literal("")),
              minAmount: z.coerce.number().min(0).optional(),
              maxAmount: z.coerce.number().min(0).optional(),
              isNotificationOnly: z.boolean().default(false),
            }),
          )
          .min(1, "At least one stage is required"),
      })
      .passthrough(),
  },

  workflowLog: {
    endpoint: "/workflow-logs",
    title: "Audit Logs",
    singularTitle: "Log Entry",
    icon: "spreadsheet",
    idField: "_id",
    columns: [
      {
        header: "Date",
        accessor: (item) => new Date(item.createdAt).toLocaleString(),
      },
      { header: "Module", accessor: "transactionModel" },
      { header: "Status", accessor: "StageStatus" },
      { header: "User", accessor: "userId.fullName" },
    ],
    formFields: [],
    formSections: [],
  },

  nextTransactionId: {
    endpoint: "/transaction-ids",
    title: "Sequences",
    singularTitle: "Sequence",
    icon: "spreadsheet",
    idField: "_id",
    displayIdField: "menuId",
    columns: [
      { header: "Module", accessor: "menuId" },
      { header: "Prefix", accessor: "prefix" },
      { header: "Next Value", accessor: "sequenceValue" },
    ],
    formFields: [
      { name: "prefix", label: "Prefix", type: "text" },
      { name: "sequenceValue", label: "Start From", type: "number" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "menuId",
            label: "Module ID",
            type: "text",
            disabledOnEdit: true,
          },
          { name: "prefix", label: "Prefix", type: "text" },
          { name: "sequenceValue", label: "Start From", type: "number" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        menuId: z.string().min(1, "Required"),
        prefix: z.string().optional(),
        sequenceValue: z.coerce.number().min(0).optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  bill: {
    endpoint: "/bills",
    title: "Bill Management",
    singularTitle: "Bill",
    icon: "receipt",
    idField: "_id",
    displayIdField: "transactionId",
    columns: [
      { header: "Trans ID", accessor: "transactionId" },
      { header: "Invoice No", accessor: "invoiceNo" },
      { header: "Vendor", accessor: "vendor.fullName" },
      { header: "Amount", accessor: "billTotalAmount" },
      {
        header: "Date",
        accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
      },
    ],
    formFields: [
      { name: "invoiceNo", label: "Invoice No", type: "text" },
      {
        name: "vendor",
        label: "Vendor",
        type: "asyncSelect",
        endpoint: "/vendors",
      },
      { name: "billTotalAmount", label: "Amount", type: "number" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "transactionId",
            label: "Transaction ID",
            type: "text",
            disabled: true,
          },
          {
            name: "invoiceNo",
            label: "Invoice No",
            type: "text",
            required: true,
          },
          {
            name: "vendor",
            label: "Vendor",
            type: "asyncSelect",
            endpoint: "/vendors",
          },
          { name: "billTotalAmount", label: "Amount", type: "number" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        invoiceNo: z.string().min(1, "Required"),
        vendor: z.string().optional().nullable(),
        billTotalAmount: z.coerce.number().min(0).optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  client: {
    endpoint: "/clients",
    title: "Clients",
    singularTitle: "Client",
    icon: "building",
    idField: "_id",
    displayIdField: "clientCode",
    columns: [
      { header: "Code", accessor: "clientCode" },
      { header: "Name", accessor: "name" },
      { header: "Subdomain", accessor: "slug" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "name", label: "Company Name", type: "text" },
      { name: "slug", label: "Tenant Subdomain", type: "text" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          { name: "name", label: "Company Name", type: "text", required: true },
          {
            name: "slug",
            label: "Tenant Subdomain",
            type: "text",
            required: true,
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        name: z.string().min(1, "Required"),
        slug: z.string().min(1, "Required"),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  license: {
    endpoint: "/licenses",
    title: "Licenses",
    singularTitle: "License",
    icon: "gauge",
    idField: "_id",
    displayIdField: "licenseCode",
    columns: [
      { header: "Code", accessor: "licenseCode" },
      { header: "Client", accessor: "clientId.name" },
      { header: "Type", accessor: "licenseType" },
      { header: "Max Users", accessor: "maxUsers" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      {
        name: "clientId",
        label: "Client",
        type: "asyncSelect",
        endpoint: "/clients",
      },
      {
        name: "licenseType",
        label: "Type",
        type: "select",
        options: [
          { label: "Trial", value: "trial" },
          { label: "Standard", value: "standard" },
        ],
      },
      { name: "maxUsers", label: "User Limit", type: "number" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "clientId",
            label: "Client",
            type: "asyncSelect",
            endpoint: "/clients",
          },
          {
            name: "licenseType",
            label: "Type",
            type: "select",
            options: [
              { label: "Trial", value: "trial" },
              { label: "Standard", value: "standard" },
            ],
          },
          { name: "maxUsers", label: "User Limit", type: "number" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        clientId: z.string().optional().nullable(),
        licenseType: z.string().optional(),
        maxUsers: z.coerce.number().min(0).optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  settings: {
    endpoint: "/settings",
    title: "Global Settings",
    singularTitle: "Settings",
    icon: "gauge",
    idField: "_id",
    columns: [
      { header: "Client", accessor: "clientId.name" },
      { header: "Maintenance", accessor: "isMaintenanceMode", type: "boolean" },
    ],
    formFields: [
      {
        name: "isMaintenanceMode",
        label: "Maintenance Mode",
        type: "checkbox",
      },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "isMaintenanceMode",
            label: "Maintenance Mode",
            type: "checkbox",
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        isMaintenanceMode: z.boolean().default(false),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  emailTemplate: {
    endpoint: "/email-templates",
    title: "Email Templates",
    singularTitle: "Template",
    icon: "spreadsheet",
    idField: "_id",
    displayIdField: "templateCode",
    columns: [
      { header: "Code", accessor: "templateCode" },
      { header: "Template Name", accessor: "templateName" },
      { header: "Subject", accessor: "subject" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      { name: "templateName", label: "Template Name", type: "text" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "body", label: "Body (HTML)", type: "textarea" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "templateName",
            label: "Template Name",
            type: "text",
            required: true,
          },
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "htmlBody", label: "Body (HTML)", type: "textarea" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        templateName: z.string().min(1, "Required"),
        subject: z.string().min(1, "Required"),
        htmlBody: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  user: {
    endpoint: "/users",
    title: "User Management",
    singularTitle: "User",
    icon: "user",
    idField: "_id",
    displayIdField: "fullName",
    columns: [
      { header: "Full Name", accessor: "fullName" },
      { header: "Email", accessor: "email" },
      { header: "Role", accessor: "userRole.description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formSections: [
      {
        title: "User Details",
        fields: [
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
          },
          {
            name: "email",
            label: "Email Address",
            type: "email",
            required: true,
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
            disabledOnEdit: true,
          },
          {
            name: "userRole",
            label: "Default System Role",
            type: "asyncSelect",
            endpoint: "/user-roles",
          },
          {
            name: "workflowRole",
            label: "Default Workflow Role",
            type: "asyncSelect",
            endpoint: "/workflow-roles",
          },
          {
            name: "department",
            label: "Department",
            type: "asyncSelect",
            endpoint: "/departments",
          },
        ],
      },
      {
        title: "Assigned Role Mappings",
        fields: [
          {
            name: "roleAssignments",
            label: "Role Pairings",
            type: "array", // This is a conceptual field for future UI management
            fields: [
              {
                name: "userRole",
                label: "User Role",
                type: "asyncSelect",
                endpoint: "/user-roles",
              },
              {
                name: "workflowRole",
                label: "Workflow Role",
                type: "asyncSelect",
                endpoint: "/workflow-roles",
              },
            ],
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        fullName: z.string().min(1, "Required"),
        email: z.string().email("Invalid Email"),
        password: z.string().min(1, "Required").optional(),
        userRole: z.string().min(1, "Required"), // Used for defaultRoleAssignment.userRole
        workflowRole: z.string().min(1, "Required"), // Used for defaultRoleAssignment.workflowRole
        department: z.string().min(1, "Required"),
        roleAssignments: z
          .array(
            z.object({
              userRole: z.string(),
              workflowRole: z.string(),
            }),
          )
          .optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  vendorInvite: {
    endpoint: "/vendor-invites",
    title: "Vendor Invites",
    singularTitle: "Invite",
    icon: "user",
    idField: "_id",
    displayIdField: "inviteNo",
    columns: [
      { header: "Invite No", accessor: "inviteNo" },
      { header: "Company Name", accessor: "companyName" },
      { header: "Email", accessor: "email" },
      { header: "Status", accessor: "status" },
      { header: "Invited By", accessor: "invitedBy.fullName" },
    ],
    formFields: [
      { name: "companyName", label: "Company Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "panNo", label: "PAN No", type: "text" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "companyName",
            label: "Company Name",
            type: "text",
            required: true,
          },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "panNo", label: "PAN No", type: "text" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        companyName: z.string().min(1, "Required"),
        email: z.string().email("Invalid email"),
        panNo: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  feature: {
    endpoint: "/features",
    title: "Feature Flags",
    singularTitle: "Feature",
    icon: "gauge",
    idField: "_id",
    displayIdField: "name",
    columns: [
      { header: "Feature Name", accessor: "name" },
      { header: "Enabled", accessor: "isEnabled", type: "boolean" },
    ],
    formFields: [
      { name: "name", label: "Feature Name", type: "text" },
      { name: "isEnabled", label: "Enabled", type: "checkbox" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          { name: "name", label: "Feature Name", type: "text", required: true },
          { name: "isEnabled", label: "Enabled", type: "checkbox" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        name: z.string().min(1, "Required"),
        isEnabled: z.boolean().default(false),
      })
      .passthrough(),
  },

  lineOfBusiness: {
    endpoint: "/line-of-businesses",
    title: "Lines of Business",
    singularTitle: "LOB",
    icon: "briefcase",
    idField: "_id",
    displayIdField: "lobCode",
    columns: [
      { header: "Code", accessor: "lobCode" },
      { header: "Description", accessor: "description" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
      {
        name: "lobCode",
        label: "LOB Code",
        type: "text",
        disabledOnEdit: true,
      },
      { name: "description", label: "Description", type: "text" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "lobCode",
            label: "LOB Code",
            type: "text",
            disabledOnEdit: true,
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            required: true,
          },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        lobCode: z.string().optional(),
        description: z.string().min(1, "Required"),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },

  chartOfAccounts: {
    endpoint: "/chart-of-accounts",
    title: "Chart of Accounts",
    singularTitle: "COA",
    icon: "account_balance",
    idField: "_id",
    displayIdField: "accountCode",
    columns: [
      { header: "Code", accessor: "accountCode" },
      { header: "Name", accessor: "accountName" },
      { header: "Type", accessor: "accountType" },
      { header: "Group", accessor: "accountGroup" },
      { header: "Active", accessor: "isActive", type: "boolean" },
    ],
    formFields: [
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
    ],
    formSections: [
      {
        title: "General Information",
        fields: [
          {
            name: "accountCode",
            label: "Account Code",
            type: "text",
            disabledOnEdit: true,
          },
          {
            name: "accountName",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "accountType",
            label: "Account Type",
            type: "select",
            required: true,
          },
          { name: "accountGroup", label: "Account Group", type: "text" },
        ],
      },
      systemInfoSection,
    ],
    schema: z
      .object({
        accountCode: z.string().optional(),
        accountName: z.string().min(1, "Required"),
        accountType: z.enum([
          "Asset",
          "Liability",
          "Equity",
          "Revenue",
          "Expense",
        ]),
        accountGroup: z.string().optional(),
        isActive: z.boolean().default(true),
      })
      .passthrough(),
  },
};
