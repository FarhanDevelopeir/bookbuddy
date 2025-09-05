"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client'
import OverviewPage from '@/components/Dashboard/OverviewPage';
import MyBook from '@/components/Dashboard/MyBook';
import { Package, Search, Menu, X, UserCircle } from 'lucide-react';
import Sidebar from '@/components/Dashboard/Sidebar';
import AddBook from '@/components/Dashboard/AddBook';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import {
    User, BookOpen,
    LogOut,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import getImageSrc from '@/utils/getImageSrc';

const Dashboard = () => {

    const router = useRouter();
    const [user, setUser] = useState(null);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    const [uploadingImages, setUploadingImages] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const [mongoUserData, setMongoUserData] = useState(null)


    useEffect(() => {
        const getUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                const mongoUser = await fetchMongoUserData(currentUser.id);
                const avatarSource = getAvatarSource(currentUser, mongoUser);
                setAvatarUrl(avatarSource);
                fetchUserRole(currentUser.id);
            }
        }
        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                const mongoUser = await fetchMongoUserData(currentUser.id);

                const avatarSource = getAvatarSource(currentUser, mongoUser);
                setAvatarUrl(avatarSource);

                fetchUserRole(currentUser.id);
            } else {
                setUserRole(null);
                setMongoUserData(null);
                setAvatarUrl(null);
            }
        })
        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    const fetchUserRole = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                setUserRole(userData.role);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    }

    useEffect(() => {
        if (!user?.id) return;

        const fetchWarnings = async () => {
            try {
                const res = await fetch(`/api/admin/warnings?userId=${user.id}`);
                if (!res.ok) throw new Error("Failed to fetch warnings");
                const data = await res.json();
                setWarnings(data);
            } catch (err) {
                console.error("Warning fetch error:", err);
                setWarnings([]);
            }
        };

        fetchWarnings();
    }, [user]);

    const fetchMongoUserData = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                setMongoUserData(userData);
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching MongoDB user data:', error);
            return null;
        }
    }

    const getAvatarSource = (supabaseUser, mongoUser) => {
        if (mongoUser?.dp) {
            return mongoUser.dp;
        }

        if (supabaseUser?.user_metadata?.picture) {
            return supabaseUser.user_metadata.picture;
        }

        return null;
    }



    const [bookForm, setBookForm] = useState({
        title: '',
        price: '',
        description: '',
        year: '',
        condition: '',
        department: '',
        status: '',
        images: [],
        thumbnailIndex: 0,
    });

    // Close mobile menu when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuOpen && !event.target.closest('.mobile-sidebar')) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen]);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
        if (user?.id && dashboardStats === null) {
            fetchUserData();
        }
    }, [user]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book =>
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    }, [searchQuery, books]);

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
        const newImages = bookForm.images.filter((_, i) => i !== index);

        let newThumbnailIndex = bookForm.thumbnailIndex;
        if (index === bookForm.thumbnailIndex) {
            newThumbnailIndex = 0;
        } else if (index < bookForm.thumbnailIndex) {
            newThumbnailIndex = bookForm.thumbnailIndex - 1;
        }

        setBookForm(prev => ({
            ...prev,
            images: newImages,
            thumbnailIndex: Math.max(0, Math.min(newThumbnailIndex, newImages.length - 1))
        }));
    };


    const handleSubmitBook = async () => {
        if (!user?.id) {
            alert('User not authticated');
            return;
        }
        if (!bookForm.title || !bookForm.price || !bookForm.description || !bookForm.department || !bookForm.year || !bookForm.condition) {
            alert('Please fill all required filed');
            return;
        }
        try {
            const pictures = bookForm.images.map(image => ({
                url: image.url,
                public_id: image.publicId || image.public_id
            }));

            const newBookData = {
                title: bookForm.title,
                price: parseFloat(bookForm.price),
                department: bookForm.department,
                year: bookForm.year,
                condition: bookForm.condition,
                description: bookForm.description,
                pictures,
                thumbnailIndex: bookForm.thumbnailIndex,
                sellerId: user.id,
            };
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBookData),
            })

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
                return;
            }

            setBookForm({
                title: '',
                price: '',
                description: '',
                condition: '',
                department: '',
                status: '',
                year: '',
                images: [],
                thumbnailIndex: 0,
            })

            await fetchUserData();
            toast("Book added successfully!")

            setActiveTab('books');

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
            if (bookForm.department) updateData.department = bookForm.department;
            if (bookForm.condition) updateData.condition = bookForm.condition;
            if (bookForm.status) updateData.status = bookForm.status;

            if (bookForm.images && bookForm.images.length > 0) {
                const imageURLs = bookForm.images.map(image => {
                    if (typeof image === 'string') return image;
                    if (image.url) return image.url;
                    return '';
                }).filter(url => url !== '');

                updateData.pictures = imageURLs;
                updateData.thumbnailIndex = bookForm.thumbnailIndex;
            }

            const response = await fetch(`/api/books?bookId=${selectedBook._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            if (response.ok) {

                setBookForm({
                    title: '',
                    price: '',
                    description: '',
                    year: '',
                    condition: '',
                    department: '',
                    images: [],
                    thumbnailIndex: 0,
                });
                setEditDialogOpen(false);
                setSelectedBook(null);

                await fetchUserData();
                toast("Book updated successfully.")

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

    const handleDeleteBook = async (bookId) => {
        try {
            const response = await fetch(`/api/books?bookId=${bookId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchUserData();
                toast("Book deleted successfully.")
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting book: ', error);
            alert('Error deleting book. Please try again');
        }
    }

    const handleEditBook = (book) => {
        setSelectedBook(book);

        const existingImages = book.pictures
            ? book.pictures.map(pic => {
                const publicId = pic.public_id
                    ? pic.public_id
                    : pic.url.includes('cloudinary.com')
                        ? pic.url.split('/').pop().split('.')[0]
                        : null;

                return {
                    url: pic.url,
                    public_id: publicId
                };
            })
            : [];


        setBookForm(prev => ({
            ...prev,
            title: book.title,
            price: book.price,
            description: book.description,
            department: book.department,
            year: book.year,
            condition: book.condition,
            status: book.status,
            images: existingImages,
            thumbnailIndex: book.thumbnailIndex || 0
        }));
        setEditDialogOpen(true);
    };


    useEffect(() => {
        console.log('bookForm.images changed:', bookForm.images);
        bookForm.images.forEach((img, index) => {
            console.log(`Image ${index}:`, img);
            if (img && !img.url && typeof img !== 'string') {
                console.error(`Image ${index} has no URL:`, img);
            }
        });
    }, [bookForm.images]);

    const handleUnifiedImageUpload = async (eventOrFile, indexToReplace = null) => {
        let files = [];

        if (eventOrFile instanceof File) {
            files = [eventOrFile];
        } else if (eventOrFile && eventOrFile.target && eventOrFile.target.files) {
            files = Array.from(eventOrFile.target.files);
        } else {
            console.log('Invalid input to handleUnifiedImageUpload');
            return;
        }

        if (!files.length) {
            console.log('No files to upload');
            return;
        }

        setUploadingImages(true);
        const uploadedImages = [];

        try {
            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} is not an image file`);
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Upload failed for ${file.name}: ${response.status}`);
                }

                const result = await response.json();
                uploadedImages.push({
                    file: file,
                    url: result.url,
                    publicId: result.public_id
                });
            }

            let newImages;
            if (indexToReplace !== null && indexToReplace < bookForm.images.length) {
                newImages = [...bookForm.images];
                newImages[indexToReplace] = uploadedImages[0];
            } else {
                newImages = [...bookForm.images, ...uploadedImages];
            }

            handleFormChange('images', newImages);

        } catch (error) {
            console.error('Upload error:', error);
            alert(`Error uploading images: ${error.message}`);
        } finally {
            setUploadingImages(false);
        }
    };




    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleprofile = () => {
        router.push('Profile');
    }

    const handlemainpage = () => {
        router.push('/')
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
                        setBookForm={setBookForm}
                        bookForm={bookForm}
                        handleFormChange={handleFormChange}
                        handleFileUpload={handleUnifiedImageUpload}
                        setThumbnail={setThumbnail}
                        removeImage={removeImage}
                        handleSubmitBook={handleSubmitBook}
                        uploadingImages={uploadingImages}
                    />
                );
            case 'books':
                return (
                    <MyBook
                        filteredBooks={filteredBooks}
                        setActiveTab={handleTabChange}
                        handleEditBook={handleEditBook}
                        handleDeleteBook={handleDeleteBook}
                        editDialogOpen={editDialogOpen}
                        setEditDialogOpen={setEditDialogOpen}
                        bookForm={bookForm}
                        updatehandle={updatehandle}
                        handleFormChange={handleFormChange}
                        handleFileUpload={handleFileUpload}
                        setThumbnail={setThumbnail}
                        removeImage={removeImage}
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
        <div>
            {warnings.length > 0 && (
                <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-2 shadow-md  overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap flex items-center">
                        {warnings.map((w, i) => (
                            <span
                                key={i}
                                className="mx-8 flex items-center space-x-2 font-medium text-sm hover:opacity-90"
                            >
                                <span className="text-lg">
                                    {w.severity === "high" && "🚨"}
                                    {w.severity === "medium" && "⚠️"}
                                    {w.severity === "low" && "ℹ️"}
                                </span>
                                <span>
                                    {w.message}
                                    <span className="ml-2 text-xs opacity-80">
                                        ({w.severity.toUpperCase()})
                                    </span>
                                </span>
                            </span>
                        ))}
                    </div>
                    {/* gradient fade effect on edges */}
                    <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-red-600 to-transparent" />
                    <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-red-600 to-transparent" />
                </div>
            )}
            <div className="flex h-screen bg-gray-50">
                {/* Desktop Sidebar */}
                <div className="hidden md:block">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        activeTab={activeTab}
                        setActiveTab={handleTabChange}
                        handlemainpage={handlemainpage}
                    />
                </div>


                {/* Mobile Sidebar - always mounted */}
                <div className="fixed inset-0 z-50 md:hidden flex pointer-events-none">
                    {/* Soft overlay covering the whole page */}
                    <div
                        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300
      ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    {/* Sidebar */}
                    <div
                        className={`relative bg-white w-64 h-full shadow-2xl transform transition-transform duration-300 ease-in-out
      ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} pointer-events-auto`}
                    >
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <span
                                    className="font-bold text-xl text-gray-900 cursor-pointer"
                                    onClick={handlemainpage}
                                >
                                    Bookbuddy
                                </span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Sidebar links */}
                        <Sidebar
                            sidebarOpen={true}
                            setSidebarOpen={() => { }}
                            activeTab={activeTab}
                            setActiveTab={(tab) => {
                                handleTabChange(tab);
                                setMobileMenuOpen(false); // close sidebar after tab click
                            }}
                            handlemainpage={handlemainpage}
                            isMobile={true}
                        />
                    </div>
                </div>



                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Top Header */}
                    <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>

                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">
                                    {activeTab === 'addbook' ? 'Add Book' :
                                        activeTab === 'books' ? 'My Books' :
                                            activeTab === 'orders' ? 'Orders' : 'Overview'}
                                </h1>
                            </div>

                            <div className="flex items-center space-x-2 md:space-x-4">
                                {/* Search Bar - Hidden on small screens */}
                                {(activeTab === 'books' || activeTab === 'overview') && (
                                    <div className="relative hidden sm:block">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search books..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 w-48 md:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                {/* User Profile Dropdown */}
                                <DropdownMenu open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                                                {avatarUrl != null ? (
                                                    <img
                                                        className="w-full h-full object-cover"
                                                        src={getImageSrc(avatarUrl)}
                                                        alt="User Profile"
                                                    />) : (
                                                    <UserCircle className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-48 mt-2">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{mongoUserData?.name || user?.user_metadata?.full_name || 'User'}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer" onClick={handleprofile}>
                                            <User className="h-4 w-4" />
                                            <span>Profile</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="flex items-center space-x-2 text-red-600 cursor-pointer" onClick={handleSignOut}>
                                            <LogOut className="h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Mobile Search Bar - Show below header on small screens */}
                        {(activeTab === 'books') && (
                            <div className="mt-4 sm:hidden">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search books..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-auto p-4 md:p-6">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;