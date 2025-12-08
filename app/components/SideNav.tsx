import React, { useEffect, useState } from 'react'
import { SideNavProps } from '@/types'
import NotificationSlip from './customcomponents/NotificationSlip'

interface NotificationData {
  notificationId: number;
  type: string;
  message: string;
  relatedId: number | null;
  isRead: boolean;
  createdAt: string;
  date: string;
}

const SideNav = ({ nav, comRef, setPage }: SideNavProps ) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (nav !== 'right-full') {
      fetchNotifications();
    }
  }, [nav]);

  const handleNotificationClick = async (notification: NotificationData) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.notificationId })
        });
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on type
    if (notification.type === 'maintenance_request' || notification.type === 'urgent_maintenance') {
      setPage(4, notification.relatedId || undefined); // Documentation page with maintenanceId
    } else if (notification.type === 'billing_reminder') {
      setPage(6, notification.relatedId || undefined); // BillingPage with billingId
    } else if (notification.type === 'payment_received') {
      setPage(6, notification.relatedId || undefined); // BillingPage with billingId (or payment page if exists)
    }
  };

  return (
    <div ref={comRef} className={`h-full w-4/5 ${nav} flex flex-col fixed z-50 bg-zinc-100 ease-in-out duration-700 md:w-3/5`}>
      {notifications.map((notification) => (
        <NotificationSlip 
          key={notification.notificationId}
          newNotif={!notification.isRead} 
          notifType={notification.type === 'urgent_maintenance' ? 'alert' : notification.type === 'billing_reminder' ? 'reminder' : 'maintenance'}
          info={notification.message} 
          date={notification.date}
          onClick={() => handleNotificationClick(notification)}
        />
      ))}
      {notifications.length === 0 && (
        <div className="flex items-center justify-center py-12 px-4">
          <p className="text-zinc-500">No notifications</p>
        </div>
      )}
    </div>
  )
}

export default SideNav
