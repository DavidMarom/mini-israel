const he = {
  // App / General
  appName: "מיני ישראל",
  loading: "טוען...",
  close: "סגור",
  cancel: "ביטול",
  save: "שמור",
  send: "שלח",
  sending: "שולח...",
  error: "שגיאה, נסה שוב",
  insufficientFunds: "אין מספיק מטבעות",
  insufficientMoney: "אין מספיק כסף",
  alreadyVip: "כבר VIP!",
  sell: "מכור",
  upgrade: "שדרג",
  upgrading: "משדרג...",
  buying: "רוכש...",
  processing: "מעבד...",
  balance: "יתרה",
  yourBalance: "יתרתך",
  coins: "מטבעות",
  inviteFriends: "הזמן חברים",

  // page.js
  profileSaveError: "לא ניתן לשמור את הפרופיל שלך, נסה שוב מאוחר יותר.",
  googleSignInError: "ההתחברות באמצעות Google נכשלה, נסה שוב.",
  logoutError: "ההתנתקות נכשלה, נסה שוב.",
  saveNameError: "לא ניתן לשמור את השם, נסה שוב.",
  buyVipInsufficientFunds: "אין מספיק מטבעות",
  buyVipAlready: "כבר VIP!",
  buyFarmInsufficientFunds: "אין מספיק מטבעות",
  buyFarmNoHouse: "יש לבנות בית לפני קניית חווה",
  buyFarmAlreadyHas: "כבר יש לך חווה",
  throwPoopError: "שגיאה, נסה שוב",

  // NameModal
  nameModalTitle: "בחר שם לשחקן",
  nameModalText: "זה השם שיופיע לשחקנים אחרים בעולם.",
  nameModalPlaceholder: "השם שלך",

  // AuthCard
  authLoading: "טוען...",
  authSignInPrompt: "התחבר/י כדי להתחיל לשחק",
  authSignIn: "התחבר/י",
  authGameRules: "📖 הוראות משחק",
  authLogout: "התנתק",
  authEditName: "עריכת שם",
  authDisplayNamePlaceholder: "שם תצוגה",
  authBioPlaceholder: "ביו...",
  authSaveName: "שמור",
  authCoins: (amount) => `מטבעות: ${amount} 🪙`,
  authInventoryTitle: "חפצים:",
  authBuyFarmBuying: "קונה חווה...",
  authBuyFarm: "🌾 קנה חווה – 500 🪙",
  authBuyVip: "👑 שדרג ל-VIP – 1,500 🪙",

  // MessagesCard
  messagesTitle: "הודעות",
  messagesEmpty: "אין הודעות",
  messagesReplyTo: (name) => `השב ל${name}`,
  messagesSendItem: "שלח פריט (אופציונלי):",
  messagesAddMessageOptional: "הוסף הודעה (אופציונלי)...",
  messagesWriteReply: "כתוב תשובה...",
  messagesReplySending: "שולח...",
  messagesReplySend: "שלח",
  messagesReplyCancel: "ביטול",
  messagesReplyAriaLabel: "השב להודעה",
  messagesDeleteAriaLabel: "מחק הודעה",

  // ComposeModal
  composeTitle: (name) => `הודעה ל${name}`,
  composeSendItem: "שלח פריט (אופציונלי):",
  composeAddMessageOptional: "הוסף הודעה (אופציונלי)...",
  composeWriteMessage: "כתוב הודעה...",
  composeThrowPoop: (name) => `💩 זרוק קקי על הבית של ${name}`,
  composeThrowing: "זורק...",
  composeSending: "שולח...",
  composeSend: "שלח",
  composeCancel: "ביטול",

  // SplashScreen
  splashAlt: "מיני ישראל",

  // StarHouseBanner
  starHouseTitle: "בית השבוע",
  starHouseSponsor: (sponsor) => `בחסות ${sponsor}`,

  // LotteryPopup
  lotteryTitle: "הגרלה שבועית!",
  lotteryBody1: "ביום שלישי הקרוב תיערך הגרלה על",
  lotteryPrize: "₪100 אמיתיים",
  lotteryCondition: "תנאי להשתתפות: הזמן/י 2 חברים.",
  lotteryNoRegistration: "אין צורך להירשם",
  lotteryInviteWhatsapp: "📲 הזמן חברים בוואטסאפ",
  lotteryClose: "סגור",

  // MobilePortraitOverlay
  mobilePortraitMessage: "סובב את המכשיר לאופק כדי לשחק במיני ישראל",

  // SiteHeader
  siteLogoAlt: "מיני ישראל",
  siteScrollToMyHouse: "מצא את הבית שלי",
  siteShareWhatsapp: "שתף בוואטסאפ",
  siteAdvertisers: "למפרסמים",

  // SidebarFooter
  sidebarFooterOperatedBy: "האתר מופעל ע״י חברת ",
  sidebarFooterTerms: "תקנון",

  // Sidebar
  sidebarOpenMenu: "פתח תפריט",
  sidebarCloseMenu: "סגור תפריט",

  // GameBoard — General
  onlineNow: "מחוברים כרגע:",

  // GameBoard — Cashout
  cashoutMissingPhone: "יש להזין מספר טלפון",
  cashoutMinimum: "מינימום 1000 מטבעות",
  cashoutInsufficientFunds: "אין מספיק מטבעות",
  cashoutGenericError: "שגיאה, נסה שוב",
  cashoutBuildingLabel: "המר לכסף אמיתי!!",
  cashoutTitle: "💵 המר מטבעות לכסף אמיתי",
  cashoutSuccess: "✅ הבקשה התקבלה! הכסף יועבר בביט בהקדם.",
  cashoutInfoBit: "הכסף יעבור בביט למספר שתזינו",
  cashoutInfoRate: "על כל 200 מטבעות תקבלו 1 שקל אמיתי",
  cashoutInfoMin: "מינימום 1000 מטבעות משחק להעברה",
  cashoutPhoneLabel: "מספר טלפון לביט",
  cashoutAmountLabel: "כמות מטבעות לפדיון",
  cashoutAmountPlaceholder: "מינימום 1000",
  cashoutCalc: (amount) => `תקבל: ₪${Math.floor(Number(amount) / 200)}`,
  cashoutSending: "שולח...",
  cashoutSubmit: "שלח בקשה",
  cashoutClose: "סגור",
  cashoutBalanceLabel: "יתרתך:",

  // GameBoard — Tiles / Buildings
  shirtAlt: "חולצה",
  dirtyHouseAlt: "בית מלוכלך",
  mainHouseAlt: "בית ראשי",
  cleanHouseHint: "לחץ לניקוי 🧹",
  communityCenter: "מרכז קהילתי",
  farmAlt: "חווה",
  mainHousePlacementAlt: "מיקום בית ראשי",
  azrieliAlt: "בניין אזריאלי",
  synagogueAlt: "בית כנסת",
  knessetAlt: "הכנסת",
  yadSaraAlt: "יד שרה",
  eilatAlt: "אילת",
  powerPlantAlt: "תחנת כוח",
  candleBuildingAlt: "בניין הנר",
  cameraPhotoAlt: "תמונה שלי",
  cameraLabel: "צלמו את עצמכם!",
  cameraTakePhoto: "צלם אותי",
  godzillaAlt: "גודזילה",

  // GameBoard — Leaderboard building
  leaderboardBuildingLabel: "מצעד העשירים",

  // GameBoard — Trivia building
  triviaBuildingLabel: "טריוויה",

  // GameBoard — Poll
  pollVoteMessi: "הצבע למסי",
  pollVoteRonaldo: "הצבע לרונאלדו",
  pollMessiAlt: "מסי",
  pollRonaldoAlt: "רונאלדו",

  // GameBoard — Neighborhood
  neighborhoodCount: (count) => `${count} שכנים`,
  neighborhoodCollected: "✓ נאסף היום",

  // GameBoard — Ad board
  adBoardEmpty: "פרסם כאן!",
  adBoardAddTitle: "הוסף פרסומת",
  adBoardAddPopupTitle: "הוסף פרסומת",
  adBoardPlaceholder: "טקסט הפרסומת...",
  adBoardInfo1: "עולה 100 מטבעות. הפרסום ישאר בלוח 5 ימים.",
  adBoardInfo2: "מותר לפרסם הכל, גם קישורים. אנא שימרו על שפה נאותה.",
  adBoardSubmitting: "שולח...",
  adBoardSubmit: "פרסם",
  adBoardCancel: "ביטול",

  // GameBoard — Azrieli Shop
  azrieliShopTitle: "🏬 קניון אזריאלי",
  azrieliShopBalance: (amount) => `יתרה: ${amount} 🪙`,
  azrieliShopClose: "סגור",

  // GameBoard — Candle Shop
  candleShopTitle: "🕯️ חנות הנרות",
  candleShopSubtitle: "יום האשה הבינלאומי",
  candleShopThanks: "הנר נרכש! 🕯️✨\nחג האשה שמח!",
  candleShopClose: "סגור",
  candleAlt: "נר",
  candleDesc: "רכוש נר לכבוד יום האשה הבינלאומי 🌸",
  candleBalance: (amount) => `יתרתך: ${amount} מטבעות`,
  candleBuying: "מעבד...",
  candleBuy: "רכוש נר - 40 🪙",

  // GameBoard — Camera
  cameraCaptureTitle: "צלם תמונה",
  cameraCaptureBtn: "צלם",
  cameraCancelBtn: "ביטול",

  // GameBoard — Treasure
  treasureAlreadyClaimed: "מישהו אחר כבר מצא את האוצר!",
  treasureFound: (name) => `${name} מצא את האוצר!`,
  treasureSponsor: (sponsor) => `בחסות ${sponsor}`,

  // GameBoard — Leaderboard modal
  leaderboardTitle: "🏆 מצעד העשירים",
  leaderboardLoading: "טוען...",
  leaderboardAnonymous: "אנונימי",
  leaderboardClose: "סגור",

  // GameBoard — Knesset (sell)
  knessetTitle: "🏛️ הכנסת",
  knessetBalance: (amount) => `יתרה שלך: ${amount} 🪙`,
  knessetNotLoggedIn: "התחבר כדי למכור פריטים",
  knessetNoItems: "אין לך פריטים למכירה.\nקנה פריטים בקניון אזריאלי!",
  knessetSell: "מכור",
  knessetClose: "סגור",

  // GameBoard — Yad Sara
  yadSaraTitle: "❤️ תרומה לעמותת יד שרה",
  yadSaraThanks: "תודה רבה על תרומתך! 🙏",
  yadSaraCooldown: "כבר תרמת השבוע — תודה! ניתן לתרום שוב בשבוע הבא 💙",
  yadSaraMsg: "בכל תרומה של 100 🪙 משחק, אנחנו נתרום ₪2 לעמותת יד שרה!",
  yadSaraBalance: (amount) => `יתרתך: ${amount} מטבעות`,
  yadSaraDonating: "שולח תרומה...",
  yadSaraDonate: "תרום 100 מטבעות",
  yadSaraClose: "סגור",
  yadSaraInsufficientFunds: "אין מספיק מטבעות לתרומה",

  // GameBoard — Trivia modal
  triviaTitle: "🧠 טריוויה",
  triviaLevelEasy: "שאלה קלה - 10 מטבעות",
  triviaLevelHard: "שאלה קשה - 20 מטבעות",
  triviaCorrect: (amount, awarding) => `✅ נכון! +${amount} מטבעות${awarding ? " (מעדכן...)" : ""}`,
  triviaWrong: (correctAnswer) => `❌ לא נכון. התשובה הנכונה: ${correctAnswer}`,
  triviaNextQuestion: "שאלה הבאה",
  triviaClose: "סגור",

  // GameBoard — Synagogue
  synagogueTitle: "🕍 פרשת השבוע",
  synagogueLoading: "טוען...",
  synagogueNotFound: "לא נמצאה פרשה",
  synagogueClose: "סגור",

  // GameBoard — Farm Modal
  farmTitle: "🌾 החווה שלי",
  farmBalance: (amount) => `יתרה: ${amount} 🪙`,
  farmLevel: (level, coins) => `רמה ${level} - ${coins} מטבעות לביצה`,
  farmCollecting: "אוסף...",
  farmCollect: "🥚 אסוף ביצה",
  farmNextEgg: "הביצה הבאה תהיה מוכנה בשעה הקרובה",
  farmInsufficientFunds: "אין מספיק מטבעות לשדרוג",
  farmNeedShirts: "לשדרוג ראשון נדרשות לפחות 2 חולצות שקיבלת מחברים",
  farmUpgradeError: "שגיאה, נסה שוב",
  farmUpgrading: "משדרג...",
  farmUpgrade: (level, cost) => `⬆️ שדרג לרמה ${level} – ${cost} 🪙`,
  farmMaxLevel: "✅ חווה ברמה מקסימלית! (80 מטבעות לביצה)",
  farmClose: "סגור",

  // GameBoard — House Modal
  houseTitle: "🏠 הבית שלי",
  houseBalance: (amount) => `יתרה: ${amount} 🪙`,
  houseSkinLabel: "עיצוב הבית:",
  houseLevelOf5: (level) => `רמה ${level} מתוך 5`,
  houseBonus: (bonus) => `בונוס: +${bonus} מטבעות לביצה`,
  houseRequirementsLine: (level, cost) => `לרמה ${level}: ${cost} 🪙 + `,
  houseInsufficientFunds: "אין מספיק מטבעות לשדרוג",
  houseMaxLevel: "הבית כבר ברמה המקסימלית",
  houseFriendItemsRequired: "נדרשים פריטים מחברים",
  houseUpgradeError: "שגיאה, נסה שוב",
  houseUpgrading: "משדרג...",
  houseUpgrade: (level, cost) => `⬆️ שדרג לרמה ${level} – ${cost} 🪙`,
  houseGoldMax: "✅ בית זהב! רמה מקסימלית (+35 מטבעות לביצה)",
  houseClose: "סגור",
  houseCCAvailable: "🏛️ מרכז קהילתי זמין לרכישה!",
  houseCCCost: "600 🪙 + 2 דגלים מחברים",
  houseNeedLevel3: "נדרש בית ברמה 3 לפחות",
  houseInsufficientFundsCC: "אין מספיק מטבעות",
  houseCCNeedFlags: "נדרשים 2 דגלים שקיבלת מחברים",
  houseCCAlreadyHas: "כבר יש לך מרכז קהילתי",
  houseCCNeedFlagsFromFriends: "נדרשים 2 דגלים מחברים",
  houseCCError: "שגיאה, נסה שוב",
  houseCCBuying: "רוכש...",
  houseCCBuy: "🏛️ קנה מרכז קהילתי – 600 🪙",

  // GameBoard — CC Modal
  ccTitle: "🏛️ המרכז הקהילתי",
  ccBalance: (amount) => `יתרה: ${amount} 🪙`,
  ccLevelOf5: (level) => `רמה ${level} מתוך 5`,
  ccBonus: (bonus) => `בונוס: +${bonus} מטבעות על כל פריט שמתקבל מחבר`,
  ccInsufficientFunds: "אין מספיק מטבעות לשדרוג",
  ccMaxLevel: "המרכז כבר ברמה המקסימלית",
  ccUpgradeError: "שגיאה, נסה שוב",
  ccUpgrading: "משדרג...",
  ccUpgrade: (level, cost) => `⬆️ שדרג לרמה ${level} – ${cost} 🪙`,
  ccMaxLevelMsg: "✅ מרכז קהילתי ברמה מקסימלית! (+50 מטבעות לכל פריט)",
  ccClose: "סגור",

  // GameBoard — Power Plant
  powerPlantTitle: "⚡ תחנת הכוח",
  powerPlantBalance: (amount) => `יתרה: ${amount} 🪙`,
  powerPlantActiveSubscription: "✅ מנוי חשמל פעיל! +20 מטבעות לכל ביצה",
  powerPlantExpiry: (date) => `פג תוקף: ${date}`,
  powerPlantDesc: "קנה מנוי חשמל ל-7 ימים וקבל +20 מטבעות על כל ביצה שאתה אוסף!",
  powerPlantSubscribing: "רוכש...",
  powerPlantSubscribe: "⚡ קנה מנוי – 400 🪙",
  powerPlantClose: "סגור",
  powerPlantInsufficientFunds: "אין מספיק מטבעות",

  // GameBoard — Godzilla
  godzillaTitle: "גודזילה!",
  godzillaWarning: "🚨 אזהרה! גודזילה נמצא בשכונה!",
  godzillaDesc: "המפלצת הענקית מסתובבת בין הבתים ומאיימת על כל מה שבנית.\nרק הבתים החזקים ישרדו...",
  godzillaRun: "ברח! 🏃",

  // GameBoard — Items (used in ITEM_NAMES map)
  itemFlowers: "פרחים",
  itemFalafel: "פלאפל",
  itemFlags: "דגלים",
  itemShirts: "חולצות",
  itemHeadphones: "אוזניות",
  itemPCs: "מחשבים",
  itemBikes: "אופניים",

  // GameBoard — Shop items (names)
  shopItemFlower: "פרח",
  shopItemFalafel: "פלאפל",
  shopItemFlag: "דגל ישראל",
  shopItemBike: "אופניים",
  shopItemHeadphones: "אוזניות",
  shopItemPC: "מחשב",
  shopItemShirt: "חולצה",
};

export default he;
