'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ProfileCard from './ProfileCard'

/**
 * Navigation item structure for the mobile sidebar
 */
type NavItem = {
  name: string;    // Display name of the navigation item
  slug: string;    // Unique identifier for the item
  icon: string;    // Path to the icon image
  url: string;     // Route URL for navigation
};

/**
 * Props interface for the MobileSidebar component
 */
type MobileSidebarProps = {
  isOpen: boolean;                    // Controls sidebar visibility
  onClose: () => void;               // Callback function to close the sidebar
  navItems: readonly NavItem[];      // Array of navigation items to display
};

/**
 * MobileSidebar Component
 * 
 * A responsive mobile navigation sidebar that slides in from the left.
 * Features:
 * - Overlay backdrop for better UX
 * - Smooth slide-in/out animations
 * - Active state highlighting
 * - Profile card integration
 * - Logout functionality
 * - Responsive design (hidden on large screens)
 */
const MobileSidebar = ({ isOpen, onClose, navItems }: MobileSidebarProps) => {
  // Get current pathname to determine active navigation item
  const pathname = usePathname();

  return (
    <>
      {/* 
        Overlay backdrop - appears when sidebar is open
        - Semi-transparent black background
        - Clicking closes the sidebar
        - Hidden on large screens (lg:hidden)
      */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 
        Main sidebar container
        - Fixed positioning from top-left
        - Takes 2/3 of screen width
        - Smooth transform animations
        - Higher z-index than overlay (z-50)
        - Hidden on large screens
      */}
      <aside 
        className={`fixed top-0 left-0 h-full w-2/3 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* 
            Header section containing the profile card
            - Fixed height with border separator
            - Centered profile information
          */}
          <div className='flex items-center justify-between p-4 border-b border-gray-100'>
            <ProfileCard />
          </div>

          {/* 
            Main navigation section
            - Flexible height to fill available space
            - Vertical spacing between navigation items
          */}
          <nav className='flex-1 px-4 py-6'>
            <div className='space-y-1'>
              {navItems.map((item) => {
                // Determine if current item matches the active route
                const isActive = pathname === item.url;
                
                return (
                  <Link
                    key={item.slug}
                    href={item.url}
                    onClick={onClose} // Close sidebar when navigating
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-green-50 text-green-700'  // Active state styling
                        : 'text-gray-700 hover:bg-gray-50' // Default and hover states
                    }`}
                  >

                    {/* 
                      Active indicator - green vertical bar
                      - Only visible for active navigation items
                      - Positioned at the right edge
                    */}
                    {isActive && (
                      <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-green-700 rounded-r-full' />
                    )}

                    {/* 
                      Icon container with conditional opacity
                      - Active items have full opacity
                      - Inactive items are slightly transparent
                    */}
                    <div className={`${isActive ? '' : 'opacity-60'}`}>
                      <Image 
                        src={item.icon} 
                        alt={item.name} 
                        width={20} 
                        height={20}
                        className={isActive ? 'filter-green' : ''} // Green filter for active icons
                      />
                    </div>
                    
                    {/* Navigation item text with conditional font weight */}
                    <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                      {item.name}
                    </span>
                    
                    
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 
            Bottom actions section
            - Fixed at bottom with border separator
            - Contains logout functionality
          */}
          <div className='p-4 border-t border-gray-100'>
            <Link
              href='/logout'
              onClick={onClose} // Close sidebar when logging out
              className='flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
            >
              <Image 
                src='/icon/logout.svg' 
                alt='Logout' 
                width={20} 
                height={20} 
              />
              <span className='text-sm'>Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;