import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokensService } from "../services/auth.service.js";
import {
  getVendorInvitesService,
  initiateVendorInviteService,
  reinitiateVendorInviteService,
  verifyInviteTokenService,
  verifyVendorPanService,
  registerVendorService,
} from "../services/vendorInvite.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

const getVendorInvites = asyncHandler(async (req, res) => {
  const result = await getVendorInvitesService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vendor invites fetched successfully"));
});

const initiateInvite = asyncHandler(async (req, res) => {
  const invite = await initiateVendorInviteService(req.body, req.user._id);
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        invite,
        "Vendor invite created successfully. Email sent.",
      ),
    );
});

const reinitiateInvite = asyncHandler(async (req, res) => {
  const invite = await reinitiateVendorInviteService(req.params.id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        invite,
        "Vendor invite re-initiated successfully. Email sent.",
      ),
    );
});

const verifyInviteToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const result = await verifyInviteTokenService(token);
  return res.status(200).json(new ApiResponse(200, result, "Token is valid."));
});

const verifyPan = asyncHandler(async (req, res) => {
  const { token, panNo } = req.body;
  const result = await verifyVendorPanService(token, panNo);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "PAN verification successful."));
});

const registerVendor = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await registerVendorService(token, password);

  // We automatically log the vendor in here!
  const tokens = await generateTokensService(result.user);

  const loggedInUser = result.user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  return res
    .status(201)
    .cookie("accessToken", tokens.accessToken, cookieOptions)
    .cookie("refreshToken", tokens.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        {
          user: loggedInUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        "Vendor registered and successfully logged in.",
      ),
    );
});

export {
  getVendorInvites,
  initiateInvite,
  reinitiateInvite,
  verifyInviteToken,
  verifyPan,
  registerVendor,
};
