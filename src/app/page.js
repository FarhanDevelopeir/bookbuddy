'use client';
import React, { useEffect, useState } from 'react';
import { ChevronRight, Cpu, Zap, Settings, Building, FlaskConical, CircuitBoard } from 'lucide-react'
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedCounter from "@/components/AnimatedCounter";
import { motion, AnimatePresence } from "framer-motion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import getImageSrc from '@/utils/getImageSrc';
import { useRouter } from 'next/navigation';
import BookDetailsModal from '@/components/BookDetailsModal';

const BookSwap = () => {
    const [activeYear, setActiveYear] = useState('First Year');
    const [allBooks, setAllBooks] = useState([]);
    const [stats, setStats] = useState({
        booksAvailable: 0,
        activeStudents: 0,
        departments: 0,
        satisfactionRate: 0
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const router = useRouter();

    const steps = [
        {
            number: "1",
            title: "Create Your Profile",
            description:
                "Sign up with your student ID and create a profile with your photo and department information",
        },
        {
            number: "2",
            title: "List Your Books",
            description:
                "Upload photos and optional video previews of your books, set your price, and add descriptions",
        },
        {
            number: "3",
            title: "Connect & Trade",
            description:
                "Browse books by department and year, connect with sellers, and arrange safe exchanges on campus",
        },
        {
            number: "4",
            title: "Save Money",
            description:
                "Buy quality used books at student-friendly prices and sell your old books for extra cash",
        },
    ];


    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash
            if (hash.includes('access_token')) {
                router.replace(`/auth/callback${hash}`);
            }
        }
    }, [router])

    useEffect(() => {
        const fetchStatsAndBooks = async () => {
            try {

                const booksRes = await fetch('/api/books');
                const booksData = await booksRes.json();

                const usersRes = await fetch('/api/users');
                const usersData = await usersRes.json();

                const availableBooks = Array.isArray(booksData) ? booksData.filter(book => book.status !== 'Sold' && !book.isHidden) : [];

                setAllBooks(availableBooks);
                
                setStats({
                    booksAvailable: availableBooks.length,
                    activeStudents: Array.isArray(usersData) ? usersData.length : 0,
                    departments: 6,
                    satisfactionRate: 95
                });
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };
        fetchStatsAndBooks();
        const handleHashNavigation = () => {
            if (window.location.hash === '#how-it-works-section') {
                setTimeout(() => {
                    const element = document.getElementById('how-it-works-section');
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                    }
                }, 100);
            }
        };
        handleHashNavigation();
        window.addEventListener('hashchange', handleHashNavigation);
        return () => {
            window.removeEventListener('hashchange', handleHashNavigation);
        };
    }, []);

    const handleYearChange = (year) => {
        setActiveYear(year);
    };

    const handleBookClick = (e, book) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedBook(book);
        setSelectedImageIndex(0);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBook(null);
        setSelectedImageIndex(0);
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0 },
    };

    const YearCarousel = ({ title, filter }) => {
        const filteredBooks = allBooks.filter(book => {
            const yearMapping = {
                'First Year': 'First Year',
                'Second Year': 'Second Year', 
                'Third Year': 'Third Year'
            };
            
            const expectedYear = yearMapping[filter] || filter;
            return book.year === expectedYear;
        }).slice(0, 5);

        return (
            <div className="w-full py-4 sm:py-5">
                <div className="flex flex-col items-center w-full px-2 sm:px-4">
                    <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-sm p-2">
                        <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                                {filteredBooks.map((book, idx) => (
                                    <CarouselItem
                                        key={book._id || idx}
                                        className="pl-1 basis-[85%] xs:basis-3/4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3"
                                    >
                                        <div className="p-1">
                                            <Card
                                                className="cursor-pointer hover:shadow-lg transition-shadow px-2"
                                                onClick={(e) => handleBookClick(e, book)}
                                            >
                                                <CardContent className="aspect-square p-2 pt-0 relative">
                                                    <img
                                                        src={getImageSrc(book.pictures?.[0]) || "/placeholder.jpg"}
                                                        alt={book.title}
                                                        className="w-full h-72 sm:h-85 object-cover rounded"
                                                    />
                                                    <div className="absolute bottom-0 left-[-11] right-0 bg-black/50 text-white p-2 pl-5 w-72 sm:w-92.5 rounded-b">
                                                        <p className="text-xs sm:text-sm font-semibold truncate">{book.title}</p>
                                                        <p className="text-xs opacity-80">${book.price}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}

                                {/* View More Card */}
                                <CarouselItem className="pl-1 basis-[85%] xs:basis-3/4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <Link href={`/browse?filter=${filter}`}>
                                            <Card className="group hover:shadow-lg transition-all duration-300 rounded-xl border border-primary/10 hover:border-primary/30 cursor-pointer">
                                                <CardContent className="flex flex-col h-72 sm:h-89 items-center justify-center aspect-square p-6 bg-gradient-to-b from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 rounded-xl transition-colors">
                                                    <ChevronRight className="w-8 sm:w-10 h-8 sm:h-10 p-2 mt-5 rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 mb-3" />
                                                    <p className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-primary transition-colors">
                                                        View More
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                                        {title}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                            <CarouselPrevious
                                className="w-8 h-8 sm:w-15 sm:h-15 text-sm sm:text-base"
                            />
                            <CarouselNext
                                className="w-8 h-8 sm:w-15 sm:h-15 text-sm sm:text-base"
                            />
                        </Carousel>
                    </div>
                </div>
            </div>
        );
    };

    const CategoryCard = ({ icon: Icon, title, description, department }) => (
        <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-500"
        >
            <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-12 sm:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                    >
                        Buy & Sell Diploma Books
                    </motion.h1>
                    <p className="text-base sm:text-lg md:text-xl text-white opacity-80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                        Connect with fellow students to buy, sell, and exchange used textbooks at great prices
                    </p>

                    <div className="flex flex-col sm:flex-row  justify-center space-y-2 sm:space-y-4 sm:space-x-4 mb-12 sm:mb-10 px-4">
                        <Button className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full w-50 ml-17 sm:ml-0 sm:w-auto"
                            onClick={() => router.push('browse')}
                        >
                            Browse Book
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-gradient-to-br from-blue-500 to-blue-900 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full w-50 ml-17 sm:ml-0 sm:w-auto"
                        >
                            Sell Your Books
                        </Button>
                    </div>


                    <Card className="bg-white/10 backdrop-blur-sm border-none max-w-6xl mx-auto mb-5">
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold mb-1 sm:mb-2">
                                        <AnimatedCounter value={stats.booksAvailable} />
                                    </div>
                                    <div className="text-xs sm:text-sm text-white opacity-80">Books Available</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold mb-1 sm:mb-2">
                                        <AnimatedCounter value={stats.activeStudents} />
                                    </div>
                                    <div className="text-xs sm:text-sm text-white opacity-80">Active Students</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold mb-1 sm:mb-2">
                                        <AnimatedCounter value={stats.departments} />
                                    </div>
                                    <div className="text-xs sm:text-sm text-white opacity-80">Departments</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold mb-1 sm:mb-2">
                                        <AnimatedCounter value={stats.satisfactionRate} suffix="%" />
                                    </div>
                                    <div className="text-xs sm:text-sm text-white opacity-80">Satisfication Rate</div>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
            {/* Browse by Department */}
            <section className="py-12 sm:py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
                        Browse by Department
                    </h2>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ staggerChildren: 0.2 }}
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >

                        <motion.div variants={cardVariants}>
                            <CategoryCard
                                icon={Cpu}
                                title="General"
                                description="Programming, Software Engineering, Database Systems"
                                department="Computer Science"
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <CategoryCard
                                icon={Zap}
                                title="Auto & Diesel"
                                description="Circuit Analysis, Electronics, Power Systems"
                                department="Electrical Engineering"
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <CategoryCard
                                icon={Settings}
                                title="Civil Engineering"
                                description="Thermodynamics, Materials Science, Design"
                                department="Mechanical Engineering"
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <CategoryCard
                                icon={Building}
                                title="Mechanical Engineering"
                                description="Structures, Construction, Environmental"
                                department="Civil Engineering"
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <CategoryCard
                                icon={FlaskConical}
                                title="Quantity Survey"
                                description="Physics, Chemistry, Material Science"
                                department="Applied Sciences"
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <CategoryCard
                                icon={CircuitBoard}
                                title="ICT"
                                description="Digital Circuits, Communication, VLSI"
                                department="Electronics Engineering"
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </section >

            {/* Year Selection Carousel */}
            <section className="py-6 sm:py-10 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
                    <Tabs value={activeYear} onValueChange={handleYearChange} className="w-full">
                        {/* Tabs list */}
                        <div className="flex justify-center mb-3 sm:mb-0 overflow-x-auto sm:overflow-visible scrollbar-hide">
                            <TabsList className="flex gap-1 sm:gap-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg p-1 mx-auto min-w-max">
                                {[
                                    { label: "First Year", value: "First Year" },
                                    { label: "Second Year", value: "Second Year" },
                                    { label: "Third Year", value: "Third Year" },
                                ].map(({ label, value }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-white/30 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md whitespace-nowrap"
                                    >
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{label.split(" ")[0]}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Tabs content with animation */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeYear}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <YearCarousel title={`${activeYear} Books`} filter={activeYear} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </div>
            </section>
            
            <section
                id="how-it-works-section"
                className="py-12 sm:py-16 bg-gray-50 scroll-mt-20"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900"
                    >
                        How BookSwap Works
                    </motion.h2>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                    >
                        {steps.map((step) => (
                            <motion.div key={step.number} variants={item}>
                                <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <span className="text-xl sm:text-2xl font-bold text-white">
                                                {step.number}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground text-xs sm:text-sm">
                                            {step.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Book Details Modal */}
            <BookDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                book={selectedBook}
            />
            {/* Footer */}
            <Footer />
        </div >
    );
};

export default BookSwap;