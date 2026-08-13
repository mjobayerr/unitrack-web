import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, Bus, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function Notifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'bus',
      title: 'Bus 3A is approaching',
      message: 'Your bus will arrive in approximately 5 minutes',
      time: '2 min ago',
      read: false,
      icon: Bus,
      color: 'bg-[#1A3C8F]',
    },
    {
      id: 2,
      type: 'seats',
      title: 'Seats filling up fast',
      message: 'Only 8 seats remaining on Bus 5B',
      time: '15 min ago',
      read: false,
      icon: AlertCircle,
      color: 'bg-[#F59E0B]',
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment successful',
      message: 'Your payment of ৳15 has been confirmed',
      time: '1 hour ago',
      read: false,
      icon: CheckCircle,
      color: 'bg-[#1DB954]',
    },
    {
      id: 4,
      type: 'bus',
      title: 'Bus 7C delayed',
      message: 'Expected delay of 10 minutes due to traffic',
      time: '2 hours ago',
      read: true,
      icon: Clock,
      color: 'bg-gray-500',
    },
    {
      id: 5,
      type: 'payment',
      title: 'Trip completed',
      message: 'Thank you for using UniTrack BD',
      time: '3 hours ago',
      read: true,
      icon: CheckCircle,
      color: 'bg-[#1DB954]',
    },
    {
      id: 6,
      type: 'bus',
      title: 'New route added',
      message: 'Bus 9D now available: Dhanmondi → Campus',
      time: 'Yesterday',
      read: true,
      icon: Bus,
      color: 'bg-[#1A3C8F]',
    },
    {
      id: 7,
      type: 'system',
      title: 'System maintenance',
      message: 'Scheduled maintenance on June 20, 2:00 AM - 4:00 AM',
      time: '2 days ago',
      read: true,
      icon: Bell,
      color: 'bg-gray-500',
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-8 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl">Notifications</h1>
            <p className="text-white/80 text-sm">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="text-sm text-white/90 hover:text-white underline">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-6 py-6 space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          
          return (
            <div
              key={notification.id}
              className={`bg-white rounded-[16px] shadow-sm p-4 border transition-all ${
                notification.read
                  ? 'border-gray-100'
                  : 'border-[#1A3C8F]/20 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`${notification.color} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`${
                        notification.read ? 'text-gray-900' : 'text-gray-900'
                      } text-sm`}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#1A3C8F] rounded-full flex-shrink-0 mt-1.5"></div>
                    )}
                  </div>
                  <p
                    className={`${
                      notification.read ? 'text-gray-500' : 'text-gray-600'
                    } text-sm mb-2`}
                  >
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {notification.time}
                    </span>
                    {notification.type === 'bus' && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-[#1A3C8F] border-[#1A3C8F]/20 text-xs px-2 py-0"
                      >
                        Bus
                      </Badge>
                    )}
                    {notification.type === 'payment' && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-[#1DB954] border-[#1DB954]/20 text-xs px-2 py-0"
                      >
                        Payment
                      </Badge>
                    )}
                    {notification.type === 'seats' && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-[#F59E0B] border-[#F59E0B]/20 text-xs px-2 py-0"
                      >
                        Alert
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State - Hidden when there are notifications */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500 text-center">
            You're all caught up! We'll notify you about bus updates and
            payments.
          </p>
        </div>
      )}
    </div>
  );
}
