'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import getImageSrc from '@/utils/getImageSrc';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null);
  const router = useRouter();

  console.log("user in navbar", user);
  

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

  const toggleMenu = () => setMenuOpen(prev => !prev)
  const closeMenu = () => setMenuOpen(false)
   const [avatarUrl, setAvatarUrl] = useState(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    closeMenu()
  }

  const handleprofilepage = ()=>{
    router.push('profile');
  }
  
  const handledashboard = ()=>{
    router.replace('/userdashboard')
  }
  return (
    
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-primary text-primary-foreground shadow-md">
      <Link href="/" className="flex text-2xl font-bold pl-15">Bookbuddy</Link>

      <div className='flex items-center space-x-4'>
        <Button 
        onClick={handledashboard}
        variant="ghost">Dashboard</Button>

        {!user ? (
          <Link href="/auth/login">
            <Button variant="ghost" className="ml-4">Sign In</Button>
          </Link>
        ) : (
          <div className="relative ml-4">
            <button
              onClick={toggleMenu}
              className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <img
                className="w-8 h-8 rounded-full"
                src={getImageSrc(avatarUrl)}
                alt="User Profile"
              />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black/5 z-10"
                role="menu"
              >
                <button
                onClick={handleprofilepage}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:rounded-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  Your Profile
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:rounded-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
