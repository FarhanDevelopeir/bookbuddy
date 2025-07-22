"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client'
import OverviewPage from '@/components/Dashboard/OverviewPage';
import MyBook from '@/components/Dashboard/MyBook';
import AuthRequiredCard from '@/components/Dashboard/AuthRequiredCard';
import { Package, Search } from 'lucide-react';
import LoadingScreen from '@/components/Dashboard/LoadingScreen';
import Sidebar from '@/components/Dashboard/Sidebar';
import AddBook from '@/components/Dashboard/AddBook';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
import { useAuth } from "@/components/AuthProvider";

const Dashboard = () => {

    const router = useRouter();
    const [user, setUser] = useState(null);

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
    const [uploadingImages, setUploadingImages] = useState(false);

    console.log("user in dashboard", user);

    const [bookForm, setBookForm] = useState({
        title: '',
        price: '',
        description: '',
        condition: 'New',
        category: 'First Year',
        status: 'Available',
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
    }, [])

    useEffect(() => {
        if (user?.user_metadata?.picture) {
            setAvatarUrl(user.user_metadata.picture);
        }
        console.log("user comes", user);

    }, [user]);

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
        setTimeout(() => {
            if (!user) {
                return (
                    <AuthRequiredCard />
                );
            }
        }, 1000);
    }, []);

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
    const removeImage = async (index) => {
        const imageToRemove = bookForm.images[index];

        if (imageToRemove.publicId) {
            try {
                const response = await fetch(`/api/upload?publicId=${imageToRemove.publicId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    console.error('Failed to delete image from Cloudinary');
                }
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

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
        if (!bookForm.title || !bookForm.price || !bookForm.description || !bookForm.category || !bookForm.condition) {
            alert('Please fill all required filed');
            return;
        }
        const imageURLs = bookForm.images.map(image => image.url || '');
        try {
            const imageURLs = bookForm.images.map(image => image.url || '');

            const newBookData = {
                title: bookForm.title,
                price: parseFloat(bookForm.price),
                category: bookForm.category,
                condition: bookForm.condition,
                description: bookForm.description,
                pictures: imageURLs,
                thumbnailIndex: bookForm.thumbnailIndex,
                sellerId: user.id,
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

                setBookForm({
                    title: '',
                    price: '',
                    description: '',
                    condition: 'New',
                    category: 'First Year',
                    status: 'Available',
                    images: [],
                    thumbnailIndex: 0,
                })

                await fetchUserData();
                toast("Book added successfully!")

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
            console.log(response);
            if (response.ok) {

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

        const existingImages = book.pictures ? book.pictures.map(url => {
            const publicId = url.includes('cloudinary.com') ?
                url.split('/').pop().split('.')[0] : null;

            return {
                url: url,
                publicId: publicId
            };
        }) : [];

        setBookForm(prev => ({
            ...prev,
            title: book.title,
            price: book.price,
            description: book.description,
            category: book.category,
            condition: book.condition,
            status: book.status,
            images: existingImages,
            thumbnailIndex: book.thumbnailIndex || 0
        }));
        setEditDialogOpen(true);
    };

    const handleUnifiedImageUpload = async (event) => {
        const files = Array.from(event.target.files);

        if (!files.length) {
            console.log('No files selected');
            return;
        }

        if (bookForm.images.length + files.length > 3) {
            alert('Maximum 3 images allowed');
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

            handleFormChange('images', [...bookForm.images, ...uploadedImages]);

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
        router.push('profile');
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
                        setActiveTab={setActiveTab}
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