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
  const [page, setPage] = useState(99);
  const [image, setImage] = useState(false);
  const [nav, setNav] = useState("-right-[9999px]");
  const [contentLoading, setContentLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState("-right-[9999px]");
  const [settleBilling, setSettleBilling] = useState(false);
  const [unit, setUnit] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | undefined>(); // ✅ Add this state
  const comRef = useRef<HTMLDivElement | null>(null);

  const { data: session, status } = useSession();

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

  // ✅ Updated setPage function that handles chatUserId
  const handleSetPage = (page: number, chatUserId?: number) => {
    console.log('Setting page:', page, 'with chatUserId:', chatUserId); // Debug log
    if (chatUserId !== undefined) {
      setSelectedChatUserId(chatUserId);
    }
    setPage(page);
  };

    // Show loading state while checking authentication
  if (status === "loading") {
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

  // User is authenticated, show main content
  const user = session.user;

  // ✅ Pass `setSelectedTenant` to Tenants page
  const pages: Record<number, JSX.Element> = {
    0: <Mainpage setPage={handleSetPage} />,
    1: <Dashboard setPage={handleSetPage} />,
    2: <Messages setPage={handleSetPage} />, // ✅ This will pass chatUserId when clicking on a message
    4: <Maintenance setPage={handleSetPage} setImage={setImage} />,
    5: <Tenants setPage={handleSetPage} onTenantSelect={setSelectedTenant} />,
    6: <Settings setPage={handleSetPage} />,

    // ✅ Pass selected tenant to Tenant Info page
    7: <Tenant setPage={handleSetPage} tenant={selectedTenant} />,

    8: <NewTenant setPage={handleSetPage} />,
    9: <Chat setPage={handleSetPage} setChatInfo={setChatInfo} chatUserId={selectedChatUserId} />, // ✅ Pass the chatUserId here
    11: <AllMedia setPage={handleSetPage} setImage={setImage} />,
    12: <Docu setPage={handleSetPage} setImage={setImage} />,
    13: (
      <Billing
        setPage={handleSetPage}
        setSettleBilling={setSettleBilling}
        setUnit={setUnit}
      />
    ),
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
          <Header login={page !== 99} setNav={setNav} setPage={handleSetPage} />
          <div className="h-full w-full flex flex-col relative overflow-x-hidden">
            {pages[page] || null}

            <ChatInfo
              setPage={handleSetPage}
              setChatInfo={setChatInfo}
              chatInfo={chatInfo}
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