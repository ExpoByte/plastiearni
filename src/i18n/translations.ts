export type Language = "en" | "sw";

export interface Translations {
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
  back: string;
  viewAll: string;
  seeAll: string;
  skip: string;
  next: string;
  getStarted: string;
  
  // Dashboard
  welcome: string;
  totalPoints: string;
  totalCollected: string;
  thisMonth: string;
  impactScore: string;
  topInKenya: string;
  monthlyGoal: string;
  moreToGoal: string;
  quickActions: string;
  logCollection: string;
  findPoints: string;
  yourBadges: string;
  recentActivity: string;
  
  // Profile
  editProfile: string;
  notifications: string;
  settings: string;
  helpSupport: string;
  inviteFriends: string;
  logOut: string;
  achievements: string;
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
  
  // Categories
  all: string;
  airtime: string;
  vouchers: string;
  cash: string;
  donate: string;
  
  // Auth
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  createAccount: string;
  continueWith: string;
  welcomeBonus: string;
  pleaseSignIn: string;
  welcomeBack: string;
  checkEmail: string;
  turnTrashToTreasure: string;
  
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
  collectionHistory: string;
  trackImpact: string;
  total: string;
  completed: string;
  kesEarned: string;
  noRedemptions: string;
  browseRewards: string;
  pending: string;
  failed: string;
  noCollections: string;
  verified: string;
  
  // Map
  nearbyPoints: string;
  found: string;
  searchPoints: string;
  gpsActive: string;
  locateMe: string;
  locationFound: string;
  gettingLocation: string;
  
  // Onboarding
  collectPlastic: string;
  collectPlasticDesc: string;
  findDropPoints: string;
  findDropPointsDesc: string;
  earnPoints: string;
  earnPointsDesc: string;
  redeemRewards: string;
  redeemRewardsDesc: string;
  
  // Log Collection
  logCollectionTitle: string;
  recordCollection: string;
  weight: string;
  enterWeight: string;
  plasticType: string;
  collectionLocation: string;
  whereCollected: string;
  notesOptional: string;
  additionalDetails: string;
  pointsYouEarn: string;
  submitCollection: string;
  congratulations: string;
  youEarnedPoints: string;
  backToDashboard: string;
  logAnother: string;
  verificationPhoto: string;
  takePhoto: string;
  uploadPhoto: string;
  removePhoto: string;
  uploading: string;
  submitting: string;
  selectImage: string;
  imageTooLarge: string;
  failedSubmit: string;
  collectionRecorded: string;
}

export const translations: Record<Language, Translations> = {
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
    back: "Back",
    viewAll: "View All",
    seeAll: "See All",
    skip: "Skip",
    next: "Next",
    getStarted: "Get Started",
    
    // Dashboard
    welcome: "Welcome",
    totalPoints: "Total Points",
    totalCollected: "Total Collected",
    thisMonth: "This month",
    impactScore: "Impact Score",
    topInKenya: "Top 10% in Kenya",
    monthlyGoal: "Monthly Goal",
    moreToGoal: "kg more to reach your goal!",
    quickActions: "Quick Actions",
    logCollection: "Log Collection",
    findPoints: "Find Points",
    yourBadges: "Your Badges",
    recentActivity: "Recent Activity",
    
    // Profile
    editProfile: "Edit Profile",
    notifications: "Notifications",
    settings: "Settings",
    helpSupport: "Help & Support",
    inviteFriends: "Invite Friends",
    logOut: "Log Out",
    achievements: "Achievements",
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
    
    // Categories
    all: "All",
    airtime: "Airtime",
    vouchers: "Vouchers",
    cash: "Cash",
    donate: "Donate",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    createAccount: "Create Account",
    continueWith: "Or continue with",
    welcomeBonus: "New users get 500 bonus points!",
    pleaseSignIn: "Please sign in to redeem rewards",
    welcomeBack: "Welcome back!",
    checkEmail: "Check your email to verify your account!",
    turnTrashToTreasure: "Turn trash into treasure",
    
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
    collectionHistory: "Collection History",
    trackImpact: "Track your environmental impact in Kenya",
    total: "Total",
    completed: "Completed",
    kesEarned: "KES Earned",
    noRedemptions: "No redemptions yet",
    browseRewards: "Browse Rewards",
    pending: "Pending",
    failed: "Failed",
    noCollections: "No collections found",
    verified: "Verified",
    
    // Map
    nearbyPoints: "Nearby Collection Points",
    found: "found",
    searchPoints: "Search collection points in Kenya...",
    gpsActive: "GPS Active",
    locateMe: "Find my location",
    locationFound: "Location found",
    gettingLocation: "Getting your location...",
    
    // Onboarding
    collectPlastic: "Collect Plastic",
    collectPlasticDesc: "Gather plastic waste from your home, community, or anywhere you find it. Every piece counts towards a cleaner planet.",
    findDropPoints: "Find Drop Points",
    findDropPointsDesc: "Use our map to locate the nearest collection points. Our network of recycling partners is always ready to receive your plastics.",
    earnPoints: "Earn Points",
    earnPointsDesc: "Get rewarded for every kilogram of plastic you collect. Watch your points grow as you help save the environment.",
    redeemRewards: "Redeem Rewards",
    redeemRewardsDesc: "Exchange your points for airtime, vouchers, or cash. Your environmental efforts pay off in real rewards!",
    
    // Log Collection
    logCollectionTitle: "Log Collection",
    recordCollection: "Record your plastic collection",
    weight: "Weight (kg)",
    enterWeight: "Enter weight",
    plasticType: "Plastic Type",
    collectionLocation: "Collection Location",
    whereCollected: "Where did you collect?",
    notesOptional: "Notes (Optional)",
    additionalDetails: "Any additional details",
    pointsYouEarn: "Points You'll Earn",
    submitCollection: "Submit Collection",
    congratulations: "Congratulations!",
    youEarnedPoints: "You've earned points",
    backToDashboard: "Back to Dashboard",
    logAnother: "Log Another",
    verificationPhoto: "Verification Photo",
    takePhoto: "Take Photo",
    uploadPhoto: "Upload Photo",
    removePhoto: "Remove Photo",
    uploading: "Uploading photo...",
    submitting: "Submitting...",
    selectImage: "Please select an image file",
    imageTooLarge: "Image is too large (max 5MB)",
    failedSubmit: "Failed to submit collection",
    collectionRecorded: "Collection recorded!",
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
    back: "Rudi",
    viewAll: "Tazama Zote",
    seeAll: "Ona Zote",
    skip: "Ruka",
    next: "Inayofuata",
    getStarted: "Anza Sasa",
    
    // Dashboard
    welcome: "Karibu",
    totalPoints: "Pointi Zote",
    totalCollected: "Jumla Iliyokusanywa",
    thisMonth: "Mwezi huu",
    impactScore: "Alama ya Athari",
    topInKenya: "10% bora Kenya",
    monthlyGoal: "Lengo la Mwezi",
    moreToGoal: "kg zaidi kufikia lengo lako!",
    quickActions: "Vitendo vya Haraka",
    logCollection: "Rekodi Mkusanyiko",
    findPoints: "Tafuta Vituo",
    yourBadges: "Beji Zako",
    recentActivity: "Shughuli za Hivi Karibuni",
    
    // Profile
    editProfile: "Hariri Wasifu",
    notifications: "Arifa",
    settings: "Mipangilio",
    helpSupport: "Msaada",
    inviteFriends: "Alika Marafiki",
    logOut: "Ondoka",
    achievements: "Mafanikio",
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
    
    // Categories
    all: "Zote",
    airtime: "Muda wa Maongezi",
    vouchers: "Vocha",
    cash: "Pesa Taslimu",
    donate: "Changia",
    
    // Auth
    signIn: "Ingia",
    signUp: "Jisajili",
    email: "Barua pepe",
    password: "Nenosiri",
    createAccount: "Fungua Akaunti",
    continueWith: "Au endelea na",
    welcomeBonus: "Watumiaji wapya wanapata pointi 500 za bonasi!",
    pleaseSignIn: "Tafadhali ingia ili upate zawadi",
    welcomeBack: "Karibu tena!",
    checkEmail: "Angalia barua pepe yako kuthibitisha akaunti!",
    turnTrashToTreasure: "Geuza takataka kuwa hazina",
    
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
    collectionHistory: "Historia ya Mkusanyiko",
    trackImpact: "Fuatilia athari yako kwa mazingira Kenya",
    total: "Jumla",
    completed: "Zimekamilika",
    kesEarned: "KES Zilizopatikana",
    noRedemptions: "Hakuna zawadi bado",
    browseRewards: "Tazama Zawadi",
    pending: "Inasubiri",
    failed: "Imeshindwa",
    noCollections: "Hakuna mkusanyiko uliopatikana",
    verified: "Imethibitishwa",
    
    // Map
    nearbyPoints: "Vituo vya Kukusanya Karibu",
    found: "vimepatikana",
    searchPoints: "Tafuta vituo vya kukusanya Kenya...",
    gpsActive: "GPS Inafanya Kazi",
    locateMe: "Tafuta eneo langu",
    locationFound: "Eneo limepatikana",
    gettingLocation: "Inatafuta eneo lako...",
    
    // Onboarding
    collectPlastic: "Kusanya Plastiki",
    collectPlasticDesc: "Kusanya taka za plastiki kutoka nyumbani kwako, jamii, au popote unapopata. Kila kipande ni muhimu kwa sayari safi.",
    findDropPoints: "Tafuta Vituo",
    findDropPointsDesc: "Tumia ramani yetu kupata vituo vya kukusanya vilivyo karibu. Mtandao wetu wa washirika wa kurecycle uko tayari kupokea plastiki yako.",
    earnPoints: "Pata Pointi",
    earnPointsDesc: "Upate zawadi kwa kila kilo ya plastiki unayokusanya. Tazama pointi zako zikua unapohifadhi mazingira.",
    redeemRewards: "Okoa Zawadi",
    redeemRewardsDesc: "Badilisha pointi zako kwa muda wa maongezi, vocha, au pesa taslimu. Jitihada zako za mazingira zinalipa zawadi halisi!",
    
    // Log Collection
    logCollectionTitle: "Rekodi Mkusanyiko",
    recordCollection: "Rekodi plastiki yako uliyokusanya",
    weight: "Uzito (kg)",
    enterWeight: "Ingiza uzito",
    plasticType: "Aina ya Plastiki",
    collectionLocation: "Mahali pa Kukusanya",
    whereCollected: "Wapi ulikokusanya?",
    notesOptional: "Maelezo (Si lazima)",
    additionalDetails: "Maelezo yoyote ya ziada",
    pointsYouEarn: "Pointi Utakazopata",
    submitCollection: "Wasilisha Mkusanyiko",
    congratulations: "Hongera!",
    youEarnedPoints: "Umepata pointi",
    backToDashboard: "Rudi Nyumbani",
    logAnother: "Rekodi Nyingine",
    verificationPhoto: "Picha ya Uthibitisho",
    takePhoto: "Piga Picha",
    uploadPhoto: "Pakia Picha",
    removePhoto: "Ondoa Picha",
    uploading: "Inapakia picha...",
    submitting: "Inawasilisha...",
    selectImage: "Tafadhali chagua picha",
    imageTooLarge: "Picha ni kubwa sana (max 5MB)",
    failedSubmit: "Imeshindwa kuwasilisha",
    collectionRecorded: "Mkusanyiko umerekodiwa!",
  },
};
