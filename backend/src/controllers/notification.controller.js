import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
} from "../services/notification.service.js";

const getUserNotifications = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const notifications = await getUserNotificationsService(req.user._id, {
    limit: parseInt(limit),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully"),
    );
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationAsReadService(
    req.params.id,
    req.user._id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await markAllNotificationsAsReadService(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  await deleteNotificationService(req.params.id, req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});

export { getUserNotifications, markAsRead, markAllAsRead, deleteNotification };
