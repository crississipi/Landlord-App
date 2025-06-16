"use client";
import { JSX, useEffect, useRef, useState } from "react";
import { ChatInfo, Header, SettleBilling, ShowImage, SideNav } from "./components";
import dynamic from 'next/dynamic'
import { LoadingPage, LoadingScreen } from "./components/customcomponents";

const Mainpage = dynamic(() => import('./components/MainPage'), 
{ loading: () => <LoadingScreen page={0} />, });

const Dashboard = dynamic(() => import('./components/DashboardPage'), 
{ loading: () => <LoadingScreen page={1} />, });

const Messages = dynamic(() => import('./components/MessagesPage'), 
{ loading: () => <LoadingScreen page={2} />, });

const Bulletin = dynamic(() => import('./components/BulletinPage'), 
{ loading: () => <LoadingScreen page={3} />, });

const Maintenance = dynamic(() => import('./components/MaintenancePage'), 
{ loading: () => <LoadingScreen page={4} />, });

const Tenants = dynamic(() => import('./components/TenantListPage'), 
{ loading: () => <LoadingScreen page={5} />, });

const Settings = dynamic(() => import('./components/SettingsPage'), 
{ loading: () => <LoadingScreen page={6} />, });

const Tenant = dynamic(() => import('./components/TenantInfo'), 
{ loading: () => <LoadingScreen page={7} />, });

const NewTenant = dynamic(() => import('./components/AddTenant'), 
{ loading: () => <LoadingScreen page={8} />, });

const Chat = dynamic(() => import('./components/Message'), 
{ loading: () => <LoadingScreen page={9} />, });

const AllMedia = dynamic(() => import('./components/AllMedia'), 
{ loading: () => <LoadingScreen page={11} />, });

const Docu = dynamic(() => import('./components/Documentation'), 
{ loading: () => <LoadingScreen page={12} />, });

const Billing = dynamic(() => import('./components/BillingPage'), 
{ loading: () => <LoadingScreen page={12} />, });

export default function Home() {
  const [login, setLogin] = useState(false);
  const [page, setPage] = useState(0);
  const [image, setImage] = useState(false);
  const [nav, setNav] = useState("-right-[9999px]");
  const [contentLoading, setContentLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState("-right-[9999px]");
  const [settleBilling, setSettleBilling] = useState(false);
  const [unit, setUnit] = useState(0);
  const comRef = useRef<HTMLDivElement | null>(null);

  //FOR LOADING SCREEN
  useEffect(() => {
    window.onload = () => {
      setContentLoading(false);
    }
    const fallBackTimeout = setTimeout(() => {
      setContentLoading(false);
    }, 1500);
    return () => {
      window.onload = null;
      clearTimeout(fallBackTimeout);
    }
  }, []);
  
  //FOR NAV
  const handleNavClick = (event: MouseEvent) => {
    if (comRef.current && !comRef.current.contains(event.target as Node)) {
      setNav("-right-[9999px]");
    }
  }
  useEffect(() => {
    document.addEventListener("mousedown", handleNavClick);
    return() => { document.removeEventListener("mousedown", handleNavClick);};
  }, []);

  //PAGING
  const pages: Record<number, JSX.Element> = {
    0: <Mainpage setPage={setPage} setImage={setImage} setSettleBilling={setSettleBilling} setUnit={setUnit} />,
    1: <Dashboard setPage={setPage} />,
    2: <Messages setPage={setPage} />,
    3: <Bulletin setPage={setPage} />,
    4: <Maintenance setPage={setPage} setImage={setImage} />,
    5: <Tenants setPage={setPage} />,
    6: <Settings setPage={setPage} />,
    7: <Tenant setPage={setPage} />,
    8: <NewTenant setPage={setPage} />,
    9: <Chat setPage={setPage} setChatInfo={setChatInfo} />,
    11: <AllMedia setPage={setPage} setImage={setImage} />,
    12: <Docu setPage={setPage} setImage={setImage} />,
    13: <Billing setPage={setPage} setSettleBilling={setSettleBilling} setUnit={setUnit} />,
  };
  return (
    <>
      {contentLoading ? 
        ( <LoadingPage /> ) : 
        ( <main className="h-full w-full flex flex-col items-center relative bg-customViolet">
            <Header login={login} setNav={setNav} setPage={setPage}/>
            <div className="h-full w-full flex flex-col relative overflow-x-hidden">
              {pages[page] || null}

              <ChatInfo setPage={setPage} setChatInfo={setChatInfo} chatInfo={chatInfo}/>
              { image && ( <ShowImage setImage={setImage}/> )}
              <SideNav comRef={comRef} setNav={setNav} nav={nav} setPage={setPage}/>
              { settleBilling && (<SettleBilling setSettleBilling={setSettleBilling} setUnit={setUnit} unit={unit}/>)}
            </div>
          </main>
        )}
    </>
  );
}
