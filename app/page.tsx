"use client";
import { JSX, useEffect, useRef, useState } from "react";
import {
  ChatInfo,
  Header,
  SettleBilling,
  ShowImage,
  SideNav,
  ForgotPass,
  ViewAllUnits,
  Login,
  ManageProperty,
  EditProperty,
} from "./components";
import dynamic from "next/dynamic";
import { LoadingPage, LoadingScreen } from "./components/customcomponents";

import { useSession } from 'next-auth/react';

// Lazy-loaded pages (keep your existing imports)
const Mainpage = dynamic(() => import("./components/MainPage"), {
  loading: () => <LoadingScreen page={0} />,
});

const Dashboard = dynamic(() => import("./components/DashboardPage"), {
  loading: () => <LoadingScreen page={1} />,
});

const Messages = dynamic(() => import("./components/MessagesPage"), {
  loading: () => <LoadingScreen page={2} />,
});

const Maintenance = dynamic(() => import("./components/MaintenancePage"), {
  loading: () => <LoadingScreen page={4} />,
});

const Tenants = dynamic(() => import("./components/TenantListPage"), {
  loading: () => <LoadingScreen page={5} />,
});

const Settings = dynamic(() => import("./components/SettingsPage"), {
  loading: () => <LoadingScreen page={6} />,
});

const Tenant = dynamic(() => import("./components/TenantInfo"), {
  loading: () => <LoadingScreen page={7} />,
});

const NewTenant = dynamic(() => import("./components/AddTenant"), {
  loading: () => <LoadingScreen page={8} />,
});

const Chat = dynamic(() => import("./components/Message"), {
  loading: () => <LoadingScreen page={9} />,
});

const AllMedia = dynamic(() => import("./components/AllMedia"), {
  loading: () => <LoadingScreen page={11} />,
});

const Docu = dynamic(() => import("./components/Documentation"), {
  loading: () => <LoadingScreen page={12} />,
});

const Billing = dynamic(() => import("./components/BillingPage"), {
  loading: () => <LoadingScreen page={13} />,
});

export default function Home() {
  const [page, setPage] = useState(-1); // -1 means "not initialized yet"
  const [image, setImage] = useState(false);
  const [nav, setNav] = useState("-right-[9999px]");
  const [contentLoading, setContentLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState("-right-[9999px]");
  const [settleBilling, setSettleBilling] = useState(false);
  const [unit, setUnit] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | undefined>(); // 
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<number | undefined>(); // For documentation
  const comRef = useRef<HTMLDivElement | null>(null);

  const { data: session, status } = useSession();

  // Set initial page based on authentication status
  useEffect(() => {
    if (status === "authenticated" && session) {
      // User is logged in - go to MainPage if page is not initialized or is login page
      if (page === -1 || page === 99) {
        setPage(0);
      }
    } else if (status === "unauthenticated") {
      // User is not logged in - show login page
      setPage(99);
    }
  }, [status, session, page]);

  // FOR LOADING SCREEN
  useEffect(() => {
    window.onload = () => {
      setContentLoading(false);
    };
    const fallBackTimeout = setTimeout(() => {
      setContentLoading(false);
    }, 1500);
    return () => {
      window.onload = null;
      clearTimeout(fallBackTimeout);
    };
  }, []);

  // FOR NAV
  const handleNavClick = (event: MouseEvent) => {
    if (comRef.current && !comRef.current.contains(event.target as Node)) {
      setNav("-right-[9999px]");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleNavClick);
    return () => {
      document.removeEventListener("mousedown", handleNavClick);
    };
  }, []);

  // Updated setPage function that handles chatUserId and maintenanceId
  const handleSetPage = (page: number, contextId?: number) => {
    console.log('Setting page:', page, 'with contextId:', contextId); // Debug log
    if (contextId !== undefined) {
      // Page 9 is Chat, Page 12 is Documentation
      if (page === 9) {
        setSelectedChatUserId(contextId);
      } else if (page === 12) {
        setSelectedMaintenanceId(contextId);
      }
    }
    setPage(page);
  };

  // Tenant web app URL for redirect
  const TENANT_APP_URL = process.env.NEXT_PUBLIC_TENANT_APP_URL || "https://your-tenant-app.vercel.app";

  // Show loading state while checking authentication or page not initialized
  if (status === "loading" || page === -1) {
    return (
      <div className='h-full w-full flex flex-col bg-neutral-50 items-center justify-center'>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-customViolet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!session) {
    return (
      <div className='h-full w-full flex flex-col bg-neutral-50 items-center justify-center'>
        <Login setPage={setPage} />
      </div>
    );
  }

  // User is authenticated - check role
  const user = session.user;
  const userRole = user?.role?.toLowerCase();

  // Debug log for session info
  console.log("Session user:", user);
  console.log("User role:", userRole);

  // If user is a tenant, redirect to tenant app
  if (userRole === 'tenant') {
    // Redirect tenant to tenant app
    if (typeof window !== 'undefined') {
      window.location.href = TENANT_APP_URL;
    }
    return (
      <div className='h-full w-full flex flex-col bg-customViolet items-center justify-center'>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className='font-poppins text-2xl text-white font-light mb-2'>Tenant Account Detected</h2>
          <p className='text-white/80 text-sm'>Redirecting you to the Tenant Portal...</p>
        </div>
      </div>
    );
  }

  // Allow access if role is landlord, admin, or if role is not set (for backwards compatibility)
  // This handles cases where existing sessions might not have the role set
  const allowedRoles = ['landlord', 'admin'];
  const hasValidRole = !userRole || allowedRoles.includes(userRole);

  if (!hasValidRole) {
    return (
      <div className='h-full w-full flex flex-col bg-neutral-50 items-center justify-center'>
        <div className="text-center p-8">
          <h2 className='text-2xl font-semibold text-red-600 mb-2'>Access Denied</h2>
          <p className='text-gray-600 mb-4'>Your account does not have permission to access this application.</p>
          <button 
            onClick={() => {
              // Sign out and redirect to login
              import('next-auth/react').then(({ signOut }) => {
                signOut({ redirect: false }).then(() => {
                  window.location.reload();
                });
              });
            }}
            className='px-6 py-2 bg-customViolet text-white rounded-lg hover:bg-customViolet/90'
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // 
  const pages: Record<number, JSX.Element> = {
    0: <Mainpage setPage={handleSetPage} />,
    1: <Dashboard setPage={handleSetPage} />,
    2: <Messages setPage={handleSetPage} />, // 
    4: <Maintenance setPage={handleSetPage} setImage={setImage} />,
    5: <Tenants setPage={handleSetPage} onTenantSelect={setSelectedTenant} />,
    6: <Settings setPage={handleSetPage} />,

    // Pass selected tenant to Tenant Info page (or chatUserId if from ChatInfo)
    7: <Tenant setPage={handleSetPage} tenant={selectedTenant} chatUserId={selectedChatUserId} fromChatInfo={!!selectedChatUserId} />,

    8: <NewTenant setPage={handleSetPage} />,
    9: <Chat setPage={handleSetPage} setChatInfo={setChatInfo} chatUserId={selectedChatUserId} />, // 
    11: <AllMedia setPage={handleSetPage} setImage={setImage} />,
    12: <Docu setPage={handleSetPage} setImage={setImage} />,
    13: <Billing propertyId={1} setPage={setPage} />,
    14: <ManageProperty setPage={handleSetPage} />,
    15: <EditProperty setPage={handleSetPage} />,
    98: <ForgotPass setPage={handleSetPage} />,
    99: <Login setPage={handleSetPage} />,
    100: <ViewAllUnits setPage={handleSetPage} />,
  };

  return (
    <>
      {contentLoading ? (
        <LoadingPage />
      ) : (
        <main className="h-full w-full flex flex-col items-center relative bg-customViolet">
          <Header login={page !== 99} setNav={setNav} setPage={handleSetPage} page={page}/>
          <div className="h-full w-full flex flex-col relative overflow-x-hidden max-w-[1920px] mx-auto">
            {pages[page] || null}

            <ChatInfo
              setPage={handleSetPage}
              setChatInfo={setChatInfo}
              chatInfo={chatInfo}
              chatUserId={selectedChatUserId}
            />

            {image && <ShowImage setImage={setImage} />}

            <SideNav
              comRef={comRef}
              setNav={setNav}
              nav={nav}
              setPage={handleSetPage}
            />

            {settleBilling && (
              <SettleBilling
                setSettleBilling={setSettleBilling}
                setUnit={setUnit}
                unit={unit}
              />
            )}
          </div>
        </main>
      )}
    </>
  );
}