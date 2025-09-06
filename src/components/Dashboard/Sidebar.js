
import React from 'react';
import {
    BookOpen,
    BookPlus,
    Home,
    Menu,
    ChevronLeft,
    AlertTriangle,
} from 'lucide-react';

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    handlemainpage,
    warningsCount,
}) => {

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'addbook', label: 'Add Book', icon: BookPlus },
        { id: 'books', label: 'My Books', icon: BookOpen },
        {
            name: 'Warnings & Notices',
            icon: AlertTriangle,
            href: 'warnings',
            badge: warningsCount // You'll need to accept this as a prop
        },

    ];

    const navigation = [
  { name: 'Overview', icon: Home, href: 'overview' },
  { name: 'Add Book', icon: BookPlus, href: 'addbook' },
  { name: 'My Books', icon: BookOpen, href: 'books' },
  { 
    name: 'Warnings & Notices', 
    icon: AlertTriangle, 
    href: 'warnings',
    badge: warningsCount // You'll need to accept this as a prop
  },
];


    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg h-full transition-all duration-300 flex flex-col`}>
            {/* Sidebar Header */}
            <div className="hidden md:block p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 cursor-pointer" onClick={handlemainpage}>Bookbuddy</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {sidebarOpen ? (
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        ) : (
                            <Menu className="h-5 w-5 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Sidebar Navigation */}
            {/* <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {sidebarItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav> */}
<nav className="flex-1 p-4">
    <ul className="space-y-2">
        {navigation.map((item) => (
            <li key={item.name}>
                <a
                    href="#"
                    onClick={() => setActiveTab(item.href)}
                    className={
                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ' +
                        (activeTab === item.href
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100')
                    }
                >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.badge}
                        </span>
                    )}
                </a>
            </li>
        ))}
    </ul>
</nav>


        </div>
    )
}

export default Sidebar;