import { RefObject } from "react";

export interface HeaderProps {
  login: boolean;
  setNav: (nav: string) => void;
  page: number;
}

export interface CustomInputProps {
    placeholder: string;
    inputType: string;
    marginBottom: boolean;
    hookValue: string;
    hookVariable: (hookValue: string) => void;
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

// ✅ KEEP ONLY THIS ONE ChangePageProps declaration
export interface ChangePageProps {
    setPage: (page: number, chatUserId?: number) => void;
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
  setPage: (page: number, chatUserId?: number) => void; // ✅ Update this too
  nav: string;
  comRef: RefObject<HTMLDivElement | null>;
}

export interface TitleButtonProps {
    title: string;
    setPage: (page: number, chatUserId?: number) => void; // ✅ Update this too
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

export interface ChartLandlordProps {
    type: string;
}

export interface DropDownProps {
    list: string[];
    onSelect?: (selected: string) => void;
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

export interface NotifSlipProps{
    icon:string;
    message:string; 
    time:string;
}

export interface ChartProps {
    name: string;
    value: number;
    electric?: number;
    water?: number;
}

// ❌ REMOVE THIS DUPLICATE - it conflicts with the one above
// export interface SetPageProps {
//     setPage: (page: number) => void;
// }   

export interface MessageType {
  messageID: number;
  senderID: number;
  receiverID: number;
  message: string | null;
  dateSent: string;
  read: boolean;
  sender: {
    userID: number;
    firstName: string;
    lastName: string;
  };
  files?: {
    url: string;
    fileName: string;
    fileType: string | null;
    fileSize?: string | null;
  }[];
  batchId?: string | null;
}

export interface Conversation {
  partner: {
    userID: number;
    name: string;
    isOnline: boolean;
    profileImage?: string | null;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  lastMessageSender: string;
}

export interface ChatHeadProps {
  name: string;
  userId?: number;
  isOnline?: boolean;
  profileImage?: string | null;
}

export interface MessageFingerProps {
  name: string;
  lastMessage: string;
  lastMessageSender: string;
  timestamp: string;
  unreadCount: number;
  userId?: number;
  isOnline?: boolean;
  profileImage?: string | null;
}

export interface MessageBubbleProps {
  sender: boolean;
  message: string | null;
  timestamp: string;
  files?: {
    url: string;
    fileName: string;
    fileType: string | null;
    fileSize?: string | null;
  }[];
  batchId?: string | null;
  onViewBilling?: (billingId: number) => void;
  onViewMaintenance?: (maintenanceId: number) => void;
}

export type UnitBillingRow = {
    unit: string;
    prev: number;
    curr: number;
  };
  
  export type BillingCreatePayload = {
    userID: number;      // tenant userID
    propertyId: number;  // property id
    unit: string;        // unit identifier
    month: string;       // e.g. "2025-12"
    totalRent: number;
    totalWater: number;
    totalElectric: number;
    waterMeterImage?: string;    // base64 image
    electricMeterImage?: string; // base64 image
    tenantNames?: string;
    note?: string;
    totalMaintenance?: number;
    billingType: 'rent' | 'utility' | 'all' | 'maintenance'; // type of billing
  };

export interface UnbilledUnit {
  unitNumber: string;
  rent: number;
  tenants: {
    userID: number;
    name: string;
    email?: string;
  }[];
  totalTenants?: number;
}

export interface BillingRecord {
  billingID: number;
  unit: string | null;
  month: string | null;
  totalRent: number;
  totalWater: number;
  totalElectric: number;
  totalAmount: number;
  dateIssued: string;
  billingType: 'rent' | 'utility' | 'all' | 'maintenance';
  paymentStatus: 'pending' | 'partial' | 'paid';
  amountPaid: number;
  dueDate: string | null;
  tenant: {
    userID: number;
    name: string;
    email: string | null;
  };
  property: {
    name: string;
    address: string;
  };
}

export interface PaymentRecord {
  paymentID: number;
  billingID: number;
  userID: number;
  amount: number;
  paymentMethod: 'cash' | 'gcash' | 'bank_transfer';
  paymentStatus: 'partial' | 'fully_paid';
  gcashReceiptImage?: string | null;
  gcashTransactionId?: string | null;
  datePaid: string;
  notes?: string | null;
}

export interface PaymentCreatePayload {
  billingID: number;
  userID: number;
  amount: number;
  paymentMethod: 'cash' | 'gcash' | 'bank_transfer';
  paymentStatus: 'partial' | 'fully_paid';
  gcashReceiptImage?: string;
  gcashTransactionId?: string;
  notes?: string;
}

export interface UnitTenant {
  userID: number;
  name: string;
  email: string | null;
}

// Maintenance Types
export interface MaintenanceRequest {
  maintenanceId: number;
  userId: number;
  propertyId: number;
  rawRequest: string;
  processedRequest: string;
  urgency: string;
  urgencyColor: string;
  status: string;
  schedule: string | null;
  dateIssued: string;
  createdAt: string;
  updatedAt: string;
  isFixed: boolean;
  tenantName: string;
  user?: {
    userID: number;
    firstName: string | null;
    lastName: string | null;
    propertyId: number | null;
  };
  property?: {
    propertyId: number;
    name: string;
  };
  documentations?: {
    docuID: number;
    dateFixed: string;
  }[];
  availabilities?: {
    id: number;
    day: string | null;
    date: string | null;
    timeAvailableFrom: string;
    timeAvailableTo: string;
  }[];
  images?: {
    resourceId: number;
    url: string;
    fileName: string;
  }[];
}

export interface ScheduledByDate {
  [date: string]: MaintenanceRequest[];
}

export interface DocumentationMaterial {
  id?: number;
  material: string;
  cost: number | string;
}

export interface DocumentationResource {
  resourceId?: number;
  url: string;
  fileName: string;
}

export interface MaintenanceDocumentation {
  docuID: number;
  maintenanceID: number;
  remarks: string;
  inChargeName: string | null;
  inChargeNumber: string | null;
  inChargePayment: number | null;
  totalMaterialCost: number | null;
  dateFixed: string;
  dateIssued: string;
  maintenance?: MaintenanceRequest;
  materials?: DocumentationMaterial[];
  images?: DocumentationResource[];
}

export interface CalendaryoProps extends ChangePageProps {
  onSelectMaintenance?: (maintenance: MaintenanceRequest) => void;
}
