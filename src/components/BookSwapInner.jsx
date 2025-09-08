"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import BookDetailsModal from '@/components/BookDetailsModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import getImageSrc from '@/utils/getImageSrc';

const BookSwapInner = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selecteddepartment, setSelecteddepartment] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const ITEMS_PER_PAGE = 12;
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const yearOptions = ['All', 'First Year', 'Second Year', 'Third Year'];
  const conditionOptions = ['All', 'New', 'Like New', 'Good', 'Fair'];
  const departmentOptions = ['All', 'General', 'Mechanical', 'Auto & Diesel', 'Civil', 'Quantity Survey', 'ICT'];

  const getConditionBadgeStyle = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'sold':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'like new':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'good':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'fair':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleBookClick = (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBook(book);
    setSelectedImageIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setSelectedImageIndex(0);
  };


  // Initialize filters from URL parameters
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const yearParam = searchParams.get("year");
    const departmentParam = searchParams.get("department");
    const conditionParam = searchParams.get("condition");
    const searchParam = searchParams.get("search");

    if (filterParam && yearOptions.includes(filterParam)) {
      setSelectedYear(filterParam);
    }
    if (yearParam && yearOptions.includes(yearParam)) {
      setSelectedYear(yearParam);
    }
    if (departmentParam && departmentOptions.includes(departmentParam)) {
      setSelecteddepartment(departmentParam);
    }
    if (conditionParam && conditionOptions.includes(conditionParam)) {
      setSelectedCondition(conditionParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Fetch all books once on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/books?select=all');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Books: ', data);
          setBooks(Array.isArray(data) ? data : []);
        } else {
          throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Apply all filters to the books (frontend filtering)
  const getFilteredBooks = () => {
    let filtered = books;

    filtered = filtered.filter(
      (book) => book.status !== "Sold" && !book.isHidden
    );

    if (selectedYear !== 'All') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(book => {
        const yearMatch = book.year === selectedYear;
        return yearMatch;
      });
    }

    if (selecteddepartment !== 'All') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(book => {
        const deptMatch = book.department === selecteddepartment;
        return deptMatch;
      });
    }

    if (selectedCondition !== 'All') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(book => {
        const conditionMatch = book.condition === selectedCondition;
        return conditionMatch;
      });
    }

    if (searchQuery.trim()) {
      const beforeCount = filtered.length;
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.subject?.toLowerCase().includes(query) ||
        book.department?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const filteredBooks = getFilteredBooks();
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const updateUrlParams = () => {
    const params = new URLSearchParams();

    if (selectedYear !== 'All') params.set("year", selectedYear);
    if (selecteddepartment !== 'All') params.set("department", selecteddepartment);
    if (selectedCondition !== 'All') params.set("condition", selectedCondition);
    if (searchQuery.trim()) params.set("search", searchQuery);
    params.set("page", "1");

    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      const currentPath = window.location.pathname;
      router.push(`${currentPath}?${params.toString()}`, { scroll: false });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 1) return pages;

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      end = Math.min(4, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(totalPages - 3, 2);
    }

    if (start > 2) {
      pages.push("ellipsis-left");
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis-right");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleSearch = () => {
    updateUrlParams();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    // Update URL params after state change
    setTimeout(() => {
      const params = new URLSearchParams();
      if (year !== 'All') params.set("year", year);
      if (selecteddepartment !== 'All') params.set("department", selecteddepartment);
      if (selectedCondition !== 'All') params.set("condition", selectedCondition);
      if (searchQuery.trim()) params.set("search", searchQuery);
      params.set("page", "1");

      const currentPath = window.location.pathname;
      router.push(`${currentPath}?${params.toString()}`, { scroll: false });
    }, 0);
  };

  const handleDepartmentChange = (department) => {
    setSelecteddepartment(department);
    // Update URL params after state change
    setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedYear !== 'All') params.set("year", selectedYear);
      if (department !== 'All') params.set("department", department);
      if (selectedCondition !== 'All') params.set("condition", selectedCondition);
      if (searchQuery.trim()) params.set("search", searchQuery);
      params.set("page", "1");

      const currentPath = window.location.pathname;
      router.push(`${currentPath}?${params.toString()}`, { scroll: false });
    }, 0);
  };

  const handleConditionChange = (condition) => {
    setSelectedCondition(condition);
    // Update URL params after state change
    setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedYear !== 'All') params.set("year", selectedYear);
      if (selecteddepartment !== 'All') params.set("department", selecteddepartment);
      if (condition !== 'All') params.set("condition", condition);
      if (searchQuery.trim()) params.set("search", searchQuery);
      params.set("page", "1");

      const currentPath = window.location.pathname;
      router.push(`${currentPath}?${params.toString()}`, { scroll: false });
    }, 0);
  };

  const yearDisplayText = selectedYear === 'All' ? 'Year' : selectedYear;
  const departmentDisplayText = selecteddepartment === 'All' ? 'Department' : selecteddepartment;
  const conditionDisplayText = selectedCondition === 'All' ? 'Condition' : selectedCondition;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedYear('All');
    setSelecteddepartment('All');
    setSelectedCondition('All');
    const currentPath = window.location.pathname;
    router.push(currentPath, { scroll: false });
  };

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Navbar />
        <div className="bg-white flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Books</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const hasActiveFilters = selectedYear !== 'All' || selecteddepartment !== 'All' || selectedCondition !== 'All' || searchQuery.trim();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Browse Books</h2>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:items-end items-stretch">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search books, authors, subjects..."
              className="w-full h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex flex-row gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto">
            {/* Year Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-gray-300 min-w-[100px] justify-between flex-1 sm:flex-auto sm:min-w-[100px]"
                >
                  {yearDisplayText}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {yearOptions.map((year) => (
                  <DropdownMenuItem
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className="cursor-pointer"
                  >
                    {year}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Department Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-gray-300 min-w-[120px] justify-between flex-1 sm:flex-auto sm:min-w-[120px]"
                >
                  {departmentDisplayText}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {departmentOptions.map((department) => (
                  <DropdownMenuItem
                    key={department}
                    onClick={() => handleDepartmentChange(department)}
                    className="cursor-pointer"
                  >
                    {department}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Condition Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-gray-300 min-w-[100px] justify-between flex-1 sm:flex-auto sm:min-w-[100px]"
                >
                  {conditionDisplayText}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {conditionOptions.map((condition) => (
                  <DropdownMenuItem
                    key={condition}
                    onClick={() => handleConditionChange(condition)}
                    className="cursor-pointer"
                  >
                    {condition}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredBooks.length} of {books.filter(book => book.status !== "sold" && !book.isHidden).length} books
            </div>
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {hasActiveFilters
                ? 'No books found matching your criteria.'
                : 'No books found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBooks.map((book) => (
              <Card
                key={book._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={(e) => handleBookClick(e, book)}
              >
                <div className="relative h-64 group">
                  <img
                    alt={book.title || "Book cover"}
                    src={getImageSrc(book.pictures?.[0] || "")}
                    className="h-full w-full object-cover group-hover:opacity-75 rounded-t-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-book.jpg';
                    }}
                  />

                  <Badge className={`absolute top-3 right-3 ${getConditionBadgeStyle(book.status || book.condition)}`}>
                    {book.status || book.condition || 'Available'}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">{book.title}</h3>
                  {book.author && (
                    <p className="text-gray-600 mb-2">by {book.author}</p>
                  )}
                  <p className="text-2xl font-bold text-gray-900 mb-2">Rs. {book.price}</p>

                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getConditionBadgeStyle(book.condition)}>
                      {book.condition}
                    </Badge>
                    {book.department && (
                      <Badge variant="outline">
                        {book.department}
                      </Badge>
                    )}
                  </div>

                  <Button
                    className={`w-full text-white transition-all duration-200 ${book.status === 'Sold'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : book.status === 'Reserved'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {book.status === 'Sold'
                      ? 'Sold Out'
                      : book.status === 'Reserved'
                        ? 'Reserved - Contact Seller'
                        : 'Contact Seller'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredBooks.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => {
                  if (page === "ellipsis-left" || page === "ellipsis-right") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      {/* Book Details Modal */}
      <BookDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        book={selectedBook}
      />

      <Footer />
    </div>
  );
};

export default BookSwapInner;