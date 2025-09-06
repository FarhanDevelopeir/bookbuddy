"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Ban, CheckCircle, AlertTriangle,Flag,Users, Calendar, BookOpen, Mail,DollarSign, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from "sonner";
import getImageSrc from '@/utils/getImageSrc';

// Components
import Sidebar from '@/components/Admindashboard/Sidebar';
import Header from '@/components/Admindashboard/Header';
import AdminStats from '@/components/Admindashboard/AdminStats';
import OverviewContent from '@/components/Admindashboard/OverviewContent';
import BooksContent from '@/components/Admindashboard/BooksContent';
import UsersContent from '@/components/Admindashboard/UsersContent';
import ReportsContent from '@/components/Admindashboard/ReportsContent';
import SettingsContent from '@/components/Admindashboard/SettingsContent';

// Modals
import DeleteBookModal from '@/components/Admindashboard/modals/DeleteBookModal';
import HideBookModal from '@/components/Admindashboard/modals/HideBookModal';
import WarningModal from '@/components/Admindashboard/modals/WarningModal';
import WarningDialog from '@/components/Admindashboard/modals/WarningDialog';
import ReportDialog from '@/components/Admindashboard/modals/ReportDialog';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const AdminDashboard = () => {
  // State management - ALL HOOKS AT THE TOP LEVEL
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [userBooks, setUserBooks] = useState([]);
  const [warningModal, setWarningModal] = useState(false);
  const [deleteBookModal, setDeleteBookModal] = useState(false);
  const [warningForm, setWarningForm] = useState({ userId: '', message: '', severity: 'low' });
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hideBookModal, setHideBookModal] = useState(false);
  const [hideBookReason, setHideBookReason] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBooks: 0,
    openReports: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(null);

  const router = useRouter();


  // Close mobile menu when tab changes
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [activeTab, isMobile, mobileMenuOpen]);

  

  // Admin verification effect
  // useEffect(() => {
  //   const checkAdminAndGetUser = async () => {
  //     try {
  //       setIsVerifying(true);
        
  //       const { data: { session } } = await supabase.auth.getSession();
  //       const currentUser = session?.user ?? null;

  //       if (!currentUser) {
  //         setShouldRedirect('/auth/login');
  //         return;
  //       }

  //       if (currentUser.email !== ADMIN_EMAIL) {
  //         setShouldRedirect('/');
  //         return;
  //       }

  //       const response = await fetch(`/api/users/${currentUser.id}`);
  //       if (!response.ok) {
  //         setShouldRedirect('/auth/login');
  //         return;
  //       }

  //       const userData = await response.json();
  //       if (userData.role !== 'admin' || userData.isSuspended) {
  //         setShouldRedirect('/');
  //         return;
  //       }

  //       // Admin verified
  //       setUser(currentUser);
  //       if (currentUser?.user_metadata?.picture) {
  //         setAvatarUrl(currentUser.user_metadata.picture);
  //       }
  //       setIsVerifying(false);
  //     } catch (error) {
  //       console.error('Admin check failed:', error);
  //       setShouldRedirect('/auth/login');
  //     }
  //   };

  //   checkAdminAndGetUser();
  // }, []);
  useEffect(() => {
  let isMounted = true;

  const checkAdminAndGetUser = async () => {
    try {
      setIsVerifying(true);

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        if (isMounted) setShouldRedirect('/auth/login');
        return;
      }

      if (currentUser.email !== ADMIN_EMAIL) {
        if (isMounted) setShouldRedirect('/');
        return;
      }

      const response = await fetch(`/api/users/${currentUser.id}`);
      if (!response.ok) {
        if (isMounted) setShouldRedirect('/auth/login');
        return;
      }

      const userData = await response.json();
      if (userData.role !== 'admin' || userData.isSuspended) {
        if (isMounted) setShouldRedirect('/');
        return;
      }

      if (isMounted) {
        setUser(currentUser);
        if (currentUser?.user_metadata?.picture) {
          setAvatarUrl(currentUser.user_metadata.picture);
        }
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      if (isMounted) setShouldRedirect('/auth/login');
    }
  };

  checkAdminAndGetUser();

  return () => {
    isMounted = false; // cleanup
  };
}, []);


  // Separate useEffect for redirects
  useEffect(() => {
    if (shouldRedirect) {
      router.replace(shouldRedirect);
    }
  }, [shouldRedirect]);

  // Load all warnings and reports on component mount
  // useEffect(() => {
  //   const loadWarningsAndReports = async () => {
  //     try {
  //       setLoading(true);
  //       const [warningsData, reportsData] = await Promise.all([
  //         fetchAllWarnings(),
  //         fetchAllReports()
  //       ]);
  //       setWarnings(warningsData.warnings);
  //       setReports(reportsData.reports || reportsData);
  //     } catch (err) {
  //       console.log(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadWarningsAndReports();
  // }, []);

  // All your functions and logic here...
  
  useEffect(() => {
  let isMounted = true;

  const loadWarningsAndReports = async () => {
    try {
      if (isMounted) setLoading(true);

      const [warningsData, reportsData] = await Promise.all([
        fetchAllWarnings(),
        fetchAllReports()
      ]);

      if (isMounted) {
        setWarnings(warningsData.warnings);
        setReports(reportsData.reports || reportsData);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  loadWarningsAndReports();

  return () => {
    isMounted = false; // cleanup
  };
}, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        users,
        books,
        stats,
        activity,
        warningsData
      ] = await Promise.all([
        fetchUsers(),
        fetchBooks(),
        fetchDashboardStats(),
        fetchRecentActivity(),
        fetchAllWarnings(),
      ]);
      await fetchAllNotifications();
      setWarnings(warningsData.warnings);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadData = async () => {
    await fetchAllData();
  };
  loadData();
}, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`Users API failed: ${response.status}`);
      }
      const userData = await response.json();
      setUsers(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      return [];
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/admin/books');
      if (!response.ok) {
        throw new Error(`Books API failed: ${response.status}`);
      }
      const booksData = await response.json();
      setBooks(booksData);
      return booksData;
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      return [];
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error(`Stats API failed: ${response.status}`);
      }
      const stats = await response.json();
      setDashboardStats(stats);
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      const defaultStats = {
        totalUsers: 0,
        activeUsers: 0,
        totalBooks: 0,
        openReports: 0
      };
      setDashboardStats(defaultStats);
      return defaultStats;
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/activity');
      if (!response.ok) {
        throw new Error(`Activity API failed: ${response.status}`);
      }
      const activity = await response.json();
      setRecentActivity(activity);
      return activity;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
      return [];
    }
  };

  const fetchAllWarnings = async () => {
    try {
      const response = await fetch('/api/admin/warnings/all', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch warnings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching warnings:', error);
      throw error;
    }
  };

  const fetchAllReports = async () => {
    try {
      const response = await fetch('/api/admin/reports/all', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  };

  // const fetchAllNotifications = async () => {
  //   try {
  //     const response = await fetch('/api/admin/notifications');
  //     if (!response.ok) throw new Error('Failed to fetch notifications');
  //     const data = await response.json();

  //     const filteredContacts = data.contacts.filter(contact => contact.subject !== 'report');

  //     const notifications = [
  //       ...data.reports.map(item => ({ ...item, type: 'report', icon: Flag })),
  //       ...data.users.map(item => ({ ...item, type: 'user', icon: Users })),
  //       ...data.books.map(item => ({ ...item, type: 'book', icon: BookOpen })),
  //       ...filteredContacts.map(item => ({ ...item, type: 'contact', icon: Mail }))
  //     ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  //     setAllNotifications(notifications);
  //     setUnreadCount(notifications.filter(n => !n.is_read).length);
  //   } catch (error) {
  //     console.error('Error fetching notifications:', error);
  //   }
  // };

  const fetchAllNotifications = async () => {
  try {
    const response = await fetch('/api/admin/notifications');
    if (!response.ok) throw new Error('Failed to fetch notifications');
    const data = await response.json();

    const filteredContacts = data.contacts.filter(contact => contact.subject !== 'report');

    const notifications = [
      ...data.reports.map(item => ({ ...item, type: 'report', icon: Flag })),
      ...data.users.map(item => ({ ...item, type: 'user', icon: Users })),
      ...data.books.map(item => ({ ...item, type: 'book', icon: BookOpen })),
      ...filteredContacts.map(item => ({ ...item, type: 'contact', icon: Mail })),
      // Add warning responses as a separate type with different icon and styling
      ...(data.warningResponses || []).map(item => ({ 
        ...item, 
        type: 'warning_response', 
        icon: MessageCircle, // Different icon for responses
        is_warning_response: true // Flag to identify warning responses
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setAllNotifications(notifications);
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.name || user.user_metadata?.full_name || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title?.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
        book.department?.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
        book.status?.toLowerCase().includes(bookSearchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [books, bookSearchQuery]);

  // Get user's books when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const selectedUserId = selectedUser._id || selectedUser.id;
      const currentBooks = [...books];

      const userBooksList = currentBooks.filter(book => {
        const bookSellerId = book.seller?._id || book.seller || book.sellerId;
        return bookSellerId === selectedUserId;
      });

      setUserBooks(userBooksList);
    } else {
      setUserBooks([]);
    }
  }, [selectedUser, books]);

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isSuspended: newStatus }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', response.status, errorData);
        throw new Error(`Failed to update user status: ${response.status}`);
      }

      setUsers(prev =>
        prev.map(user =>
          (user._id === userId || user.id === userId)
            ? { ...user, isSuspended: newStatus }
            : user
        )
      );

      if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
        setSelectedUser(prev => ({ ...prev, isSuspended: newStatus }));
      }

      toast.success(
        `User ${newStatus ? 'suspended' : 'activated'} successfully`
      );

      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleWarningStatus = async (warning, newStatus, bookId) => {
    if (!warning?._id) {
      console.error("Warning ID missing:", warning);
      toast.error("Invalid warning ID");
      return;
    }
    try {
      const response = await fetch(`/api/admin/warnings/${warning._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update warning: ${response.status}`);
      }

      if (warning.bookId) {
        await handleBookVisibilityChange(bookId._id, false);
      }

      toast.success("Warning resolved successfully");
      fetchRecentActivity();
    } catch (error) {
      console.error("Error resolving warning:", error);
      toast.error("Failed to resolve warning");
    }
  };

  const handleBookVisibilityChange = async (bookId, isHidden, reason = '') => {
    try {
      const response = await fetch(`/api/admin/books?bookId=${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isHidden: isHidden,
          hiddenReason: isHidden ? reason : ''
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update book status: ${response.status}`);
      }

      setBooks(prev => prev.map(book =>
        (book._id === bookId || book.id === bookId) ? {
          ...book,
          isHidden: isHidden,
          hiddenReason: isHidden ? reason : ''
        } : book
      ));
    } catch (error) {
      console.error('Error updating book status:', error);
      toast.error('Failed to update book status');
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const response = await fetch(`/api/books?bookId=${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book: ${response.status}`);
      }

      setBooks(prev => prev.filter(book =>
        book._id !== bookId && book.id !== bookId
      ));

      setDeleteBookModal(false);
      setSelectedBook(null);
      toast.success('Book deleted successfully');

      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleSendWarning = async (sellerId, bookId) => {
    try {
      const response = await fetch('/api/admin/warnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: sellerId,
          bookId: bookId,
          message: hideBookReason,
          severity: "medium",
        }),

      });
      if (!response.ok) {
        throw new Error(`Failed to send warning: ${response.status}`);
      }

      setWarningModal(false);
      setWarningForm({ userId: '', message: '', severity: 'low' });

      fetchRecentActivity();
    } catch (error) {
      console.error('Error sending warning:', error);
      toast.error('Failed to send warning');
    }
  };

  const handleSendWarningdemo = async () => {
    try {
      if (!warningForm.userId || !warningForm.message.trim()) {
        toast.error("Please select a user and enter a warning message");
        return;
      }

      const response = await fetch('/api/admin/warnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: warningForm.userId,
          message: warningForm.message,
          severity: warningForm.severity,
          bookId: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send warning: ${response.status}`);
      }

      toast.success("Warning sent successfully");

      setWarningModal(false);
      setWarningForm({ userId: '', message: '', severity: 'low' });

      fetchRecentActivity();
    } catch (error) {
      console.error("Error sending warning:", error);
      toast.error("Failed to send warning");
    }
  };

  const openDeleteBookModal = (book) => {
    setSelectedBook(book);
    setDeleteBookModal(true);
  };

  const handleHideBookWithReason = async (book, reason) => {
    if (!book || !reason.trim()) {
      toast.error('Please provide a valid reason for hiding the book');
      return;
    }

    try {
      await handleBookVisibilityChange(book._id, true, reason);

      const sellerId = book.seller?._id || book.seller || book.sellerId;

      if (!sellerId) {
        throw new Error('No seller ID found for this book');
      }

      await handleSendWarning(sellerId, book._id);

      toast.success('Book hidden and user notified successfully');
      setHideBookModal(false);
      setHideBookReason('');
      setSelectedBook(null);

      fetchRecentActivity();
    } catch (error) {
      console.error('Error hiding book:', error);
      toast.error('Failed to hide book');
    }
  };

  const handleShowBook = async (book) => {
    try {
      await handleBookVisibilityChange(book._id, false);
      const sellerId = book.seller?._id || book.seller || book.sellerId;
      if (sellerId) {
        await resolveWarningsForBook(sellerId, book._id);
      }
      toast.success('Book is now visible on the website');
    } catch (error) {
      console.error('Error showing book:', error);
      toast.error('Failed to show book');
    }
  };

  const resolveWarningsForBook = async (sellerId, bookId) => {
    try {
      const response = await fetch('/api/admin/warnings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: sellerId,
          bookId: bookId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to delete warnings');
      }
    } catch (error) {
      console.error('Error deleting warnings:', error);
      throw error;
    }
  };

  const handleReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update report: ${response.status}`);
      }

      // Update local state
      setReports(prev => prev.map(report => 
        report._id === reportId ? { ...report, status: newStatus } : report
      ));
      
      // Clear selected report if it was resolved
      if (newStatus === 'resolved') {
        setSelectedReport(null);
      }

      toast.success("Report status updated successfully");
      fetchRecentActivity();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report status");
    }
  };

  const handleViewDetails = (warning) => {
    setSelectedWarning(warning);
    setIsDialogOpen(true);
  };

  const openReportDialog = (report) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  const markNotificationAsRead = async (notificationId, type) => {
    try {
      await fetch(`/api/admin/notifications/${type}/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });

      setAllNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

//   const markNotificationAsRead = async (notificationId, type) => {
//   try {
//     // For warning responses, we need to use a different endpoint
//     if (type === 'warning_response') {
//       await fetch(`/api/admin/warnings/${notificationId}/mark-read`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       });
//     } else {
//       await fetch(`/api/admin/notifications/${type}/${notificationId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ is_read: true })
//       });
//     }

//     setAllNotifications(prev =>
//       prev.map(n =>
//         n._id === notificationId 
//           ? { 
//               ...n, 
//               is_read: true,
//               ...(type === 'warning_response' && { admin_read: true }) 
//             } 
//           : n
//       )
//     );
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//   }
// };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => {
        if (!prev[field]) return prev;
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOpen(false);

      alert('Password changed successfully!');

    } catch (error) {
      setErrors({ submit: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const allItems = [
    ...warnings.map(warning => ({ ...warning, type: 'warning' })),
    ...reports.map(report => ({ ...report, type: 'report' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all") {
        if (item.type === "warning" && (statusFilter === "resolved") !== item.isResolved) return false;
        if (item.type === "report" && item.status !== statusFilter) return false;
      }
      if (
        searchTerm &&
        !(
          item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.reporterName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });
  }, [allItems, typeFilter, statusFilter, searchTerm]);

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 opacity-20"></div>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-lg font-medium text-slate-700 animate-pulse">
                Loading admin data
              </p>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewContent recentActivity={recentActivity} dashboardStats={dashboardStats} />;
      case 'users':
        return <UsersContent
          users={filteredUsers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fetchUsers={fetchUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          userBooks={userBooks}
          handleUserStatusChange={handleUserStatusChange}
          setWarningForm={setWarningForm}
          setWarningModal={setWarningModal}
          books={books}
        />;
      case 'books':
        return <BooksContent
          books={filteredBooks}
          bookSearchQuery={bookSearchQuery}
          setBookSearchQuery={setBookSearchQuery}
          fetchBooks={fetchBooks}
          users={users}
          setSelectedBook={setSelectedBook}
          setHideBookModal={setHideBookModal}
          handleShowBook={handleShowBook}
          openDeleteBookModal={openDeleteBookModal}
          loading={loading}
        />;
      case 'reports':
        return <ReportsContent
          warnings={warnings}
          reports={reports}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filteredItems={filteredItems}
          handleViewDetails={handleViewDetails}
          openReportDialog={openReportDialog}
          handleUserStatusChange={handleUserStatusChange}
          handleWarningStatus={handleWarningStatus}
          handleReportStatus={handleReportStatus}
        />;
      case 'settings':
        return <SettingsContent
          open={open}
          setOpen={setOpen}
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          errors={errors}
          setErrors={setErrors}
          handlePasswordChange={handlePasswordChange}
          validateForm={validateForm}
          handleSubmitPassword={handleSubmitPassword}
          closeDialog={closeDialog}
          fetchAllData={fetchAllData}
          loading={loading}
        />;
      default:
        return <OverviewContent recentActivity={recentActivity} dashboardStats={dashboardStats} />;
    }
  };

  if (isVerifying || shouldRedirect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-900">Verifying admin access...</p>
          <p className="mt-2 text-sm text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isMobile={isMobile}
        users={users}
        books={books}
        dashboardStats={dashboardStats}
        setSelectedUser={setSelectedUser}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          isMobile={isMobile}
          setMobileMenuOpen={setMobileMenuOpen}
          fetchAllData={fetchAllData}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          allNotifications={allNotifications}
          unreadCount={unreadCount}
          markNotificationAsRead={markNotificationAsRead}
          markAllAsRead={markAllAsRead}
          userDropdownOpen={userDropdownOpen}
          setUserDropdownOpen={setUserDropdownOpen}
          avatarUrl={avatarUrl}
          user={user}
          router={router}
          handleSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === 'overview' && <AdminStats dashboardStats={dashboardStats} />}
          {renderMainContent()}
        </main>
      </div>

      {/* Modals */}
      <DeleteBookModal
        deleteBookModal={deleteBookModal}
        setDeleteBookModal={setDeleteBookModal}
        selectedBook={selectedBook}
        handleDeleteBook={handleDeleteBook}
      />

      <HideBookModal
        hideBookModal={hideBookModal}
        setHideBookModal={setHideBookModal}
        hideBookReason={hideBookReason}
        setHideBookReason={setHideBookReason}
        selectedBook={selectedBook}
        handleHideBookWithReason={handleHideBookWithReason}
      />

      <WarningModal
        warningModal={warningModal}
        setWarningModal={setWarningModal}
        warningForm={warningForm}
        setWarningForm={setWarningForm}
        handleSendWarningdemo={handleSendWarningdemo}
      />

      <WarningDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedWarning={selectedWarning}
        handleWarningStatus={handleWarningStatus}
      />

      <ReportDialog
        isReportDialogOpen={isReportDialogOpen}
        setIsReportDialogOpen={setIsReportDialogOpen}
        selectedReport={selectedReport}
        handleReportStatus={handleReportStatus}
      />
    </div>
  );
};

export default AdminDashboard;