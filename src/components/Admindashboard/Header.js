import {
  Menu,
  RefreshCw,
  Bell,
  X,
  CheckCheck,
  User,
  Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserDropdown from './UserDropdown';

const Header = ({
  activeTab,
  isMobile,
  setMobileMenuOpen,
  fetchAllData,
  notificationsOpen,
  setNotificationsOpen,
  allNotifications,
  unreadCount,
  markNotificationAsRead,
  markAllAsRead,
  userDropdownOpen,
  setUserDropdownOpen,
  avatarUrl,
  user,
  router,
  handleSignOut
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getNotificationStyle = (type, isRead) => {
    const styles = {
      report: {
        bg: isRead ? 'bg-red-50/50' : 'bg-red-50',
        border: isRead ? 'border-red-100' : 'border-red-200',
        iconBg: isRead ? 'bg-red-100' : 'bg-red-100',
        iconColor: 'text-red-600',
        accentColor: 'bg-red-500'
      },
      warning: {
        bg: isRead ? 'bg-amber-50/50' : 'bg-amber-50',
        border: isRead ? 'border-amber-100' : 'border-amber-200',
        iconBg: isRead ? 'bg-amber-100' : 'bg-amber-100',
        iconColor: 'text-amber-600',
        accentColor: 'bg-amber-500'
      },
      warning_response: {
        bg: isRead ? 'bg-blue-50/50' : 'bg-blue-50',
        border: isRead ? 'border-blue-100' : 'border-blue-200',
        iconBg: isRead ? 'bg-blue-100' : 'bg-blue-100',
        iconColor: 'text-blue-600',
        accentColor: 'bg-blue-500'
      },
      user: {
        bg: isRead ? 'bg-blue-50/50' : 'bg-blue-50',
        border: isRead ? 'border-blue-100' : 'border-blue-200',
        iconBg: isRead ? 'bg-blue-100' : 'bg-blue-100',
        iconColor: 'text-blue-600',
        accentColor: 'bg-blue-500'
      },
      book: {
        bg: isRead ? 'bg-green-50/50' : 'bg-green-50',
        border: isRead ? 'border-green-100' : 'border-green-200',
        iconBg: isRead ? 'bg-green-100' : 'bg-green-100',
        iconColor: 'text-green-600',
        accentColor: 'bg-green-500'
      },
      contact: {
        bg: isRead ? 'bg-purple-50/50' : 'bg-purple-50',
        border: isRead ? 'border-purple-100' : 'border-purple-200',
        iconBg: isRead ? 'bg-purple-100' : 'bg-purple-100',
        iconColor: 'text-purple-600',
        accentColor: 'bg-purple-500'
      }
    };
    return styles[type] || styles.user;
  };

  const getNotificationTitle = (notification) => {
    const titles = {
      report: 'New Report Submitted',
      warning: 'Warning Issued',
      user: 'New User Registration',
      warning_response: 'User Response to Warning',
      book: 'Book Listed for Sale',
      contact: 'Contact Message Received'
    };
    return titles[notification.type] || 'New Notification';
  };

  const getNotificationMessage = (notification) => {
    if (notification.type === 'warning_response') {
      return (
        <>
          <strong>User:</strong> {notification.userId?.name || 'Unknown user'} responded to a warning
          <br />
          <strong>Response:</strong> {notification.response}
          {notification.bookId && (
            <>
              <br />
              <strong>Book:</strong> {notification.bookId.title}
            </>
          )}
        </>
      );
    }
    // You can add more custom messages for other notification types here if needed
    return notification.message || notification.details ||
      (notification.type === 'user' ? `Welcome ${notification.name || notification.email}!` :
        notification.type === 'book' ? `"${notification.title}" has been listed.` :
          notification.type === 'contact' ? `New message from ${notification.name || 'user'}.` :
            notification.type === 'report' ? 'A new report was submitted.' :
              notification.type === 'warning' ? 'A warning was issued.' :
                'New activity detected.');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
            <p className="text-gray-600 text-xs lg:text-sm hidden sm:block">
              {activeTab === 'overview' && 'System overview and analytics'}
              {activeTab === 'users' && 'Manage user accounts and permissions'}
              {activeTab === 'books' && 'Manage all books in the marketplace'}
              {activeTab === 'reports' && 'Monitor user reports and violations'}
              {activeTab === 'settings' && 'Configure system preferences'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-3">
          <button
            onClick={fetchAllData}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          {/* Notification dropdown */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-white shadow-lg text-xs font-semibold flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-full sm:w-[380px] max-w-[95vw] sm:max-w-[420px] p-0 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
              align="end"
              sideOffset={8}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-gray-50 to-white border-b border-gray-100/50 backdrop-blur-sm">
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl shrink-0">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">Notifications</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {unreadCount > 0
                          ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                          : 'All caught up!'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="hidden sm:flex text-xs hover:bg-blue-50 text-blue-600 font-medium px-3 py-1.5 h-auto"
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotificationsOpen(false)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notifications Content */}
              <ScrollArea className="max-h-[70vh] sm:max-h-[500px]">
                <div className="p-3 sm:p-4">
                  {allNotifications.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-60"></div>
                        <div className="relative p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                          <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">No notifications yet</h4>
                      <p className="text-xs sm:text-sm text-gray-500">We'll notify you when something arrives!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allNotifications.map((notification) => {
                        const IconComponent = notification.icon;
                        const style = getNotificationStyle(notification.type, notification.is_read);

                        return (
                          <div
                            key={`${notification.type}-${notification._id}`}
                            className={`group relative p-3 pb-1 sm:p-3 sm:pb-1 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] ${style.bg} ${style.border}`}
                            onClick={() => markNotificationAsRead(notification._id, notification.type)}
                          >
                            {!notification.is_read && (
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.accentColor} rounded-l-xl`}></div>
                            )}
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className={`relative p-2 rounded-lg sm:p-2.5 rounded-xl ${style.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                                <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${style.iconColor}`} />
                                {!notification.is_read && (
                                  <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 ${style.accentColor} rounded-full border-2 border-white`}></div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <h4 className={`text-sm sm:text-base font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                      {getNotificationTitle(notification)}
                                    </h4>
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${style.iconColor} bg-white/80 border-0 font-medium capitalize`}
                                    >
                                      {notification.type}
                                    </Badge>
                                  </div>
                                  {!notification.is_read && (
                                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${style.accentColor} rounded-full animate-pulse`}></div>
                                  )}
                                </div>

                                <p className={`text-xs sm:text-sm leading-relaxed mb-0 sm:mb-0 ${notification.is_read ? 'text-gray-600' : 'text-gray-700'}`}>
                                  {/* {notification.message || notification.details ||
                                    (notification.type === 'user' ? `Welcome ${notification.name || notification.email}!` :
                                      notification.type === 'book' ? `"${notification.title}" has been listed.` :
                                        notification.type === 'contact' ? `New message from ${notification.name || 'user'}.` :
                                          notification.type === 'report' ? 'A new report was submitted.' :
                                            notification.type === 'warning' ? 'A warning was issued.' :
                                              'New activity detected.')} */}
                                  {getNotificationMessage(notification)}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500">
                                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    <span className="font-medium">
                                      {formatDate(notification.type === 'warning_response' ? notification.respondedAt : notification.createdAt)}
                                    </span>
                                  </div>

                                  {!notification.is_read && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs text-gray-500 hover:text-gray-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (notification.type === 'warning_response') {
                                            // For warning responses, you might want different behavior
                                            markNotificationAsRead(notification._id, 'warning_response');
                                            // Optionally open warning details modal
                                          } else {
                                            markNotificationAsRead(notification._id, notification.type);
                                          }
                                        }}
                                      >
                                        Mark read
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              {allNotifications.length > 3 && (
                <div className="border-t border-gray-100/50 bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4">
                  <Button
                    variant="outline"
                    className="w-full text-xs sm:text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-300 transition-all duration-200"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View All Notifications
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-500">
                      ({allNotifications.length})
                    </span>
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <UserDropdown
            userDropdownOpen={userDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
            avatarUrl={avatarUrl}
            user={user}
            router={router}
            handleSignOut={handleSignOut}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;