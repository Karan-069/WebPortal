import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";

const getUserNotificationsService = async (userId, query = {}) => {
  const { Notification } = useModels();
  const { limit = 20 } = query;

  // Get latest notifications for user, unread first
  const notifications = await Notification.find({ userId })
    .sort({ isRead: 1, createdAt: -1 })
    .limit(limit * 1);

  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return { notifications, unreadCount };
};

const markNotificationAsReadService = async (id, userId) => {
  const { Notification } = useModels();
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true } },
    { new: true },
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found or access denied");
  }

  return notification;
};

const markAllNotificationsAsReadService = async (userId) => {
  const { Notification } = useModels();
  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } },
  );
  return true;
};

const deleteNotificationService = async (id, userId) => {
  const { Notification } = useModels();
  const notification = await Notification.findOneAndDelete({ _id: id, userId });
  if (!notification) {
    throw new ApiError(404, "Notification not found or access denied");
  }
  return true;
};

export {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
};
