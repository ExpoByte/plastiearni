import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "sw";

interface Translations {
  // Navigation
  home: string;
  history: string;
  map: string;
  rewards: string;
  profile: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  delete: string;
  
  // Profile
  editProfile: string;
  notifications: string;
  settings: string;
  helpSupport: string;
  inviteFriends: string;
  logOut: string;
  achievements: string;
  viewAll: string;
  kgCollected: string;
  points: string;
  badges: string;
  ecoWarriorSince: string;
  
  // Settings
  language: string;
  selectLanguage: string;
  english: string;
  swahili: string;
  
  // Edit Profile
  displayName: string;
  phoneNumber: string;
  saveChanges: string;
  profileUpdated: string;
  
  // Rewards
  availablePoints: string;
  exchangePoints: string;
  redeem: string;
  locked: string;
  
  // Auth
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  createAccount: string;
  continueWith: string;
  welcomeBonus: string;
  pleaseSignIn: string;
  
  // Redemption
  redeemReward: string;
  mpesaPhone: string;
  pointsToSpend: string;
  amountToReceive: string;
  processing: string;
  redemptionSuccess: string;
  redemptionFailed: string;
  tryAgain: string;
  done: string;
  
  // History
  redemptionHistory: string;
  trackRewards: string;
  total: string;
  completed: string;
  kesEarned: string;
  noRedemptions: string;
  browseRewards: string;
  pending: string;
  failed: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    home: "Home",
    history: "History",
    map: "Map",
    rewards: "Rewards",
    profile: "Profile",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    
    // Profile
    editProfile: "Edit Profile",
    notifications: "Notifications",
    settings: "Settings",
    helpSupport: "Help & Support",
    inviteFriends: "Invite Friends",
    logOut: "Log Out",
    achievements: "Achievements",
    viewAll: "View All",
    kgCollected: "kg collected",
    points: "points",
    badges: "badges",
    ecoWarriorSince: "Eco Warrior since",
    
    // Settings
    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    swahili: "Kiswahili",
    
    // Edit Profile
    displayName: "Display Name",
    phoneNumber: "Phone Number",
    saveChanges: "Save Changes",
    profileUpdated: "Profile updated successfully",
    
    // Rewards
    availablePoints: "Available Points",
    exchangePoints: "Exchange points for amazing rewards",
    redeem: "Redeem",
    locked: "Locked",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    createAccount: "Create Account",
    continueWith: "Or continue with",
    welcomeBonus: "New users get 500 bonus points!",
    pleaseSignIn: "Please sign in to redeem rewards",
    
    // Redemption
    redeemReward: "Redeem Reward",
    mpesaPhone: "M-Pesa Phone Number",
    pointsToSpend: "Points to spend",
    amountToReceive: "Amount to receive",
    processing: "Processing...",
    redemptionSuccess: "Your reward is on its way!",
    redemptionFailed: "Something went wrong",
    tryAgain: "Try Again",
    done: "Done",
    
    // History
    redemptionHistory: "Redemption History",
    trackRewards: "Track your M-Pesa rewards",
    total: "Total",
    completed: "Completed",
    kesEarned: "KES Earned",
    noRedemptions: "No redemptions yet",
    browseRewards: "Browse Rewards",
    pending: "Pending",
    failed: "Failed",
  },
  sw: {
    // Navigation
    home: "Nyumbani",
    history: "Historia",
    map: "Ramani",
    rewards: "Zawadi",
    profile: "Wasifu",
    
    // Common
    loading: "Inapakia...",
    error: "Hitilafu",
    success: "Imefanikiwa",
    cancel: "Ghairi",
    confirm: "Thibitisha",
    save: "Hifadhi",
    edit: "Hariri",
    delete: "Futa",
    
    // Profile
    editProfile: "Hariri Wasifu",
    notifications: "Arifa",
    settings: "Mipangilio",
    helpSupport: "Msaada",
    inviteFriends: "Alika Marafiki",
    logOut: "Ondoka",
    achievements: "Mafanikio",
    viewAll: "Tazama Zote",
    kgCollected: "kg zilizokusanywa",
    points: "pointi",
    badges: "beji",
    ecoWarriorSince: "Shujaa wa Mazingira tangu",
    
    // Settings
    language: "Lugha",
    selectLanguage: "Chagua Lugha",
    english: "Kiingereza",
    swahili: "Kiswahili",
    
    // Edit Profile
    displayName: "Jina la Kuonyeshwa",
    phoneNumber: "Nambari ya Simu",
    saveChanges: "Hifadhi Mabadiliko",
    profileUpdated: "Wasifu umesasishwa",
    
    // Rewards
    availablePoints: "Pointi Zinazopatikana",
    exchangePoints: "Badilisha pointi kwa zawadi nzuri",
    redeem: "Okoa",
    locked: "Imefungwa",
    
    // Auth
    signIn: "Ingia",
    signUp: "Jisajili",
    email: "Barua pepe",
    password: "Nenosiri",
    createAccount: "Fungua Akaunti",
    continueWith: "Au endelea na",
    welcomeBonus: "Watumiaji wapya wanapata pointi 500 za bonasi!",
    pleaseSignIn: "Tafadhali ingia ili upate zawadi",
    
    // Redemption
    redeemReward: "Okoa Zawadi",
    mpesaPhone: "Nambari ya M-Pesa",
    pointsToSpend: "Pointi za kutumia",
    amountToReceive: "Kiasi cha kupokea",
    processing: "Inachakata...",
    redemptionSuccess: "Zawadi yako inakuja!",
    redemptionFailed: "Kuna hitilafu",
    tryAgain: "Jaribu Tena",
    done: "Imekamilika",
    
    // History
    redemptionHistory: "Historia ya Zawadi",
    trackRewards: "Fuatilia zawadi zako za M-Pesa",
    total: "Jumla",
    completed: "Zimekamilika",
    kesEarned: "KES Zilizopatikana",
    noRedemptions: "Hakuna zawadi bado",
    browseRewards: "Tazama Zawadi",
    pending: "Inasubiri",
    failed: "Imeshindwa",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
