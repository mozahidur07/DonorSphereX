import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useUserStore from "../store/userStore";
import { useMediaQuery } from 'react-responsive';

// Icons
const HomeIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const DashboardIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ProjectsIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

const TasksIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const ReportingIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const UsersIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const NotificationsIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const SupportIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const SettingsIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const SearchIcon = ({ className = "pl-1" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-5 h-5 ${className}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const LogoIcon = ({ className = "" }) => (
  <i
    className={`bx bx-donate-heart scale-[1.7] text-green-600 ${className}`}
  ></i>
);

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userData = useUserStore(state => state.userData);
  const dropdownRef = useRef(null);
  const userProfileRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Check if device is mobile
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  const handleLogout = async (allDevices = false) => {
    await logout(allDevices);
    navigate('/');
  };
  
  // Function to start the hide timer
  const startHideTimer = () => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Set a new timeout to hide the dropdown after 5 seconds
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setShowUserDropdown(false);
      }
    }, 5000);
  };
  
  // Function to handle mouse enter
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };
  
  // Function to handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    startHideTimer();
  };
  
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    const newState = !showUserDropdown;
    setShowUserDropdown(newState);
    
    if (newState) {
      // If we're showing the dropdown, also start the hide timer
      setIsHovering(true);
      // Start the hide timer in case the user doesn't hover
      startHideTimer();
    } else {
      // If we're hiding the dropdown, clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  };
  
  // Handle click outside to close the user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showUserDropdown &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        userProfileRef.current && 
        !userProfileRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      }
      
      // Close mobile sidebar when clicking outside
      if (
        isMobile && 
        mobileMenuOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        // Don't close if clicked on the hamburger menu button
        !event.target.closest('.mobile-menu-toggle')
      ) {
        setMobileMenuOpen(false);
      }
    }
    
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown, mobileMenuOpen, isMobile]);
  
  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  
  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (currentUser) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const token = localStorage.getItem('authToken');
          
          if (!token) return;
          
          const response = await fetch(`${API_URL}/notifications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              setUnreadNotifications(data.unreadCount || 0);
            }
          }
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      } else {
        setUnreadNotifications(0);
      }
    };
    
    fetchUnreadNotifications();
    
    // Refresh notification count every 60 seconds
    const intervalId = setInterval(fetchUnreadNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, location.pathname]);

  const menuItems = [
    {
      path: "/",
      name: "Home",
      icon: <HomeIcon />,
      submenus: [],
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <DashboardIcon />,
      submenus: [],
    },
    {
      path: "/requests",
      name: "Request",
      icon: <ProjectsIcon />,
      submenus: [
        { path: "/requests/organ", name: "Organ" },
        { path: "/requests/blood", name: "Blood" },
      ],
    },
    {
      path: "/status",
      name: "Requests Status",
      icon: <TasksIcon />,
      submenus: [],
    },
    {
      path: "/donation",
      name: "Donation",
      icon: <ReportingIcon />,
      submenus: [
        { path: "/donation/organ", name: "Organ" },
        { path: "/donation/blood", name: "Blood" },
        { path: "/donation/reports", name: "Reports" },
      ],
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <UsersIcon />,
      submenus: [],
    },
  ];

  const bottomMenuItems = [
    {
      path: "/notifications",
      name: "Notifications",
      icon: <NotificationsIcon />,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      path: "/support",
      name: "Support",
      icon: <SupportIcon />,
    },
    // {
    //   path: '/settings',
    //   name: 'Settings',
    //   icon: <SettingsIcon />
    // },
  ];

  const toggleMenu = (menuName) => {
    if (expandedMenu === menuName) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuName);
    }
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    
    // Special handling for "/requests" and "/donation" paths
    if (path === "/requests") {
      return location.pathname.startsWith("/requests/");
    }
    
    if (path === "/donation") {
      return location.pathname.startsWith("/donation/");
    }
    
    return location.pathname.startsWith(path);
  };

  // Mobile menu button component
  const MobileMenuButton = () => (
    <button 
      className="mobile-menu-toggle fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        setMobileMenuOpen(!mobileMenuOpen);
      }}
    >
      {mobileMenuOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="sidebar-wrapper">
      {/* Mobile menu button */}
      {isMobile && !mobileMenuOpen && <MobileMenuButton />}
      
      {/* Overlay for mobile */}
      <div 
        className={`${isMobile 
          ? 'fixed inset-0 bg-gray-600 bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out'
          : 'hidden'} ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`${isMobile 
        ? 'fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out transform-gpu w-64'
        : 'group fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out transform-gpu'
        } ${mobileMenuOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''}`}>
        
        {/* Sidebar Container */}
        <div 
          ref={sidebarRef}
          className={`relative h-full flex bg-white border-r-[1px] border-gray-200 text-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${
            isMobile ? 'w-64' : 'group-hover:w-64 w-16'
          }`}
        >
          {/* Logo Area */}
          <div className="flex flex-col w-full h-full">
            <div className="flex items-center justify-center h-14 w-full border-b">
              <div className="flex items-center justify-center w-16 h-full">
                {/* <LogoIcon className="" /> */}
                <img src="/icon.png" className="w-8 h-8" />
              </div>
              <div className={`${isMobile ? 'flex' : 'hidden group-hover:flex'} items-center flex-grow -ml-2 truncate`}>
                <span className="ml-2 text-xl font-bold">Donor</span>
                <span className="text-secondary text-lg ml-1">SphereX</span>
              </div>
              {isMobile && (
                <button 
                  className="p-2 mr-2" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-grow overflow-y-auto pb-10 mt-4">
              <nav className="px-2">
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.path}>
                      {item.submenus.length > 0 ? (
                        // For items with submenus - just toggle the menu, don't navigate
                        <div
                          className={`flex items-center py-2 px-2 rounded-md transition-colors cursor-pointer ${
                            isActive(item.path)
                              ? "bg-primary bg-opacity-10 text-primary font-medium"
                              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                          }`}
                          onClick={() => toggleMenu(item.name)}
                        >
                          <div
                            className={`flex items-center justify-center w-10 ${
                              isActive(item.path) ? "text-primary" : "text-gray-500"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className={`${isMobile ? 'block' : 'hidden group-hover:block'} ml-2 truncate`}>
                            {item.name}
                          </span>
                          <div className={`${isMobile ? 'flex' : 'hidden group-hover:flex'} ml-auto`}>
                            <div
                              className={`transform transition-transform duration-200 ${
                                expandedMenu === item.name ? "rotate-180" : ""
                              }`}
                            >
                              <ChevronDownIcon />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // For items without submenus - navigate to the path
                        <Link
                          to={item.path}
                          onClick={() => isMobile && setMobileMenuOpen(false)}
                          className={`flex items-center py-2 px-2 rounded-md transition-colors ${
                            isActive(item.path)
                              ? "bg-primary bg-opacity-10 text-primary font-medium"
                              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-10 ${
                              isActive(item.path) ? "text-primary" : "text-gray-500"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className={`${isMobile ? 'block' : 'hidden group-hover:block'} ml-2 truncate`}>
                            {item.name}
                          </span>
                        </Link>
                      )}

                      {/* Submenu */}
                      {item.submenus.length > 0 && expandedMenu === item.name && (
                        <div className={`ml-8 mt-1 ${isMobile ? 'block' : 'hidden group-hover:block'}`}>
                          {item.submenus.map((submenu) => (
                            <Link
                              key={submenu.path}
                              to={submenu.path}
                              onClick={() => isMobile && setMobileMenuOpen(false)}
                              className={`block py-2 px-2 text-sm rounded-md ${
                                location.pathname === submenu.path
                                  ? "text-primary bg-primary bg-opacity-10 font-medium"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                              }`}
                            >
                              {submenu.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            </div>

            {/* Bottom Menu Items */}
            <div className="px-2 py-4 border-t border-gray-200">
              <div className="space-y-1">
                {bottomMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                    className={`flex items-center py-2 px-2 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary bg-opacity-10 text-primary"
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 relative ${
                        location.pathname === item.path
                          ? "text-primary"
                          : "text-gray-500"
                      }`}
                    >
                      {item.icon}
                      {item.badge && !isMobile && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`${isMobile ? 'block' : 'hidden group-hover:block'} ml-2 truncate`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`${isMobile ? 'flex' : 'hidden group-hover:flex'} ml-auto bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 items-center justify-center`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Profile */}
            <div className="px-2 py-2 border-t border-gray-200 relative">
              <div 
                ref={userProfileRef}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer relative"
                onClick={toggleDropdown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={userData?.profilePicture?.url || "https://i.pinimg.com/736x/d4/d2/1f/d4d21fbfd7b6101c9fe15dc6b42f5ccc.jpg"}
                  alt={currentUser?.fullName || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className={`${isMobile ? 'block' : 'hidden group-hover:block'} flex-grow min-w-0`}>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {currentUser?.fullName || "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {currentUser?.email || "user@example.com"}
                  </div>
                </div>
                <div className={`${isMobile ? 'block' : 'hidden group-hover:block'} text-gray-500`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                
                {/* Logout Dropdown */}
                {showUserDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1 overflow-hidden"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500">
                        Logged in as
                      </p>
                      <p className="text-sm font-semibold text-primary truncate">
                        {currentUser?.fullName || "User"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-red-50 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out (This Device)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout(true);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-red-50 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Log out (All Devices)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
