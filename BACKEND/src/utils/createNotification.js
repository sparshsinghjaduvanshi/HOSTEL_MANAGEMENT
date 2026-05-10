import { Notification }
from "../models/notification.model.js";

export const createNotification =
  async ({
    userId,
    title,
    message,
    type,
  }) => {

    await Notification.create({
      userId,
      title,
      message,
      type,
    });
};