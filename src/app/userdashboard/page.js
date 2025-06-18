"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client'
import OverviewPage from '@/components/Dashboard/OverviewPage';
import MyBook from '@/components/Dashboard/MyBook';
import AuthRequiredCard from '@/components/Dashboard/AuthRequiredCard';
import { Package,Search } from 'lucide-react';
import LoadingScreen from '@/components/Dashboard/LoadingScreen';
import Sidebar from '@/components/Dashboard/Sidebar';
import AddBook from '@/components/Dashboard/AddBook';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/AuthProvider";

const Dashboard = () => {

    const router = useRouter();
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [user1, setUser] = useState(null);

    const [bookForm, setBookForm] = useState({
        title: '',
        price: '',
        description: '',
        condition: 'New',
        category: 'First Year',
        status:'Available',
        images: [],
        thumbnailIndex: 0,
    });

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser?.user_metadata?.picture) {
                setAvatarUrl(currentUser.user_metadata.picture)
            }
        }
        getUser();
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser?.user_metadata?.picture) {
                setAvatarUrl(currentUser.user_metadata.picture)
            }
        })
        return () => {
            listener.subscription.unsubscribe()
        }
    }, []);

    const fetchUserData = async () => {
        if (!user?.id) return;

        setLoadingData(true);
        try {
            const [booksResponse, statsResponse] = await Promise.all([
                fetch(`/api/books?sellerId=${user.id}`),
                fetch(`/api/dashboard/stats?sellerId=${user.id}`)
            ]);

            if (!booksResponse.ok) {
                throw new Error(`Books API failed: ${booksResponse.status}`);
            }
            if (!statsResponse.ok) {
                throw new Error(`Stats API failed: ${statsResponse.status}`);
            }

            const [booksData, statsData] = await Promise.all([
                booksResponse.json(),
                statsResponse.json()
            ]);

            setBooks(booksData);
            setDashboardStats(statsData);
        } catch (error) {
            console.error('Fetch error:', error);
            // Set fallback state
            setBooks([]);
            setDashboardStats({
                totalBooks: 0,
                totalSales: '$0',
                activeOrders: 0,
                profileViews: 0
            });
        } finally {
            setLoadingData(false);
        }
    };


    useEffect(() => {
        if (user?.id) {
            fetchUserData();
        }
    }, [user]);

    // Search functionality
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book =>
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    }, [searchQuery, books]);

    // Form handlers
    const handleFormChange = (field, value) => {
        setBookForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (bookForm.images.length + files.length > 3) {
            alert('Maximum 3 images allowed');
            return;
        }
        setBookForm(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const setThumbnail = (index) => {
        setBookForm(prev => ({
            ...prev,
            thumbnailIndex: index
        }));
    };
    const removeImage = (index) => {
        setBookForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    //create new book
    const handleSubmitBook = async () => {
        if (!user1?.id) {
            alert('User not authticated');
            return;
        }
        if (!bookForm.title || !bookForm.price || !bookForm.description || !bookForm.category || !bookForm.condition) {
            alert('Please fill all required filed');
            return;
        }
        try {
            const imageURLs = bookForm.images.map((_, index) =>
                `https://via.placeholder.com/300x200?text=Book+Image+${index + 1}`
            );

            const newBookData = {
                title: bookForm.title,
                price: parseFloat(bookForm.price),
                category: bookForm.category,
                condition: bookForm.condition,
                description: bookForm.description,
                pictures: imageURLs,
                sellerId: user1.id,
            };
            console.log('Sending book data:', newBookData);
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBookData),
            })

            if (response.ok) {
                const createdBook = await response.json();
                console.log('Created book:', createdBook);

                //Reset form
                setBookForm({
                    title: '',
                    price: '',
                    description: '',
                    condition: 'New',
                    category: 'First Year',
                    status:'Available',
                    images: [],
                    thumbnailIndex: 0,
                })

                await fetchUserData();

                alert('Book added successfully!');
                setActiveTab('books');
            }
            else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        }
        catch (error) {
            console.error('Error creating book: ', error);
            alert('Error creating book.Please try again');
        }
    };

    const updatehandle = async () => {
        if (!selectedBook) return;
        try {
            const updateData = {};
            if (bookForm.title) updateData.title = bookForm.title;
            if (bookForm.price) updateData.price = parseFloat(bookForm.price);
            if (bookForm.description) updateData.description = bookForm.description;
            if (bookForm.category) updateData.category = bookForm.category;
            if (bookForm.condition) updateData.condition = bookForm.condition;
            if(bookForm.status) updateData.status = bookForm.status;

            const response = await fetch(`/api/books?bookId=${selectedBook._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            console.log(response);
            if (response.ok) {
                //Reset form
                setBookForm({
                    title: '',
                    price: '',
                    description: '',
                    condition: 'New',
                    category: 'First Year',
                    images: [],
                    thumbnailIndex: 0,
                });
                setEditDialogOpen(false);
                setSelectedBook(null);

                await fetchUserData();

                alert('Book updated successfully');
            }
            else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        }
        catch (error) {
            console.error('Error updating book:', error);
            alert('Error updating book. Please try again.');
        }
    }

    // delete book
    const handleDeleteBook = async (bookId) => {
        try {
            const response = await fetch(`/api/books?bookId=${bookId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchUserData();
                alert('Book deleted successfully');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting book: ', error);
            alert('Error deleting book. Please try again');
        }
    }

    // edit book
    const handleEditBook = (book) => {
        setSelectedBook(book);
        setBookForm(prev => ({
            ...prev,
            title: book.title,
            price: book.price,
            description: book.description,
            category: book.category,
            condition: book.condition,
            status: book.status
        }));
        setEditDialogOpen(true);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleprofile = () => {
        router.push('profile');
    }

    const handlemainpage = () => {
        router.push('/')
    }
  

    if (loading || (user === undefined)) {
        return (
            <LoadingScreen />
        );
    }

    if (!user) {
        return (
            <AuthRequiredCard />
        );
    }

    const renderContent = () => {
        if (loadingData) {
            return (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 opacity-20"></div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 animate-pulse">
                                Loading your data
                            </p>
                            <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>

                        {/* Optional progress indicator */}
                        <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            );
        }
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewPage
                        books={books}
                        filteredBooks={filteredBooks}
                        dashboardStats={dashboardStats}
                    />)
            case 'addbook':
                return (
                    <AddBook 
                        bookForm={bookForm}
                        handleFormChange={handleFormChange}
                        handleFileUpload={handleFileUpload}
                        setThumbnail={setThumbnail}
                        removeImage={removeImage}
                        handleSubmitBook={handleSubmitBook}
                    />
                );
            case 'books':
                return (
                   <MyBook 
                    filteredBooks={filteredBooks}
                    setActiveTab={setActiveTab}
                    handleEditBook={handleEditBook}
                    handleDeleteBook={handleDeleteBook}
                    editDialogOpen={editDialogOpen}
                    setEditDialogOpen={setEditDialogOpen}
                    bookForm={bookForm}
                    updatehandle={updatehandle}
                    handleFormChange={handleFormChange}
                   />
                );
            default:
                return (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="text-gray-400 mb-4">
                                <Package className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Page Not Found</h3>
                            <p className="text-gray-600">The requested page could not be found.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">

            <Sidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userDropdownOpen={userDropdownOpen}
                setUserDropdownOpen={setUserDropdownOpen}
                avatarUrl={avatarUrl}
                handleSignOut={handleSignOut}
                handleprofile={handleprofile}
                handlemainpage={handlemainpage}
            />


            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900 capitalize">
                                {activeTab === 'addbook' ? 'Add Book' :
                                    activeTab === 'books' ? 'My Books' :
                                        activeTab === 'orders' ? 'Orders' : 'Overview'}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search Bar */}
                            {(activeTab === 'books' || activeTab === 'overview') && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search books..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* User Profile */}
                            <div className="w-10 h-10  rounded-full flex items-center justify-center">
                                <img
                                    className="w-10 h-10 rounded-full"
                                    src={avatarUrl || '/image.avif'}
                                    alt="User Profile"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
export default Dashboard;