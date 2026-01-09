// lib/notifications.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NotificationType = 
  | 'billing_created'
  | 'billing_reminder'
  | 'payment_received'
  | 'maintenance_request'
  | 'maintenance_fixed'
  | 'urgent_maintenance'
  | 'message_received';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  message: string;
  relatedId?: number;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  message,
  relatedId
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedId,
        isRead: false
      }
    });
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Create a notification when a billing is created for a tenant
 */
export async function createBillingNotification({
  tenantId,
  billingId,
  unit,
  month,
  totalAmount,
  tenantName
}: {
  tenantId: number;
  billingId: number;
  unit: string;
  month: string;
  totalAmount: number;
  tenantName: string;
}) {
  const monthDate = new Date(month + '-01');
  const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
  const message = `New billing statement for Unit ${unit} - ${monthName}: ₱${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please settle your payment on or before the due date.`;
  
  return createNotification({
    userId: tenantId,
    type: 'billing_created',
    message,
    relatedId: billingId
  });
}

/**
 * Create a notification when a message is sent
 */
export async function createMessageNotification({
  receiverId,
  senderName,
  messagePreview,
  messageId
}: {
  receiverId: number;
  senderName: string;
  messagePreview: string;
  messageId: number;
}) {
  const preview = messagePreview.length > 50 
    ? messagePreview.substring(0, 50) + '...' 
    : messagePreview;
  
  const message = `New message from ${senderName}: "${preview}"`;
  
  return createNotification({
    userId: receiverId,
    type: 'message_received',
    message,
    relatedId: messageId
  });
}

/**
 * Create a notification when a maintenance request is fixed
 */
export async function createMaintenanceFixedNotification({
  tenantId,
  maintenanceId,
  requestDescription,
  totalCost
}: {
  tenantId: number;
  maintenanceId: number;
  requestDescription: string;
  totalCost: number;
}) {
  const requestPreview = requestDescription.length > 50 
    ? requestDescription.substring(0, 50) + '...' 
    : requestDescription;
  
  const message = `Your maintenance request "${requestPreview}" has been fixed. Total cost: ₱${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Check the documentation for details.`;
  
  return createNotification({
    userId: tenantId,
    type: 'maintenance_fixed',
    message,
    relatedId: maintenanceId
  });
}

/**
 * Create a notification when a payment is received (for landlord)
 */
export async function createPaymentReceivedNotification({
  landlordId,
  tenantName,
  amount,
  unit,
  paymentId
}: {
  landlordId: number;
  tenantName: string;
  amount: number;
  unit: string;
  paymentId: number;
}) {
  const message = `Payment received from ${tenantName} (Unit ${unit}): ₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  return createNotification({
    userId: landlordId,
    type: 'payment_received',
    message,
    relatedId: paymentId
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  try {
    await prisma.notification.update({
      where: { notificationId },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number) {
  try {
    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false 
      },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number) {
  try {
    const count = await prisma.notification.count({
      where: { 
        userId,
        isRead: false 
      }
    });
    return { success: true, count };
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return { success: false, count: 0, error };
  }
}
