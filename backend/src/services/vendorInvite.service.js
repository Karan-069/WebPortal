import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";
import crypto from "crypto";
// import sendEmail from "../utils/sendEmail.js";

const getVendorInvitesService = async (queryParams) => {
  const { VendorInvite } = useModels();
  const { page = 1, limit = 10, search = "" } = queryParams;

  const query = search
    ? {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  return await VendorInvite.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: "invitedBy",
    sort: { createdAt: -1 },
  });
};

const initiateVendorInviteService = async (data, invitedByUserId) => {
  const { VendorInvite } = useModels();
  const { companyName, email, panNo } = data;

  // Check if panNo already invited
  const existingPan = await VendorInvite.findOne({
    panNo,
    status: { $in: ["Pending", "Registered"] },
  });
  if (existingPan) {
    throw new ApiError(
      400,
      "An invite with this PAN number already exists or is registered.",
    );
  }

  // Generate 72 hour token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const invite = await VendorInvite.create({
    companyName,
    email,
    panNo,
    token,
    expiresAt,
    invitedBy: invitedByUserId,
  });

  // Call Email utility here
  // await sendEmail({ to: email, subject: "Vendor Invitation", html: "Click <a href='.../" + token + "'>here</a> to register." });

  return invite;
};

const reinitiateVendorInviteService = async (inviteId) => {
  const { VendorInvite } = useModels();
  const invite = await VendorInvite.findById(inviteId);

  if (!invite) throw new ApiError(404, "Invite not found");
  if (invite.status === "Registered")
    throw new ApiError(400, "Vendor is already registered.");

  const token = crypto.randomBytes(32).toString("hex");
  invite.token = token;
  invite.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  invite.status = "Pending";
  await invite.save();

  // Resend email
  return invite;
};

const verifyInviteTokenService = async (token) => {
  const { VendorInvite } = useModels();
  const invite = await VendorInvite.findOne({ token });

  if (!invite) throw new ApiError(404, "Invalid invitation link.");
  if (invite.status !== "Pending")
    throw new ApiError(400, "Invitation is no longer pending.");
  if (new Date() > invite.expiresAt) {
    invite.status = "Expired";
    await invite.save();
    throw new ApiError(400, "Invitation has expired.");
  }

  // Only return necessary info, not the PAN.
  return { companyName: invite.companyName, email: invite.email };
};

const verifyVendorPanService = async (token, enteredPan) => {
  const { VendorInvite } = useModels();
  const invite = await VendorInvite.findOne({ token, status: "Pending" });
  if (!invite) throw new ApiError(404, "Invalid or expired invitation link.");
  if (new Date() > invite.expiresAt)
    throw new ApiError(400, "Invitation has expired.");

  if (invite.panNo.toUpperCase() !== enteredPan.toUpperCase()) {
    throw new ApiError(400, "PAN Number verification failed.");
  }

  return { success: true };
};

const registerVendorService = async (token, password) => {
  const { VendorInvite, User, UserRole, Vendor } = useModels();

  const invite = await VendorInvite.findOne({
    token,
    status: "Pending",
  }).populate("invitedBy");
  if (!invite) throw new ApiError(404, "Invalid or expired invitation link.");
  if (new Date() > invite.expiresAt)
    throw new ApiError(400, "Invitation has expired.");

  // Ensure role exists
  let vendorRole = await UserRole.findOne({ roleType: "vendor" });
  if (!vendorRole) {
    vendorRole = await UserRole.findOne(); // Fallback
  }

  // 1. Create User
  const newUser = await User.create({
    fullName: invite.companyName,
    email: invite.email,
    password: password,
    userRole: vendorRole ? vendorRole._id : null,
    department: invite.invitedBy ? invite.invitedBy.department : null,
    accessType: "vendor",
  });

  // 2. Create Vendor Stub
  const newVendor = await Vendor.create({
    fullName: invite.companyName,
    emailId: invite.email,
    panNo: invite.panNo,
    linkedUserId: newUser._id,
    workflowStatus: "Draft",
  });

  // 3. Update invite status
  invite.status = "Registered";
  await invite.save();

  // We return the user and vendor to be used for token generation in the controller
  return { user: newUser, vendor: newVendor };
};

export {
  getVendorInvitesService,
  initiateVendorInviteService,
  reinitiateVendorInviteService,
  verifyInviteTokenService,
  verifyVendorPanService,
  registerVendorService,
};
