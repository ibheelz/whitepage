import { prisma } from './prisma'

export interface Notification {
  id: string
  type: 'FRAUD_ALERT' | 'SYSTEM_ALERT' | 'CAMPAIGN_ALERT' | 'USER_ALERT'
  title: string
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  data?: any
  read: boolean
  createdAt: Date
}

export class NotificationService {
  static async createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    severity: Notification['severity'] = 'MEDIUM',
    data?: any
  ) {
    // In a real implementation, this would store in database
    // For now, we'll just return the notification object
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      severity,
      data,
      read: false,
      createdAt: new Date()
    }
  }

  static async getRecentNotifications(limit = 10): Promise<Notification[]> {
    // Mock notifications for demo
    return [
      {
        id: 'notif_1',
        type: 'FRAUD_ALERT',
        title: 'High Fraud Activity Detected',
        message: 'IP 192.168.1.100 submitted 15 leads in 5 minutes',
        severity: 'HIGH',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'notif_2',
        type: 'CAMPAIGN_ALERT',
        title: 'Campaign Performance Alert',
        message: 'Summer-2024 campaign has 85% duplicate rate',
        severity: 'MEDIUM',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'notif_3',
        type: 'SYSTEM_ALERT',
        title: 'Daily Report Ready',
        message: 'Your daily analytics report is ready for download',
        severity: 'LOW',
        read: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ]
  }
}