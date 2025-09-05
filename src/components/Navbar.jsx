'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from "next/link"

import { supabase } from '@/lib/supabase/client'
import getImageSrc from '@/utils/getImageSrc'
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [mongoUserData, setMongoUserData] = useState(null)

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

  useEffect(() => {
    const addLenisPrevent = () => {
      const navbarElements = document.querySelectorAll(
        'header button, header a, [class*="mobile-menu"] button, [class*="mobile-menu"] a'
      );

      navbarElements.forEach(element => {
        element.setAttribute('data-lenis-prevent', '');
      });
    };

    addLenisPrevent();
    const timer = setTimeout(addLenisPrevent, 100);

    return () => {
      clearTimeout(timer);
      const elements = document.querySelectorAll('[data-lenis-prevent]');
      elements.forEach(element => {
        element.removeAttribute('data-lenis-prevent');
      });
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    if (window.lenis) {
      window.lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (window.lenis) {
        window.lenis.off('scroll', handleScroll);
      }
    };
  }, []);

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

  const closeMenu = () => setMenuOpen(false)
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    closeMenu()
    closeMobileMenu()
  }

  const handleprofilepage = () => {
    router.push('Profile');
    closeMobileMenu()
  }

  const handledashboard = () => {
    if (userRole === 'admin') {
      router.push('Admindashboard');
    } else {
      router.push('userdashboard');
    }
    closeMobileMenu()
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  const handleHowItWorks = () => {
    closeMobileMenu();

    setTimeout(() => {
      if (pathname === '/') {
        const element = document.getElementById('how-it-works-section');
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      } else {
        router.push('/#how-it-works-section');
      }
    }, 50);
  }

  const handleNavigation = (path) => {
    router.push(path)
    closeMobileMenu()
  }

  return (
    <>
      <header className="bg-white backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-2 sm:py-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BookSwap
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium transition-all duration-200"
            >
              Home page
            </Button>
            <Button
              onClick={() => router.push('browse')}
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium transition-all duration-200"
            >
              Browse
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium transition-all duration-200"
            >
              Sell Books
            </Button>
            <Button
              onClick={handleHowItWorks}
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium transition-all duration-200"
            >
              How it works
            </Button>
            <Button
              onClick={() => router.push('contactus')}
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium transition-all duration-200"
            >
              Contact Us
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            {!user ? (
              <Link href="/auth/login">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2 mr-5">
                <Button
                  onClick={handledashboard}
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium transition-all duration-200"
                >Dashboard</Button>
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center p-1 md:mr-2 rounded-full hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 md:w-8 md:h-8 rounded-full overflow-hidden">
                          {avatarUrl ? (
                            <img
                              className="w-full h-full object-cover"
                              src={getImageSrc(avatarUrl)}
                              alt="User Profile"
                            />
                          ) : (
                            <User className="w-full h-full p-2 bg-gray-100 text-gray-400" />
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
                      <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer" onClick={handleprofilepage}>
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
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            {/* Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slider Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Slider Menu */}
      <div className={`fixed top-0 right-0 h-full w-65 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BookSwap
          </h2>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* User Section - Show when logged in */}
          {user && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={getImageSrc(avatarUrl)}
                      alt="User Profile"
                    />
                  ) : (
                    <User className="w-full h-full p-2 bg-gray-100 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 break-words">
                    {mongoUserData?.name || user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 break-words">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <button
                  onClick={handleprofilepage}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Your Profile
                </button>
                <button
                  onClick={handledashboard}
                  className="w-full text-left px-3 py-0 text-sm text-gray-700 hover:bg-white rounded-lg flex items-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Navigation Section */}
          <div className=" pl-6 pt-4 pb-3">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Navigation</h3>
            <div className="space-y-1 pl-2">
              <button
                onClick={() => handleNavigation('/')}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5H10v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
                </svg>
                Home page
              </button>

              <button
                onClick={() => handleNavigation('browse')}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse
              </button>

              <button
                className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Sell Books
              </button>

              <button
                onClick={handleHowItWorks}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How it works
              </button>

              <button
                onClick={() => handleNavigation('contactus')}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pl-4 border-t border-gray-200 ">
            {!user ? (
              <Link href="/auth/login">
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg flex items-center justify-start gap-3 transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg font-medium flex items-center justify-start gap-3 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}