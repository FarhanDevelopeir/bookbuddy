'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import getImageSrc from '@/utils/getImageSrc';
import { useChat } from '@/contexts/ChatContext';

const BookDetailsModal = ({ isOpen, onClose, book }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { openChatWithUser } = useChat();

    React.useEffect(() => {
        if (isOpen && book) {
            setSelectedImageIndex(0);
        }
    }, [isOpen, book]);

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };

     const handleContactSeller = () => {
        if (book.seller) {
            // Open chat with the seller
            openChatWithUser({
                _id: book.seller._id || book.seller.id,
                name: book.seller.name,
                email: book.seller.email,
                dp: book.seller.profilePicture || '',
                major: book.seller.major || '',
                collegeName: book.seller.collegeName || ''
            });
        }
        onClose(); // Close the modal
    };

    if (!book) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-3xl !w-[95vw] sm:!w-[90vw] max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="p-4 sm:p-6 sm:pb-0 pb-0">
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Book Details</DialogTitle>
                        <DialogDescription className="sr-only">
                            View detailed information about the selected book including images, price, condition, and description.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="p-4 sm:p-6 sm:pt-0 pt-0">
                    {/* Mobile Layout */}
                    <div className="block lg:hidden space-y-4">
                        {/* Mobile Image Section */}
                        <div className="space-y-3">
                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <div className="h-full w-full bg-white rounded-lg overflow-hidden">
                                    <img
                                        src={getImageSrc(book.pictures?.[selectedImageIndex] || book.pictures?.[0] || "")}
                                        alt={book.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-book.jpg';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Mobile Thumbnail Images */}
                            {book.pictures && book.pictures.length > 1 && (
                                <div className="flex space-x-2 justify-center overflow-x-auto pb-1">
                                    {book.pictures.slice(0, 3).map((picture, index) => (
                                        <div
                                            key={index}
                                            className={`relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${selectedImageIndex === index
                                                ? 'ring-2 ring-purple-600'
                                                : 'hover:ring-2 hover:ring-purple-400'
                                                }`}
                                            onClick={() => handleThumbnailClick(index)}
                                        >
                                            <div className="h-full w-full bg-white rounded overflow-hidden">
                                                <img
                                                    src={getImageSrc(picture)}
                                                    alt={`${book.title} ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-book.jpg';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile Book Details */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h1>
                                {book.author && (
                                    <p className="text-sm text-gray-600">by {book.author}</p>
                                )}
                            </div>

                            {/* Mobile Info Grid */}
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-col justify-start gap-5">
                                    <div>
                                        <p className="text-xs text-gray-500">Price:</p>
                                        <p className="text-lg font-bold text-green-600">Rs. {book.price}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500">Year:</p>
                                        <p className="text-sm font-medium text-gray-">{book.department}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-start gap-5 mr-15">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Condition:</p>
                                        <p className="text-sm font-medium text-gray-900 mr-10 text-start">{book.condition}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500 mt-2">Seller:</p>
                                        <p className="text-sm font-medium text-gray-900 text-start">{book.seller?.name || 'Umair'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Description */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Description:</p>
                                <div
                                    className="bg-white border p-4 rounded-lg text-gray-700 leading-relaxed  overflow-y-auto overscroll-contain h-28 sm:h-36 md:h-44 lg:h-25"
                                    style={{
                                        WebkitOverflowScrolling: 'touch',
                                        overflowX: 'hidden',
                                        touchAction: 'auto',
                                    }}
                                >
                                    <div className="whitespace-pre-wrap break-words">
                                        {book.description}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Buttons */}
                            <div className="flex space-x-3 pt-2">
                                <Button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 text-sm hover:bg-gray-400 transition-colors"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 text-white text-sm py-2 transition-all duration-200 ${book.status === 'Sold'
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : book.status === 'Reserved'
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                        }`}
                                    disabled={book.status === 'Sold'}
                                     onClick={handleContactSeller} 
                                >
                                    {book.status === 'Sold'
                                        ? 'Sold Out'
                                        : book.status === 'Reserved'
                                            ? 'Reserved - Contact Seller'
                                            : 'Contact to Seller'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Left Column - Images */}
                        <div className="space-y-4 order-1 lg:order-1">
                            <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden">
                                <div className="h-full w-full bg-white rounded-lg overflow-hidden">
                                    <img
                                        src={getImageSrc(book.pictures?.[selectedImageIndex] || book.pictures?.[0] || "")}
                                        alt={book.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-book.jpg';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Thumbnail Images */}
                            {book.pictures && book.pictures.length > 1 && (
                                <div className="flex space-x-2 sm:space-x-3 justify-center items-center overflow-x-auto pb-2">
                                    {book.pictures.slice(0, 3).map((picture, index) => (
                                        <div
                                            key={index}
                                            className={`relative h-16 w-16 sm:h-18 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${selectedImageIndex === index
                                                ? 'ring-2 ring-purple-600'
                                                : 'hover:ring-2 hover:ring-purple-400'
                                                }`}
                                            onClick={() => handleThumbnailClick(index)}
                                        >
                                            <div className="h-full w-full bg-white rounded overflow-hidden">
                                                <img
                                                    src={getImageSrc(picture)}
                                                    alt={`${book.title} ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-book.jpg';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Book Details */}
                        <div className="space-y-4 sm:space-y-6 order-2 lg:order-2 w-full lg:w-80">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                                {book.author && (
                                    <p className="text-lg sm:text-xl text-gray-600">by {book.author}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Price:</p>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">{book.price}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Condition:</p>
                                    <p className="font-medium text-gray-900">{book.condition}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Department:</p>
                                    <p className="font-medium text-gray-900">{book.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Seller:</p>
                                    <p className="font-medium text-gray-900">{book.seller?.name}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Description:</p>
                                <div
                                    className="bg-white border p-4 rounded-lg text-gray-700 leading-relaxed  overflow-y-auto overscroll-contain h-28 sm:h-36 md:h-44 lg:h-25"
                                    style={{
                                        WebkitOverflowScrolling: 'touch',
                                        overflowX: 'hidden',
                                        touchAction: 'auto',
                                    }}
                                >
                                    <div className="whitespace-pre-wrap break-words">
                                        {book.description}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-0">
                                <Button
                                    className="bg-gray-300 text-gray-700 px-4 sm:px-6 hover:bg-gray-400 transition-colors order-2 sm:order-1"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 text-white transition-all duration-200 order-1 sm:order-2 ${book.status === 'Sold'
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : book.status === 'Reserved'
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                        }`}
                                    disabled={book.status === 'Sold'}
                                >
                                    {book.status === 'Sold'
                                        ? 'Sold Out'
                                        : book.status === 'Reserved'
                                            ? 'Reserved - Contact Seller'
                                            : 'Contact Seller'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookDetailsModal;