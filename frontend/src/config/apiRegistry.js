import { z } from 'zod';

// Helper schema to allow either a string ID or a populated object for lookups (AsyncSelect)
const lookupSchema = z.union([
  z.string(),
  z.object({ _id: z.string() }).passthrough()
]).optional().nullable();

// ─── System Information section (reused across all masters) ─────────────────
const systemInfoSection = {
  title: "System Information",
  icon: "Database",
  fields: [
    { name: 'isActive', label: 'Active', type: 'checkbox', help: "Marking this inactive will hide the record from all picklists and selections." },
    { name: "createdBy", label: "Created By", type: "text", disabled: true },
    { name: "createdAt", label: "Created Date", type: "text", disabled: true },
    { name: "updatedBy", label: "Updated By", type: "text", disabled: true },
    { name: "updatedAt", label: "Updated Date", type: "text", disabled: true },
  ]
};

export const apiRegistry = {
  department: {
    endpoint: '/departments',
    title: 'Departments',
    singularTitle: 'Department',
    icon: 'building',
    featureFlags: { workflow: 'WF_DEPARTMENT', autoId: 'AUTOID_DEPARTMENT' },
    idField: '_id',
    displayIdField: 'deptCode',
    columns: [
      { header: 'Code', accessor: 'deptCode', minWidth: 100, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 200 },
      { header: 'Head', accessor: 'departmentHead.fullName', minWidth: 150 },
      { header: 'Location', accessor: 'location.description', minWidth: 150 },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' }
    ],
    formFields: [
      { name: 'deptCode', label: 'Department Code', type: 'text', disabledOnEdit: true },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'departmentHead', label: 'Department Head', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox', disabledOnCreate: true }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'deptCode', label: 'Department Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'departmentHead', label: 'Department Head', type: 'asyncSelect', endpoint: '/users' },
          { name: 'location', label: 'Location', type: 'asyncSelect', endpoint: '/locations' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      deptCode: z.string().optional(),
      description: z.string().optional(),
      departmentHead: lookupSchema,
      location: lookupSchema,
      isActive: z.boolean().default(true)
    }).passthrough()
  },
  
  subsidary: {
    endpoint: '/subsidaries',
    title: 'Subsidiaries',
    singularTitle: 'Subsidiary',
    icon: 'building',
    featureFlags: { workflow: 'WF_SUBSIDARY', autoId: 'AUTOID_SUBSIDARY' },
    idField: '_id',
    displayIdField: 'subCode',
    columns: [
      { header: 'Code', accessor: 'subCode', minWidth: 100, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 250 },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' }
    ],
    formFields: [
      { name: 'subCode', label: 'Subsidiary Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'subCode', label: 'Subsidiary Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'zipCode', label: 'Zip Code', type: 'number', maxLength: 6 },
          { name: 'city', label: 'City', type: 'asyncSelect', endpoint: '/cities' },
          { name: 'state', label: 'State', type: 'asyncSelect', endpoint: '/states' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      subCode: z.string().optional(),
      description: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
      zipCode: z.coerce.number().max(999999, 'Max 6 digits').optional(),
      city: lookupSchema,
      state: lookupSchema,
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  city: {
    endpoint: '/cities',
    title: 'Cities',
    singularTitle: 'City',
    icon: 'mappin',
    idField: '_id',
    displayIdField: 'cityCode',
    columns: [
      { header: 'City Code', accessor: 'cityCode', minWidth: 100, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 180 },
      { header: 'State', accessor: 'stateCode.description', minWidth: 140, className: 'text-slate-500' },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'cityCode', label: 'City Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'stateCode', label: 'State', type: 'asyncSelect', endpoint: '/states' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'cityCode', label: 'City Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'stateCode', label: 'State', type: 'asyncSelect', endpoint: '/states' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      cityCode: z.string().min(1, 'Required'),
      description: z.string().optional(),
      stateCode: lookupSchema,
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  state: {
    endpoint: '/states',
    title: 'States',
    singularTitle: 'State',
    icon: 'globe',
    idField: '_id',
    displayIdField: 'stateCode',
    columns: [
      { header: 'State Code', accessor: 'stateCode', minWidth: 100, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 180 },
      { header: 'GST Code', accessor: 'gstCode', minWidth: 100, className: 'font-mono text-[10px] font-bold text-slate-500' },
      { header: 'Region', accessor: 'region', minWidth: 120 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'stateCode', label: 'State Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'gstCode', label: 'GST Code', type: 'text' },
      { name: 'region', label: 'Region', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }

    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'stateCode', label: 'State Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'gstCode', label: 'GST Code', type: 'text' },
          { name: 'region', label: 'Region', type: 'text' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      stateCode: z.string().min(1, 'Required'),
      description: z.string().optional(),
      gstCode: z.string().optional(),
      region: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  location: {
    endpoint: '/locations',
    title: 'Locations',
    singularTitle: 'Location',
    icon: 'mappin',
    featureFlags: { workflow: 'WF_LOCATION', autoId: 'AUTOID_LOCATION' },
    idField: '_id',
    displayIdField: 'locationCode',
    columns: [
      { header: 'Location Code', accessor: 'locationCode', minWidth: 120, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 200 },
      { header: 'Subsidiary', accessor: 'subsidary.description', minWidth: 180, className: 'text-[10px] font-bold uppercase tracking-wider text-slate-500' },
      { header: 'City', accessor: 'city.description', minWidth: 120 },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' }
    ],
    formFields: [
      { name: 'locationCode', label: 'Location Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'locationCode', label: 'Location Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'subsidary', label: 'Subsidiary', type: 'asyncSelect', endpoint: '/subsidaries' },
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'zipCode', label: 'Zip Code', type: 'number', maxLength: 6 },
          { name: 'city', label: 'City', type: 'asyncSelect', endpoint: '/cities' },
          { name: 'state', label: 'State', type: 'asyncSelect', endpoint: '/states' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      locationCode: z.string().optional(),
      description: z.string().optional(),
      subsidary: lookupSchema,
      address1: z.string().optional(),
      address2: z.string().optional(),
      zipCode: z.coerce.number().max(999999, 'Max 6 digits').optional(),
      city: lookupSchema,
      state: lookupSchema,
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  uom: {
    endpoint: '/uoms',
    title: 'Units of Measure',
    singularTitle: 'UOM',
    icon: 'calculator',
    idField: '_id',
    displayIdField: 'uomCode',
    featureFlags: { workflow: 'WF_UOM', autoId: 'AUTOID_UOM' },
    columns: [
      { header: 'UOM Code', accessor: 'uomCode', minWidth: 120, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 200 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'uomCode', label: 'UOM Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'uomCode', label: 'UOM Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      uomCode: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  vendor: {
    endpoint: '/vendors',
    title: 'Vendors',
    singularTitle: 'Vendor',
    icon: 'truck',
    featureFlags: { workflow: 'WF_VENDOR', autoId: 'AUTOID_VENDOR' },
    idField: '_id',
    displayIdField: 'vendorId',
    columns: [
      { header: 'ID', accessor: 'vendorId', minWidth: 100, className: 'font-mono font-bold text-slate-900' },
      { header: 'Name', accessor: 'fullName', minWidth: 220 },
      { header: 'Email', accessor: 'emailId', minWidth: 240, className: 'font-bold text-indigo-600' },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' }
    ],
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text' },
      { name: 'emailId', label: 'Email', type: 'email' },
      { name: 'panNo', label: 'PAN No', type: 'text' },
      { name: 'currency', label: 'Currency', type: 'text' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'vendorId', label: 'Vendor ID', type: 'text', disabled: true },
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'emailId', label: 'Email', type: 'email', required: true },
          { name: 'panNo', label: 'PAN No', type: 'text' },
          { name: 'currency', label: 'Currency', type: 'text' },
          { name: 'registrationType', label: 'Registration Type', type: 'searchableSelect', options: [
            {label:'Unregistered', value:'unregistered'}, {label:'Regular', value:'regular'},
            {label:'Composite Dealer', value:'compositeDealer'}, {label:'Overseas', value:'overseas'}, {label:'SEZ', value:'sez'}
          ] },
          { name: 'registrationNo', label: 'Registration No', type: 'text' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      fullName: z.string().min(1, 'Required'),
      emailId: z.string().email('Invalid email'),
      panNo: z.string().optional(),
      currency: z.string().optional(),
      registrationType: z.string().optional(),
      registrationNo: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  item: {
    endpoint: '/items',
    title: 'Item Master',
    singularTitle: 'Item',
    icon: 'box',
    idField: '_id',
    displayIdField: 'itemCode',
    featureFlags: { workflow: 'WF_ITEM', autoId: 'AUTOID_ITEM' },
    columns: [
      { header: 'Item Code', accessor: 'itemCode', minWidth: 120, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 300 },
      { header: 'Category', accessor: 'itemType', minWidth: 120, className: 'text-[10px] font-bold uppercase text-slate-400' },
      { header: 'Inv Type', accessor: 'inventoryType', minWidth: 150, className: 'text-[11px] text-slate-500' },
      { header: 'Base Unit', accessor: 'baseUnit.description', minWidth: 100 },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' }
    ],

    formSections: [
      {
        title: 'General Information',
        icon: 'Info',
        fields: [
          { name: 'itemCode', label: 'Item Code', type: 'text' },
          { name: 'description', label: 'Item Description', type: 'text', required: true },
          { name: 'shName', label: 'Short Name', type: 'text', required: true, help: "Internal display name used in search lists." },
          { name: 'itemType', label: 'Item Category (Nature)', type: 'searchableSelect', options: [
            {label:'Goods', value:'goods'}, 
            {label:'Services', value:'services'}, 
            {label:'Capital Goods', value:'capitalGoods'}
          ], required: true, help: "Determines the GST treatment and stock handling." },
          { name: 'inventoryType', label: 'Inventory / Detailed Type', type: 'searchableSelect', options: [
            {label:'Lot Numbered Inventory', value:'Lot Numbered Inventory'}, 
            {label:'Inventory', value:'Inventory'}, 
            {label:'Service for Purchase', value:'Service for Purchase'}, 
            {label:'Service for Sale', value:'Service for Sale'}, 
            {label:'Non-Inventory for Purchase', value:'Non-Inventory for Purchase'}, 
            {label:'Non-Inventory for Sale', value:'Non-Inventory for Sale'}, 
            {label:'Assembly', value:'Assembly'}, 
            {label:'Lot Numbered Assembly', value:'Lot Numbered Assembly'}
          ], help: "Internal detailed classification for reporting." },
          { name: 'canBeFulfilled', label: 'Item Receipt (Can be Fulfilled)', type: 'checkbox' },
          { name: 'itemCategory', label: 'Item Group', type: 'text' },
          { name: 'hsnCode', label: 'HSN Code', type: 'text', required: true, help: "Mandatory for GST Compliance." },
          { name: 'gstRate', label: 'GST Rate (%)', type: 'number', required: true },
          { name: 'lineOfBusiness', label: 'Line of Business', type: 'asyncSelect', endpoint: '/line-of-businesses', labelFormat: 'lobCode' }
        ]
      },

      {
        title: 'Units of Measure',
        icon: 'Scale',
        fields: [
          { name: 'baseUnit', label: 'Base Unit', type: 'asyncSelect', endpoint: '/uoms', labelFormat: 'uomCode' },
          { name: 'saleUnit', label: 'Primary Sale Unit', type: 'asyncSelect', endpoint: '/uoms', labelFormat: 'uomCode' },
          { name: 'purchaseUnit', label: 'Primary Purchase Unit', type: 'asyncSelect', endpoint: '/uoms', labelFormat: 'uomCode' },
          { name: 'consumptionUnit', label: 'Primary Consumption Unit', type: 'asyncSelect', endpoint: '/uoms', labelFormat: 'uomCode' }
        ]
      },
      {
        title: 'Pricing & Business Rules',
        icon: 'DollarSign',
        fields: [
          { name: 'pricingModel', label: 'Pricing Model', type: 'searchableSelect', options: [
            {label:'FIFO', value:'FIFO'}, {label:'LIFO', value:'LIFO'}, {label:'Average', value:'Average'}, 
            {label:'Standard', value:'Standard'}, {label:'COCO', value:'COCO'}, {label:'FOFO', value:'FOFO'}
          ] },

          { name: 'saleToCoco', label: 'Transfer to COCO', type: 'checkbox' },
          { name: 'nonInvCoco', label: 'Non-Inventory for COCO', type: 'checkbox' },
          { name: 'saleToFofo', label: 'Sale to FOFO', type: 'checkbox' }
        ]
      },
      {
        title: 'Accounting Configuration',
        icon: 'BookOpen',
        fields: [
          { name: 'incomeAccount', label: 'Income Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'expenseAccount', label: 'Expense Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'assetAccount', label: 'Asset Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'cogsAccount', label: 'COGS Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'gainLossAccount', label: 'Gain/Loss Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'priceVarianceAccount', label: 'Price Variance Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'quantityVarianceAccount', label: 'Quantity Variance Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'vendorReturnAccount', label: 'Vendor Return  Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'customerReturnAccount', label: 'Customer Return Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' },
          { name: 'pricePurchaseVarianceAccount', label: 'Price Purchase Variance Account',type: 'asyncSelect', endpoint: '/chart-of-accounts', labelFormat: 'accountCode' }
        ]
      },
      {
        title: 'Operational & Stock Control',
        icon: 'Package',
        fields: [
          { name: 'useBins', label: 'Use Bins', type: 'checkbox' },
          { name: 'purchaseLeadTime', label: 'Purchase Lead Time (Days)', type: 'number' },
          { name: 'safetyStockLevel', label: 'Safety Stock Level', type: 'number' }
        ]
      },
      {
        title: "System Information",
        icon: 'Database',
        fields: [
          { name: 'isActive', label: 'Active', type: 'checkbox' },
          { name: "createdBy", label: "Created By", type: "text", disabled: true },
          { name: "createdAt", label: "Created Date", type: "text", disabled: true },
          { name: "updatedBy", label: "Updated By", type: "text", disabled: true },
          { name: "updatedAt", label: "Updated Date", type: "text", disabled: true },
          { name: "approvedBy", label: "Approved By", type: "text", disabled: true },
          { name: "approvedDate", label: "Approved Date", type: "text", disabled: true }
        ]
      }
    ],
    schema: z.object({
      itemCode: z.string().optional(),
      description: z.string().min(1, 'Required'),
      shName: z.string().min(1, 'Required'),
      itemType: z.string().min(1, 'Required'),
      inventoryType: z.string().optional().nullable(),
      gstRate: z.coerce.number().min(0, 'Must be positive'),
      hsnCode: z.string().min(1, 'Required'),
      baseUnit: lookupSchema,
      saleUnit: lookupSchema,
      purchaseUnit: lookupSchema,
      consumptionUnit: lookupSchema,
      incomeAccount: lookupSchema,
      expenseAccount: lookupSchema,
      assetAccount: lookupSchema,
      cogsAccount: lookupSchema,
      gainLossAccount: lookupSchema,
      priceVarianceAccount: lookupSchema,
      quantityVarianceAccount: lookupSchema,
      vendorReturnAccount: lookupSchema,
      customerReturnAccount: lookupSchema,
      pricePurchaseVarianceAccount: lookupSchema,
      lineOfBusiness: lookupSchema,
      pricingModel: z.string().optional(),
      isActive: z.boolean().default(true),
      canBeFulfilled: z.boolean().default(true),
      useBins: z.boolean().default(false),
      purchaseLeadTime: z.coerce.number().min(0).optional().default(0),
      safetyStockLevel: z.coerce.number().min(0).optional().default(0)
    }).passthrough()

  },


  crterm: {
    endpoint: '/crterms',
    title: 'Credit Terms',
    singularTitle: 'Credit Term',
    icon: 'creditcard',
    idField: '_id',
    displayIdField: 'termCode',
    featureFlags: { workflow: 'WF_CRTERM', autoId: 'AUTOID_CRTERM' },
    columns: [
      { header: 'Code', accessor: 'termCode' },
      { header: 'Days', accessor: 'days' },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'termCode', label: 'Term Code', type: 'text' },
      { name: 'days', label: 'Days', type: 'number' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'termCode', label: 'Term Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'days', label: 'Days', type: 'number' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      termCode: z.string().optional(),
      description: z.string().optional(),
      days: z.coerce.number().min(0).optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  assetCategory: {
    endpoint: '/asset-categories',
    title: 'Asset Categories',
    singularTitle: 'Asset Category',
    icon: 'layers',
    idField: '_id',
    displayIdField: 'catCode',
    featureFlags: { workflow: 'WF_ASSETCATEGORY', autoId: 'AUTOID_ASSETCATEGORY' },
    columns: [
      { header: 'Category Code', accessor: 'catCode', minWidth: 140, className: 'font-bold' },
      { header: 'Description', accessor: 'description', minWidth: 250 },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'catCode', label: 'Category Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'catCode', label: 'Category Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      catCode: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  userRole: {
    endpoint: '/user-roles',
    title: 'User Roles',
    singularTitle: 'User Role',
    icon: 'shield',
    idField: '_id',
    displayIdField: 'roleCode',
    featureFlags: { workflow: 'WF_USERROLE', autoId: 'AUTOID_USERROLE' },
    specializedManager: '/userRole',
    columns: [
      { header: 'Role Code', accessor: 'roleCode', minWidth: 140, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 250 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'roleCode', label: 'Role Code', type: 'text', disabledOnEdit: true },
      { name: 'description', label: 'Description', type: 'text' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'roleCode', label: 'Role Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text' },
        ]
      },
      {
        title: 'Menu Access Rights',
        fields: [
          {
            name: 'menus',
            label: 'Assigned Menus',
            type: 'array',
            schema: {
              fields: [
                { 
                  name: 'menuId', 
                  label: 'App Menu', 
                  type: 'asyncSelect', 
                  endpoint: '/app-menus/my-menus',
                  labelFormat: (m) => m ? `${m.menuId} - ${m.description}` : ''
                },
                { 
                  name: 'permissions', 
                  label: 'Permissions', 
                  type: 'select',
                  multiple: true,
                  options: [
                    { label: 'View', value: 'view' },
                    { label: 'Add', value: 'add' },
                    { label: 'Edit', value: 'edit' },
                    { label: 'Delete', value: 'delete' },
                    { label: 'All', value: 'all' }
                  ]
                }
              ]
            }
          }
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      roleCode: z.string().optional(),
      description: z.string().min(1, 'Required'),
      menus: z.array(z.object({
        menuId: lookupSchema,
        permissions: z.array(z.string()).min(1, 'Select at least one permission')
      })).optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  workflowRole: {
    endpoint: '/workflow-roles',
    title: 'Workflow Roles',
    singularTitle: 'W/F Role',
    icon: 'shield',
    idField: 'wfRoleCode',
    displayIdField: 'wfRoleCode',
    featureFlags: { workflow: 'WF_WORKFLOWROLE', autoId: 'AUTOID_WORKFLOWROLE' },
    specializedManager: '/workflowRole',
    columns: [
      { header: 'Role Code', accessor: 'wfRoleCode', minWidth: 140, className: 'font-mono font-bold text-slate-900' },
      { header: 'Role Name', accessor: 'roleName', minWidth: 200 },
      { header: 'Category', accessor: 'wfRoleType', minWidth: 120, className: 'uppercase font-bold text-xs' },
      { header: 'Delegate', accessor: 'canDelegate', type: 'boolean', minWidth: 100 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'wfRoleCode', label: 'Role Code', type: 'text', disabledOnEdit: true },
      { name: 'roleName', label: 'Role Name', type: 'text' },
      { name: 'wfRoleType', label: 'Role Category', type: 'select', options: [
        { label: 'Initiator (Submit only)', value: 'initiator' },
        { label: 'Approver (Approve & Reject)', value: 'approver' },
        { label: 'System Admin', value: 'admin' }
      ]},
      { name: 'canDelegate', label: 'Allow Delegation', type: 'checkbox' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'wfRoleCode', label: 'Role Code', type: 'text', disabledOnEdit: true },
          { name: 'roleName', label: 'Role Name', type: 'text' },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'wfRoleType', label: 'Role Category', type: 'select', options: [
            { label: 'Initiator (Submit only)', value: 'initiator' },
            { label: 'Approver (Approve & Reject)', value: 'approver' },
            { label: 'System Admin', value: 'admin' }
          ]},
          { name: 'canDelegate', label: 'Allow Delegation', type: 'checkbox' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      wfRoleCode: z.string().optional(),
      description: z.string().optional(),
      roleName: z.string().optional(),
      wfRoleType: z.string().min(1, 'Required'),
      canDelegate: z.boolean().default(false),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  asset: {
    endpoint: '/assets',
    title: 'Physical Assets',
    singularTitle: 'Asset',
    icon: 'box',
    idField: '_id',
    displayIdField: 'assetCode',
    columns: [
      { header: 'Asset Tag', accessor: 'assetTag', minWidth: 120, className: 'font-mono font-bold text-indigo-600' },
      { header: 'Asset Name', accessor: 'assetName', minWidth: 180 },
      { header: 'Serial No', accessor: 'serial', minWidth: 140, className: 'text-slate-500 font-medium' },
      { header: 'Category', accessor: 'assetCategory.description', minWidth: 150 },
      { header: 'Location', accessor: 'assetLocation.description', minWidth: 150 },
      { header: 'Assigned To', accessor: 'assignedUser.fullName', minWidth: 150, className: 'text-indigo-600/80 font-bold' },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'assetTag', label: 'Asset Tag', type: 'text' },
      { name: 'assetName', label: 'Asset Name', type: 'text' },
      { name: 'assetCategory', label: 'Category', type: 'asyncSelect', endpoint: '/asset-categories' },
      { name: 'location', label: 'Location', type: 'asyncSelect', endpoint: '/locations' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'assetId', label: 'Asset ID', type: 'text', disabled: true },
          { name: 'assetCode', label: 'Asset Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text', required: true },
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'assetCategory', label: 'Category', type: 'asyncSelect', endpoint: '/asset-categories' },
          { name: 'assetLocation', label: 'Location', type: 'asyncSelect', endpoint: '/locations' },
        ]
      },
      {
        title: 'Details',
        fields: [
          { name: 'make', label: 'Make', type: 'text' },
          { name: 'model', label: 'Model', type: 'text' },
          { name: 'serial', label: 'Serial', type: 'text' },
          { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
          { name: 'warrantyExpiry', label: 'Warranty Expiry', type: 'date' },
          { name: 'assignedUser', label: 'Assigned User', type: 'asyncSelect', endpoint: '/users' },
          { name: 'condition', label: 'Condition', type: 'select', options: [
            {label:'Good', value:'Good'}, {label:'Faulty', value:'Faulty'}
          ] },
          { name: 'remarks', label: 'Remarks', type: 'textarea' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      assetCode: z.string().min(1, 'Required'),
      description: z.string().min(1, 'Required'),
      name: z.string().optional(),
      assetCategory: lookupSchema,
      assetLocation: lookupSchema,
      make: z.string().optional(),
      model: z.string().optional(),
      serial: z.string().optional(),
      condition: z.string().optional(),
      remarks: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

workflow: {
  endpoint: '/workflows',
  title: 'Workflows',
  singularTitle: 'Workflow',
  icon: 'gauge',
  idField: 'workflowCode',
  displayIdField: 'workflowCode',
  specializedManager: '/workflow',
  columns: [
    { header: 'Workflow Code', accessor: 'workflowCode', minWidth: 140, className: 'font-mono font-bold text-slate-900' },
    { header: 'Workflow Name', accessor: 'description', minWidth: 250 },
    { header: 'Module Context', accessor: 'transactionType', minWidth: 140, className: 'text-[10px] font-bold uppercase tracking-wider text-slate-400' },
    { header: 'Version',     accessor: 'version', minWidth: 80, className: 'text-slate-500 font-mono' },
    { header: 'Active',      accessor: 'isActive', type: 'boolean', minWidth: 80 }
  ],
  formSections: [
    {
      title: 'General Information',
      fields: [
        { name: 'workflowCode',    label: 'Workflow Code',   type: 'text', disabledOnEdit: true },
        { name: 'version',         label: 'Version',         type: 'text', disabled: true },
        { name: 'amendmentNumber', label: 'Amendment No.',   type: 'text', disabled: true },
        { name: 'isLatest',        label: 'Is Latest?',      type: 'checkbox', disabled: true },
        { name: 'description',     label: 'Workflow Name',   type: 'text', required: true },
        { name: 'transactionType', label: 'Module',          type: 'searchableSelect', required: true,
          options: [
            { label: 'Bill',   value: 'Bill' },
            { label: 'Vendor', value: 'Vendor' },
            { label: 'Item',   value: 'Item' }
          ]
        },
        { name: 'initiatorRole', label: 'Initiator Role', type: 'asyncSelect', endpoint: '/workflow-roles', labelFormat: 'roleName', required: true },
      ]
    },
    {
      title: 'Workflow Stages',
      fields: [
        {
          name: 'WorkflowStage',
          label: 'Stages',
          type: 'array',
          schema: {
            fields: [
              { name: 'stageNumber',       label: 'No.',           type: 'number',      required: true },
              { name: 'stageName',         label: 'Name',          type: 'text',        required: true },
              { name: 'stageApproverRole', label: 'Approver Role', type: 'asyncSelect', endpoint: '/workflow-roles', labelFormat: 'roleName' },
              { name: 'minAmount',         label: 'Min Amt',       type: 'number' },
              { name: 'maxAmount',         label: 'Max Amt',       type: 'number' },
              { name: 'isNotificationOnly',label: 'Notify Only',   type: 'checkbox' }
            ]
          }
        }
      ]
    },
    systemInfoSection
    ],
    schema: z.object({
  description:     z.string().min(1, 'Workflow name is required'),
  transactionType: z.string().min(1, 'Module is required'),
  initiatorRole:   lookupSchema,
  isActive:        z.boolean().default(true),
  WorkflowStage: z.array(
    z.object({
      stageNumber:        z.coerce.number().min(1, 'Stage number must be at least 1'),
      stageName:          z.string().min(1, 'Stage name is required'),
      stageApproverRole:  lookupSchema,
      minAmount:          z.coerce.number().min(0).optional(),
      maxAmount:          z.coerce.number().min(0).optional(),
      isNotificationOnly: z.boolean().default(false),
    })
  ).min(1, 'At least one stage is required'),
}).passthrough()
  },

  workflowLog: {
    endpoint: '/workflow-logs',
    title: 'Workflow History',
    singularTitle: 'Log Entry',
    icon: 'spreadsheet',
    idField: '_id',
    columns: [
      { header: 'Date', accessor: (item) => new Date(item.createdAt).toLocaleString() },
      { header: 'Module', accessor: 'transactionModel' },
      { header: 'Status', accessor: 'StageStatus' },
      { header: 'User', accessor: 'userId.fullName' }
    ],
    formFields: [],
    formSections: []
  },

  nextTransactionId: {
    endpoint: '/transaction-ids',
    title: 'Sequences',
    singularTitle: 'Sequence',
    icon: 'spreadsheet',
    idField: '_id',
    displayIdField: 'menuId',
    columns: [
      { header: 'Module Context', accessor: 'menuId', minWidth: 160, className: 'font-bold uppercase tracking-wider text-slate-500 text-[10px]' },
      { header: 'Prefix', accessor: 'prefix', minWidth: 100, className: 'font-mono font-black text-indigo-600' },
      { header: 'Next Value', accessor: 'sequenceValue', minWidth: 120, className: 'text-right font-bold' }
    ],
    formFields: [
      { name: 'prefix', label: 'Prefix', type: 'text' },
      { name: 'sequenceValue', label: 'Start From', type: 'number' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'menuId', label: 'Module ID', type: 'text', disabledOnEdit: true },
          { name: 'prefix', label: 'Prefix', type: 'text' },
          { name: 'sequenceValue', label: 'Start From', type: 'number' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      menuId: z.string().min(1, 'Required'),
      prefix: z.string().optional(),
      sequenceValue: z.coerce.number().min(0).optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  auditLog: {
    endpoint: '/audit-logs',
    title: 'System Audit Logs',
    singularTitle: 'Audit Log',
    icon: 'clipboard-list',
    idField: '_id',
    displayIdField: '_id',
    columns: [
      { header: 'Time', accessor: (row) => new Date(row.timestamp).toLocaleString(), minWidth: 180, className: 'font-mono text-[11px]' },
      { header: 'Module', accessor: 'collectionName', minWidth: 140, className: 'uppercase tracking-tighter font-black text-slate-500' },
      { header: 'Action', accessor: 'action', minWidth: 100, className: 'font-bold text-indigo-600 uppercase' },
      { header: 'User', accessor: 'performedBy.fullName', minWidth: 150 },
      { header: 'Record ID', accessor: 'recordCode', minWidth: 140, className: 'font-mono font-bold text-slate-900' }
    ],
    formFields: [
      { name: 'timestamp', label: 'Timestamp', type: 'text', disabled: true },
      { name: 'collectionName', label: 'Collection', type: 'text', disabled: true },
      { name: 'action', label: 'Action', type: 'text', disabled: true },
      { name: 'performedBy', label: 'Performed By', type: 'text', disabled: true },
      { name: 'recordCode', label: 'Transaction Code/No', type: 'text', disabled: true }
    ],
    formSections: [
      {
        title: 'Audit Log Details',
        fields: [
          { name: 'timestamp', label: 'Timestamp', type: 'text', disabled: true },
          { name: 'collectionName', label: 'Collection', type: 'text', disabled: true },
          { name: 'action', label: 'Action', type: 'text', disabled: true },
          { name: 'performedBy', label: 'Performed By', type: 'text', disabled: true },
          { name: 'recordCode', label: 'Transaction Code/No', type: 'text', disabled: true }
        ]
      },
      {
        title: 'Field Level Changes',
        fields: [
          {
            name: 'changes',
            label: 'Changes',
            type: 'array',
            schema: {
              fields: [
                { name: 'field', label: 'Field Name', type: 'text', disabled: true },
                { name: 'oldDisplayValue', label: 'Old Value', type: 'text', disabled: true },
                { name: 'newDisplayValue', label: 'New Value', type: 'text', disabled: true }
              ]
            }
          }
        ]
      }
    ]
  },

  emailLog: {
    endpoint: '/email-logs',
    title: 'Email Trigger History',
    singularTitle: 'Email Log',
    icon: 'mail',
    idField: '_id',
    displayIdField: '_id',
    columns: [
      { header: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleString(), minWidth: 180, className: 'font-mono text-[11px]' },
      { header: 'Recipient', accessor: 'recipient', minWidth: 200, className: 'text-indigo-600 font-bold' },
      { header: 'Event', accessor: 'eventName', minWidth: 150, className: 'uppercase font-black text-[10px] text-slate-500' },
      { header: 'Subject', accessor: 'subject', minWidth: 250 },
      { header: 'Status', accessor: 'status', minWidth: 100, type: 'badge' }
    ],
    formSections: [
      {
        title: 'Email Details',
        fields: [
          { name: 'createdAt', label: 'Triggered At', type: 'text', disabled: true },
          { name: 'eventName', label: 'Event Identifier', type: 'text', disabled: true },
          { name: 'recipient', label: 'To', type: 'text', disabled: true },
          { name: 'cc', label: 'CC', type: 'text', disabled: true },
          { name: 'subject', label: 'Subject', type: 'text', disabled: true },
          { name: 'status', label: 'Status', type: 'text', disabled: true },
          { name: 'errorMessage', label: 'Error (if failed)', type: 'textarea', disabled: true, showIf: { field: 'status', value: 'failed', operator: 'eq' } },
        ]
      },
      {
        title: 'Email Content',
        fields: [
          { name: 'body', label: 'HTML Body', type: 'textarea', disabled: true }
        ]
      }
    ]
  },

  bill: {
    endpoint: '/bills',
    title: 'Bill Management',
    singularTitle: 'Bill',
    icon: 'receipt',
    idField: '_id',
    displayIdField: 'transactionId',
    featureFlags: { workflow: 'WF_BILL', autoId: 'AUTOID_BILL' },
    isTransaction: true,
    columns: [
      { header: 'Trans ID', accessor: 'transactionId', minWidth: 120, className: 'font-mono font-bold text-slate-900' },
      { header: 'Invoice No', accessor: 'invoiceNo', minWidth: 120 },
      { header: 'Vendor', accessor: 'vendor.fullName', minWidth: 200, className: 'font-bold text-indigo-600' },
      { header: 'Amount', accessor: 'billTotalAmount', minWidth: 100, className: 'font-bold text-right' },
      { header: 'Status', accessor: 'workflowStatus', minWidth: 120, type: 'badge' },
      { header: 'Stage', accessor: 'currentStageName', minWidth: 120, type: 'badge' }
    ],
    formFields: [
      { name: 'invoiceNo', label: 'Invoice No', type: 'text' },
      { name: 'vendor', label: 'Vendor', type: 'asyncSelect', endpoint: '/vendors' },
      { name: 'billTotalAmount', label: 'Amount', type: 'number' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'transactionId', label: 'Transaction ID', type: 'text', disabled: true },
          { name: 'invoiceNo', label: 'Invoice No', type: 'text', required: true },
          { name: 'vendor', label: 'Vendor', type: 'asyncSelect', endpoint: '/vendors' },
          { name: 'billTotalAmount', label: 'Amount', type: 'number' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      invoiceNo: z.string().min(1, 'Required'),
      vendor: lookupSchema,
      billTotalAmount: z.coerce.number().min(0).optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  client: {
    endpoint: '/clients',
    title: 'Clients',
    singularTitle: 'Client',
    icon: 'building',
    idField: '_id',
    displayIdField: 'clientCode',
    featureFlags: { autoId: 'AUTOID_CLIENT' },
    columns: [
      { header: 'Code', accessor: 'clientCode' },
      { header: 'Name', accessor: 'name' },
      { header: 'Subdomain', accessor: 'slug' },
      { header: 'DB Name', accessor: 'dbName' },
      { header: 'Active', accessor: 'isActive', type: 'boolean' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'clientCode', label: 'Client Code', type: 'text', disabledOnEdit: true },
          { name: 'name', label: 'Company Name', type: 'text', required: true },
          { name: 'slug', label: 'Tenant Subdomain', type: 'text', required: true },
          { name: 'dbName', label: 'Database Name', type: 'text', required: true },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      clientCode: z.string().optional(),
      name: z.string().min(1, 'Required'),
      slug: z.string().min(1, 'Required'),
      dbName: z.string().min(1, 'Required'),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  license: {
    endpoint: '/licenses',
    title: 'Licenses',
    singularTitle: 'License',
    icon: 'gauge',
    idField: '_id',
    displayIdField: 'licenseCode',
    columns: [
      { header: 'Code', accessor: 'licenseCode' },
      { header: 'Client', accessor: 'clientId.name' },
      { header: 'Type', accessor: 'licenseType' },
      { header: 'Expiry', accessor: 'expiryDate', type: 'date' },
      { header: 'Core Users', accessor: 'maxCoreUsers', className: 'text-right font-bold' },
      { header: 'Vendors', accessor: 'maxVendorUsers', className: 'text-right font-bold' },
      { header: 'Active', accessor: 'isActive', type: 'boolean' }
    ],
    formFields: [
      { name: 'clientId', label: 'Client', type: 'asyncSelect', endpoint: '/clients' },
      { name: 'licenseType', label: 'Type', type: 'select', options: [{label:'Trial', value:'trial'}, {label:'Standard', value:'standard'}, {label:'Pro', value:'pro'}, {label:'Enterprise', value:'enterprise'}] },
      { name: 'expiryDate', label: 'Expiration Date', type: 'date' },
      { name: 'maxCoreUsers', label: 'Core User Limit', type: 'number' },
      { name: 'maxVendorUsers', label: 'Vendor Partner Limit', type: 'number' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'clientId', label: 'Client', type: 'asyncSelect', endpoint: '/clients' },
          { name: 'licenseType', label: 'Type', type: 'select', options: [{label:'Trial', value:'trial'}, {label:'Standard', value:'standard'}, {label:'Pro', value:'pro'}, {label:'Enterprise', value:'enterprise'}] },
          { name: 'expiryDate', label: 'Expiration Date', type: 'date' },
          { name: 'maxCoreUsers', label: 'Core User Limit', type: 'number' },
          { name: 'maxVendorUsers', label: 'Vendor Partner Limit', type: 'number' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      clientId: lookupSchema,
      licenseType: z.string().optional(),
      expiryDate: z.string().or(z.date()).optional(),
      maxCoreUsers: z.coerce.number().min(0).optional(),
      maxVendorUsers: z.coerce.number().min(0).optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  settings: {
    endpoint: '/settings',
    title: 'Global Settings',
    singularTitle: 'Settings',
    icon: 'gauge',
    idField: '_id',
    columns: [
      { header: 'Client', accessor: 'clientId.name' },
      { header: 'Maintenance', accessor: 'isMaintenanceMode', type: 'boolean' }
    ],
    formFields: [
      { name: 'isMaintenanceMode', label: 'Maintenance Mode', type: 'checkbox' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'isMaintenanceMode', label: 'Maintenance Mode', type: 'checkbox' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      isMaintenanceMode: z.boolean().default(false),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  emailTemplate: {
    endpoint: '/email-templates',
    title: 'Email Templates',
    singularTitle: 'Template',
    icon: 'spreadsheet',
    idField: '_id',
    displayIdField: 'templateCode',
    columns: [
      { header: 'Code', accessor: 'templateCode' },
      { header: 'Template Name', accessor: 'templateName' },
      { header: 'Subject', accessor: 'subject' },
      { header: 'Active', accessor: 'isActive', type: 'boolean' }
    ],
    formFields: [
      { name: 'templateName', label: 'Template Name', type: 'text' },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'body', label: 'Body (HTML)', type: 'textarea' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'templateName', label: 'Template Name', type: 'text', required: true },
          { name: 'subject', label: 'Subject', type: 'text', required: true },
          { name: 'htmlBody', label: 'Body (HTML)', type: 'textarea' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      templateName: z.string().min(1, 'Required'),
      subject: z.string().min(1, 'Required'),
      htmlBody: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  user: {
    endpoint: '/users',
    title: 'Users',
    singularTitle: 'User',
    icon: 'users',
    featureFlags: { workflow: 'WF_USER', autoId: 'AUTOID_USER' },
    idField: '_id',
    displayIdField: 'userCode',
    columns: [
      { header: 'Full Name', accessor: 'fullName', minWidth: 180 },
      { header: 'Email', accessor: 'email', minWidth: 240, className: 'font-bold text-indigo-600' },
      { header: 'System Role', accessor: 'userRole.description', minWidth: 160 },
      { header: 'Department', accessor: 'department.deptCode', minWidth: 100, className: 'text-[10px] font-bold uppercase tracking-wider text-slate-400' },
      { header: 'W/F Role', accessor: 'workflowRole.roleName', minWidth: 160 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formSections: [
      {
        title: 'User Details',
        fields: [
          { name: 'userCode', label: 'User Code', type: 'text', disabledOnEdit: true, disabledOnCreate: true },
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true, disabledOnEdit: true },
          { name: 'password', label: 'Password', type: 'password', required: true, disabledOnEdit: true },
          { name: 'accessType', label: 'Access Type', type: 'searchableSelect', required: true, 
            options: [
              { label: 'System User', value: 'user' },
              { label: 'Vendor User', value: 'vendor' }
            ] 
          },
          { name: 'department', label: 'Department', type: 'asyncSelect', endpoint: '/departments',
            showIf: { field: 'accessType', value: 'user', operator: 'eq' }
          },
          { name: 'userRole', label: 'Default System Role', type: 'asyncSelect', endpoint: '/user-roles' },
          { name: 'workflowRole', label: 'Default Workflow Role', type: 'asyncSelect', endpoint: '/workflow-roles', labelFormat: (r) => r ? `${r.wfRoleCode} - ${r.roleName}` : '' },
          { name: 'isSuperAdmin', label: 'Super Admin Access', type: 'checkbox', isAdminOnly: true },
        ]
      },
      {
        title: 'Assigned Role Mappings',
        fields: [
          { 
            name: 'roleAssignments', 
            label: 'Role Pairings', 
            type: 'array',
            schema: {
              fields: [
                { name: 'userRole', label: 'User Role', type: 'asyncSelect', endpoint: '/user-roles' },
                { name: 'workflowRole', label: 'Workflow Role', type: 'asyncSelect', endpoint: '/workflow-roles', labelFormat: (r) => r ? `${r.wfRoleCode} - ${r.roleName}` : '' },
                { name: 'isDefault', label: 'Default', type: 'checkbox' },
              ]
            }
          }
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      fullName: z.string().min(1, 'Required'),
      email: z.string().email('Invalid Email'),
      password: z.string().optional(),
      userRole: lookupSchema,
      workflowRole: lookupSchema,
      department: lookupSchema,
      accessType: z.string().min(1, 'Required'),
      roleAssignments: z.array(z.object({
        userRole: lookupSchema,
        workflowRole: lookupSchema,
        isDefault: z.boolean().optional()
      })).optional(),
      isSuperAdmin: z.boolean().default(false),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  vendorInvite: {
    endpoint: '/vendor-invites',
    title: 'Vendor Invites',
    singularTitle: 'Invite',
    icon: 'user',
    idField: '_id',
    displayIdField: 'inviteNo',
    columns: [
      { header: 'Invite No', accessor: 'inviteNo', minWidth: 120, className: 'font-mono font-bold text-slate-900' },
      { header: 'Company Name', accessor: 'companyName', minWidth: 200 },
      { header: 'Email', accessor: 'email', minWidth: 220, className: 'font-bold text-indigo-600' },
      { header: 'Status', accessor: 'status', minWidth: 120, type: 'badge' },
      { header: 'Invited By', accessor: 'invitedBy.fullName', minWidth: 150 }
    ],
    formFields: [
      { name: 'companyName', label: 'Company Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'panNo', label: 'PAN No', type: 'text' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'panNo', label: 'PAN No', type: 'text' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      companyName: z.string().min(1, 'Required'),
      email: z.string().email('Invalid email'),
      panNo: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  feature: {
    endpoint: '/features',
    title: 'Feature Flags',
    singularTitle: 'Feature',
    icon: 'gauge',
    idField: '_id',
    displayIdField: 'name',
    columns: [
      { header: 'Feature Name', accessor: 'name', minWidth: 200, className: 'font-mono font-bold text-slate-900' },
      { header: 'System Status', accessor: 'isEnabled', type: 'boolean', minWidth: 120 }
    ],
    formFields: [
      { name: 'name', label: 'Feature Name', type: 'text' },
      { name: 'isEnabled', label: 'Enabled', type: 'checkbox' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'name', label: 'Feature Name', type: 'text', required: true },
          { name: 'isEnabled', label: 'Enabled', type: 'checkbox' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      name: z.string().min(1, 'Required'),
      isEnabled: z.boolean().default(false),
    }).passthrough()
  },

  lineOfBusiness: {
    endpoint: '/line-of-businesses',
    title: 'Lines of Business',
    singularTitle: 'Lines of Business',
    icon: 'briefcase',
    featureFlags: { workflow: 'WF_LINE_OF_BUSINESS', autoId: 'AUTOID_LINE_OF_BUSINESS' },
    idField: '_id',
    displayIdField: 'lobCode',
    columns: [
      { header: 'LOB Code', accessor: 'lobCode', minWidth: 120, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 250 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'lobCode', label: 'LOB Code', type: 'text', disabledOnEdit: true },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'lobCode', label: 'LOB Code', type: 'text', disabledOnEdit: true },
          { name: 'description', label: 'Description', type: 'text', required: true },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      lobCode: z.string().optional(),
      description: z.string().min(1, 'Required'),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  chartOfAccounts: {
    endpoint: '/chart-of-accounts',
    title: 'Chart of Accounts',
    singularTitle: 'Chart of Account',
    icon: 'account_balance',
    idField: '_id',
    displayIdField: 'accountCode',
    featureFlags: { workflow: 'WF_CHART_OF_ACCOUNTS', autoId: 'AUTOID_CHART_OF_ACCOUNTS' },
    columns: [
      { header: 'Account Code', accessor: 'accountCode', minWidth: 140, className: 'font-mono font-bold text-slate-900' },
      { header: 'Account Name', accessor: 'accountName', minWidth: 250 },
      { header: 'Type', accessor: 'accountType', minWidth: 120, className: 'uppercase font-black text-[10px] text-indigo-600' },
      { header: 'Group', accessor: 'accountGroup', minWidth: 150, className: 'text-slate-500 italic' },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formFields: [
      { name: 'accountCode', label: 'Account Code', type: 'text', disabledOnEdit: true },
      { name: 'accountName', label: 'Account Name', type: 'text' },
      { name: 'accountType', label: 'Account Type', type: 'select', options: [
        { label: 'Asset', value: 'Asset' },
        { label: 'Liability', value: 'Liability' },
        { label: 'Equity', value: 'Equity' },
        { label: 'Revenue', value: 'Revenue' },
        { label: 'Expense', value: 'Expense' }
      ]},
      { name: 'accountGroup', label: 'Account Group', type: 'text' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'accountCode', label: 'Account Code', type: 'text', disabledOnEdit: true },
          { name: 'accountName', label: 'Account Name', type: 'text', required: true },
          { name: 'accountType', label: 'Account Type', type: 'searchableSelect', required: true, options: [
        { label: 'Asset', value: 'Asset' },
        { label: 'Liability', value: 'Liability' },
        { label: 'Equity', value: 'Equity' },
        { label: 'Revenue', value: 'Revenue' },
        { label: 'Expense', value: 'Expense' }
      ]},
          { name: 'accountGroup', label: 'Account Group', type: 'text' }
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      accountCode: z.string().optional(),
      accountName: z.string().min(1, 'Required'),
      accountType: z.enum(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
      accountGroup: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  appmenu: {
    endpoint: '/app-menus',
    title: 'Application Menus',
    singularTitle: 'Menu',
    icon: 'menu',
    idField: '_id',
    displayIdField: 'menuId',
    columns: [
      { header: 'Menu ID', accessor: 'menuId', minWidth: 140, className: 'font-mono font-bold text-slate-900' },
      { header: 'Description', accessor: 'description', minWidth: 220 },
      { header: 'Slug', accessor: 'slug', minWidth: 180, className: 'text-indigo-600 font-medium' },
      { header: 'Level', accessor: 'menuLevel', minWidth: 80 },
      { header: 'Type', accessor: 'menuType', minWidth: 100, type: 'badge' },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'menuId', label: 'Menu Identifier', type: 'text', required: true },
          { name: 'description', label: 'Display Name', type: 'text', required: true },
          { name: 'slug', label: 'URL Slug', type: 'text', required: true },
          { name: 'icon', label: 'Icon Name', type: 'text' },
          { name: 'sortOrder', label: 'Sort Order', type: 'number' },
          { name: 'menuType', label: 'Type', type: 'select', options: [{label:'Page', value:'page'}, {label:'Folder', value:'folder'}] },
          { name: 'parentMenu', label: 'Parent Folder', type: 'asyncSelect', endpoint: '/app-menus/my-menus', labelFormat: 'description' },
          { name: 'menuLevel', label: 'Hierarchy Level', type: 'number', disabled: true },
          { name: 'isLookup', label: 'Include in Lookup Registry', type: 'checkbox' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      menuId: z.string().min(1, 'Required'),
      description: z.string().min(1, 'Required'),
      slug: z.string().min(1, 'Required'),
      icon: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
      menuType: z.string().default('page'),
      parentMenu: lookupSchema,
      isLookup: z.boolean().default(false),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  schedulerMaster: {
    endpoint: '/scheduler-masters',
    title: 'Scheduler Configurations',
    singularTitle: 'Scheduler Job',
    icon: 'clock',
    idField: '_id',
    displayIdField: 'jobName',
    columns: [
      { header: 'Job Name', accessor: 'jobName', minWidth: 160, className: 'font-bold text-slate-900' },
      { header: 'Job Type', accessor: 'jobType', minWidth: 140, className: 'uppercase text-[10px] font-black text-slate-500' },
      { header: 'Interval', accessor: 'scheduleInterval', minWidth: 120, className: 'font-mono text-xs text-indigo-600' },
      { header: 'Last Run', accessor: 'lastRunAt', type: 'date', minWidth: 150 },
      { header: 'Active', accessor: 'isActive', type: 'boolean', minWidth: 80 }
    ],
    formSections: [
      {
        title: 'Job Configuration',
        fields: [
          { name: 'jobName', label: 'Job Name', type: 'text', required: true },
          { name: 'jobType', label: 'Job Type', type: 'select', options: [
            {label: 'SLA Processor', value: 'SLA_PROCESSOR'},
            {label: 'Reminder', value: 'REMINDER'},
            {label: 'Auto Action', value: 'AUTO_ACTION'},
            {label: 'General', value: 'GENERAL'}
          ], required: true },
          { name: 'scheduleInterval', label: 'Cron Interval', type: 'text', required: true, help: "E.g., 0 * * * * (Every Hour)" },
          { name: 'targetFunction', label: 'Target Function', type: 'text', required: true },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      jobName: z.string().min(1, 'Required'),
      jobType: z.string().min(1, 'Required'),
      scheduleInterval: z.string().min(1, 'Required'),
      targetFunction: z.string().min(1, 'Required'),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  schedulerLog: {
    endpoint: '/scheduler-logs',
    title: 'Scheduler Logs',
    singularTitle: 'Log',
    icon: 'list',
    idField: '_id',
    displayIdField: '_id',
    columns: [
      { header: 'Job Name', accessor: 'masterId.jobName', minWidth: 160, className: 'font-bold' },
      { header: 'Status', accessor: 'status', minWidth: 100, className: 'uppercase font-black text-[10px]' },
      { header: 'Executed At', accessor: 'executedAt', type: 'date', minWidth: 160 },
      { header: 'Records', accessor: 'recordsProcessed', minWidth: 80, className: 'text-right font-bold text-indigo-600' },
      { header: 'Duration', accessor: (row) => row.durationMs ? `${row.durationMs}ms` : '-', minWidth: 100, className: 'text-right text-slate-400' }
    ],
    formSections: [
      {
        title: 'Execution Details',
        fields: [
          { name: 'masterId', label: 'Job', type: 'asyncSelect', endpoint: '/scheduler-masters', disabled: true },
          { name: 'status', label: 'Status', type: 'text', disabled: true },
          { name: 'executedAt', label: 'Executed At', type: 'text', disabled: true },
          { name: 'errorMessage', label: 'Error Message', type: 'textarea', disabled: true },
          { name: 'recordsProcessed', label: 'Records Processed', type: 'number', disabled: true },
          { name: 'durationMs', label: 'Duration (ms)', type: 'number', disabled: true },
        ]
      }
    ],
    schema: z.object({}).passthrough()
  },

  loginLog: {
    endpoint: '/login-logs',
    title: 'Login Trace',
    singularTitle: 'Login Trace',
    icon: 'activity',
    idField: '_id',
    displayIdField: '_id',
    columns: [
      { header: 'User', accessor: 'userId.fullName', minWidth: 160, className: 'font-bold' },
      { header: 'Email', accessor: 'userId.email', minWidth: 220, className: 'text-indigo-600/80 font-medium' },
      { header: 'Status', accessor: 'status', minWidth: 100, className: 'uppercase font-black text-[10px]' },
      { header: 'IP Address', accessor: 'ipAddress', minWidth: 120, className: 'font-mono text-xs' },
      { header: 'Timestamp', accessor: 'createdAt', type: 'date', minWidth: 160 }
    ],
    formSections: [
      {
        title: 'Login Details',
        fields: [
          { name: 'userId', label: 'User', type: 'asyncSelect', endpoint: '/users', disabled: true },
          { name: 'status', label: 'Status', type: 'text', disabled: true },
          { name: 'ipAddress', label: 'IP Address', type: 'text', disabled: true },
          { name: 'userAgent', label: 'User Agent', type: 'textarea', disabled: true },
          { name: 'createdAt', label: 'Timestamp', type: 'text', disabled: true }
        ]
      }
    ],
    schema: z.object({}).passthrough()
  },

  userDelegation: {
    endpoint: '/workflow-auto-delegation',
    title: 'Delegation Rules',
    singularTitle: 'Delegation',
    icon: 'user-plus',
    idField: '_id',
    displayIdField: '_id',
    columns: [
      { header: 'User', accessor: 'userId.fullName' },
      { header: 'Delegate', accessor: 'delegateId.fullName' },
      { header: 'Start', accessor: 'startDate' },
      { header: 'End', accessor: 'endDate' },
      { header: 'Active', accessor: 'isActive', type: 'boolean' }
    ],
    formSections: [
      {
        title: 'General Information',
        fields: [
          { name: 'userId', label: 'Original User', type: 'asyncSelect', endpoint: '/users', required: true },
          { name: 'delegateId', label: 'Delegate To', type: 'asyncSelect', endpoint: '/users', required: true },
          { name: 'startDate', label: 'Start Date', type: 'date', required: true },
          { name: 'endDate', label: 'End Date', type: 'date', required: true },
          { name: 'reason', label: 'Reason/Remarks', type: 'textarea' },
        ]
      },
      systemInfoSection
    ],
    schema: z.object({
      userId: lookupSchema,
      delegateId: lookupSchema,
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().min(1, 'End date is required'),
      reason: z.string().optional(),
      isActive: z.boolean().default(true)
    }).passthrough()
  },

  'dashboard-layouts': {
    endpoint: '/dashboard/layouts',
    title: 'Dashboard Layouts',
    singularTitle: 'Dashboard Config',
    icon: 'layout',
    idField: '_id',
    displayIdField: 'roleName',
    columns: [
      { header: 'Role', accessor: 'roleName' },
      { header: 'KPI Count', accessor: (row) => row.layout?.length || 0 },
      { header: 'Last Updated', accessor: 'updatedAt', type: 'date' }
    ],
    formSections: [
      {
        title: 'Role Assignment',
        fields: [
          { name: 'roleName', label: 'Target Role Group', type: 'select', options: [
            { label: 'Administrator', value: 'admin' },
            { label: 'Approver / Manager', value: 'approver' },
            { label: 'Standard User', value: 'user' },
            { label: 'Vendor Partner', value: 'vendor' },
            { label: 'Default Fallback', value: 'default' }
          ], required: true }
        ]
      },
      {
        title: 'KPI Cards Configuration',
        fields: [
          {
            name: 'layout',
            label: 'KPI Cards',
            type: 'array',
            schema: {
              fields: [
                { name: 'title', label: 'Card Title', type: 'text', required: true },
                { name: 'metricId', label: 'Metric Logic', type: 'select', options: [
                  { label: 'Pending Approvals (Approver)', value: 'approver-pending' },
                  { label: 'Clarification Received (Approver)', value: 'approver-clarification-received' },
                  { label: 'Clarification Required (User)', value: 'user-clarification-required' },
                  { label: 'My Saved Drafts', value: 'user-drafts' },
                  { label: 'My Submissions', value: 'user-submitted' },
                  { label: 'Total Bills (Admin)', value: 'admin-total-bills' },
                  { label: 'Active Users (Admin)', value: 'admin-total-users' }
                ], required: true },
                { name: 'clickRoute', label: 'Click Navigation Path', type: 'text', help: "E.g. /bills?filter=pending" },
                { name: 'icon', label: 'Icon Name (Lucide)', type: 'text', default: 'Activity' },
                { name: 'colorClass', label: 'Text Color Class', type: 'text', default: 'text-indigo-600' },
                { name: 'bgClass', label: 'BG Color Class', type: 'text', default: 'bg-indigo-50' },
                { name: 'order', label: 'Display Order', type: 'number', default: 0 }
              ]
            }
          }
        ]
      }
    ],
    schema: z.object({
      roleName: z.string().min(1, 'Required'),
      layout: z.array(z.object({
        title: z.string().min(1, 'Required'),
        metricId: z.string().min(1, 'Required'),
        clickRoute: z.string().optional(),
        icon: z.string().optional(),
        colorClass: z.string().optional(),
        bgClass: z.string().optional(),
        order: z.coerce.number().optional()
      })).optional()
    }).passthrough()
  }
};
