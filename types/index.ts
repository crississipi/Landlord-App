import { RefObject } from "react";

export interface HeaderProps {
  login: boolean;
  setNav: (nav: string) => void;
}

export interface CustomInputProps {
    placeholder: string;
    inputType: string;
    marginBottom: boolean;
}

export interface CustomPriceProps {
    rate: boolean;
    priceStyle: string;
    pesoStyle: string;
    price: string;
}

export interface CustomTextBubbleProps {
    location: string;
    pointer: string;
}

export interface MaintenanceCardProps {
    urgent: boolean;
    unit: string;
    dateSent: string;
    tenant: string;
    info: string;
    button?: boolean;
    docu?: boolean | false;
}

export interface PaymentListProps {
    month?: string;
    unit: string[];
    price: string[];
    paymentType: boolean[];
    date: string[];
}

export interface PaymentProps {
    unit: string;
    price: string;
    paymentType: boolean;
    date?: string;
    withBG?: boolean;
}

export interface ChatHeadProps {
    name: string;
}

export interface ChangePageProps {
    setPage: (page: number) => void;
}

export interface MessageBubbleProps {
    sender: boolean;
}

export interface CustomNavBtnProps {
    btnName: string;
    onClick: () => void;
    mainPage: boolean;
}

export interface SideNavProps {
  setNav: (nav: string) => void;
  setPage: (page: number) => void;
  nav: string;
  comRef: RefObject<HTMLDivElement | null>;
}

export interface TitleButtonProps {
    title: string;
}

export interface DashboardProps {
    size?: string;
    inDbPage?: boolean
}

export interface HeadingProps {
    title: string;
    btn: string;
    page: number;
}

export interface ImageProps {
    setImage: (image: boolean) => void;
    allMedia?: boolean | false;
    removable?: boolean | false;
    imageURL?: string;
    k?: number;
    setSelectedImg?: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface LoadingProps {
    page: number;
}

export interface BarProps {
    size: string;
    rounded?: string;
}

export interface DashboardCardProps {
    paid: boolean;
    value: string;
    priceStyle: string;
    pesoStyle: string;
    rate: boolean;
}

export interface ChartProps {
    type: string;
}

export interface DropDownProps {
    list: string[];
}

export interface ChatInfoProps {
    chatInfo?: string;
    setChatInfo: (chatInfo: string) => void;
}

export interface TenantPerUnitProps {
    unit: number;
    profile: string[];
    name: string[];
    location: string;
}

export interface TenantProps {
  profile: string;
  name: string;
}

export interface BillingProps {
    unit: number;
    prev: number;
    curr: number;
}

export interface NotificationProps {
    newNotif: boolean;
    notifType: string;
    info: string;
    date: string;
}

export interface SetSetttleProps {
    setSettleBilling: (settleBilling: boolean) => void;
    setUnit: (unit: number) => void | 0;
}

export interface BillingListProps {
    month: string;
    unit: number[];
    datePaid: string[];
    electric: number[];
    water: number[];
    rent: number[];
    amount: number[];
    paidElectric: number[];
    paidWater: number[];
    paidRent: number[];
}

export interface BillingSlipProps {
    unit: number;
    datePaid: string;
    electric: number;
    water: number;
    rent: number;
    amount: number;
    paidElectric: number;
    paidWater: number;
    paidRent: number;
}

export interface ReceiptSlipProps {
    utility: string;
    forTotal: boolean;
    amount: number;
    paid: number;
}

export interface SettlePaymentProps { 
    billType: boolean;
}