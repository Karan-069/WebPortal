import { UserSchema } from "./user.model.js";
import { userRoleSchema } from "./userRole.model.js";
import { vendorSchema } from "./vendor.model.js";
import { itemSchema } from "./item.model.js";
import { billSchema } from "./bill.model.js";
import { departmentSchema } from "./department.model.js";
import { citySchema } from "./city.model.js";
import { stateSchema } from "./state.model.js";
import { uomSchema } from "./uom.model.js";
import { subsidarySchema } from "./subsidary.model.js";
import { assetCategorySchema } from "./assetCategory.model.js";
import { locationSchema } from "./location.model.js";
import { nextTransactionIdSchema } from "./nextTransactionId.model.js";
import { appMenuSchema } from "./appMenu.model.js";
import { workflowSchema } from "./workflow.model.js";
import { workflowRoleSchema } from "./workflowRole.model.js";
import { workflowLogSchema } from "./workflowLogs.model.js";
import { crtermSchema } from "./crterm.model.js";
import { workflowStateSchema } from "./workflowState.model.js";
import { notificationSchema } from "./notification.model.js";
import { vendorInviteSchema } from "./vendorInvite.model.js";
import { featureSchema } from "./feature.model.js";
import { auditLogSchema } from "./auditLog.model.js";
import { loginLogSchema } from "./loginLog.model.js";
import { lineOfBusinessSchema } from "./lineOfBusiness.model.js";
import { chartOfAccountsSchema } from "./chartOfAccounts.model.js";
import { emailTemplateSchema } from "./emailTemplate.model.js";
import { userDelegationSchema } from "./userDelegation.model.js";
import { schedulerMasterSchema } from "./schedulerMaster.model.js";
import { schedulerLogSchema } from "./schedulerLog.model.js";
import { dashboardConfigSchema } from "./DashboardConfig.model.js";
import { emailLogSchema } from "./emailLog.model.js";

/**
 * Factory function to bind all business schemas to a specific database connection.
 * This ensures data isolation in a multi-tenant environment.
 */
export const getTenantModels = (connection) => {
  return {
    User: connection.model("User", UserSchema),
    UserRole: connection.model("UserRole", userRoleSchema),
    Vendor: connection.model("Vendor", vendorSchema),
    Item: connection.model("Item", itemSchema),
    Bill: connection.model("Bill", billSchema),
    Department: connection.model("Department", departmentSchema),
    City: connection.model("City", citySchema),
    State: connection.model("State", stateSchema),
    Uom: connection.model("Uom", uomSchema),
    Subsidary: connection.model("Subsidary", subsidarySchema),
    AssetCategory: connection.model("AssetCategory", assetCategorySchema),
    Location: connection.model("Location", locationSchema),
    NextTransactionId: connection.model(
      "NextTransactionId",
      nextTransactionIdSchema,
    ),
    AppMenu: connection.model("AppMenu", appMenuSchema),
    Workflow: connection.model("Workflow", workflowSchema),
    WorkflowRole: connection.model("WorkflowRole", workflowRoleSchema),
    WorkflowLog: connection.model("WorkflowLog", workflowLogSchema),
    Crterm: connection.model("Crterm", crtermSchema),
    WorkflowState: connection.model("WorkflowState", workflowStateSchema),
    Notification: connection.model("Notification", notificationSchema),
    VendorInvite: connection.model("VendorInvite", vendorInviteSchema),
    Feature: connection.model("Feature", featureSchema),
    AuditLog: connection.model("AuditLog", auditLogSchema),
    LoginLog: connection.model("LoginLog", loginLogSchema),
    LineOfBusiness: connection.model("LineOfBusiness", lineOfBusinessSchema),
    ChartOfAccounts: connection.model("ChartOfAccounts", chartOfAccountsSchema),
    EmailTemplate: connection.model("EmailTemplate", emailTemplateSchema),
    UserDelegation: connection.model("UserDelegation", userDelegationSchema),
    SchedulerMaster: connection.model("SchedulerMaster", schedulerMasterSchema),
    SchedulerLog: connection.model("SchedulerLog", schedulerLogSchema),
    DashboardConfig: connection.model("DashboardConfig", dashboardConfigSchema),
    EmailLog: connection.model("EmailLog", emailLogSchema),
  };
};
