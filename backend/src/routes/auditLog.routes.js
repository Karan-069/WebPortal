import { Router } from "express";
import { useModels } from "../utils/tenantContext.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { AuditLog } = useModels();
    const { recordId, collectionName } = req.query;

    const filter = {};
    if (recordId) filter.recordId = recordId;
    if (collectionName) filter.collectionName = collectionName;

    const logs = await AuditLog.find(filter)
      .populate("performedBy", "fullName email")
      .sort({ timestamp: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { docs: logs }, "Audit logs fetched successfully"),
      );
  }),
);

export default router;
