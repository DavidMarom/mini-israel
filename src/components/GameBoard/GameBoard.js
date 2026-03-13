"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameBoard.module.css";
import useUserStore from "../../store/useUserStore";
import TRIVIA_QUESTIONS from "../../data/triviaQuestions";
import { fireConfetti } from "../../utils/confetti";
import he from "../../lang/he";

const ROWS = 230;
const COLS = 15;
const TILE_SIZE = 64;

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

function renderWithLinks(text) {
  return text.split(URL_REGEX).map((part, i) => {
    if (!URL_REGEX.test(part)) return part;
    const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={styles.adLink}>
        {part}
      </a>
    );
  });
}

const AZRIELI_ROW = 11;
const AZRIELI_COL = 5;
const AZRIELI_W = 2;
const AZRIELI_H = 2;

const SYNAGOGUE_ROW = 50;
const SYNAGOGUE_COL = 7;
const SYNAGOGUE_W = 2;
const SYNAGOGUE_H = 2;

const KNESSET_ROW = 57;
const KNESSET_COL = 9;
const KNESSET_W = 3;
const KNESSET_H = 2;

const CAMERA_ROW = 69;
const CAMERA_COL = 5;
const CAMERA_W = 3;
const CAMERA_H = 3;

const LEADERBOARD_ROW = 22;
const LEADERBOARD_COL = 6;
const LEADERBOARD_W = 2;
const LEADERBOARD_H = 2;

const YAD_SARA_ROW = LEADERBOARD_ROW + LEADERBOARD_H + 3;
const YAD_SARA_COL = LEADERBOARD_COL - 2;
const YAD_SARA_W = 2;
const YAD_SARA_H = 2;

const CASHOUT_ROW = CAMERA_ROW + CAMERA_H + 5;
const CASHOUT_COL = CAMERA_COL - 3;
const CASHOUT_W = 2;
const CASHOUT_H = 2;

const TRIVIA_ROW = YAD_SARA_ROW + YAD_SARA_H + 3;
const TRIVIA_COL = YAD_SARA_COL;
const TRIVIA_W = 3;
const TRIVIA_H = 3;

const POLL_W = 3;
const POLL_H = 3;
const POLL_COL = 6;
const POLL_ROW = 215;

const CANDLE_ROW = POLL_ROW - 7;
const CANDLE_COL = POLL_COL;
const CANDLE_W = 3;
const CANDLE_H = 3;

const EILAT_ROW = 222;
const EILAT_COL = 6;
const EILAT_W = 3;
const EILAT_H = 3;

const AD_ROW = 7;
const AD_COL = 6;
const AD_W = 3;
const AD_H = 2;

const POWERPLANT_ROW = 90;
const POWERPLANT_COL = 4;
const POWERPLANT_W = 3;
const POWERPLANT_H = 3;

const GODZILLA_ROW = 57; // left of Knesset (rows 57-60, cols 5-8 — Synagogue ends row 51, Camera starts row 69)
const GODZILLA_COL = 5;
const GODZILLA_W = 4;
const GODZILLA_H = 4;

const HOUSE_IMAGES = [
  "/assets/house/house_1.png",
  "/assets/house/house_2.png",
  "/assets/house/house_3.png",
  "/assets/house/house_4.png",
];

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function GameBoard({ onOtherHouseClick, justPoopedUid, boardRefreshKey, onHasFarmChange, boardRef }) {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [hover, setHover] = useState(null);
  const [houseTooltip, setHouseTooltip] = useState(null); // { x, y, ownerName, bio }
  const tooltipTimer = useRef(null);
  const { user, setUser, setMainHouse, needsHousePlacement } = useUserStore();

  const [onlineCount, setOnlineCount] = useState(null);
  useEffect(() => { setOnlineCount(Math.floor(Math.random() * 500) + 500); }, []);

  useEffect(() => {
    if (!onHasFarmChange || !user) return;
    const uid = user.firebaseUid || user.uid;
    const hasFarm = grid.some((r) => r.some((c) => c && c.building === "farm" && c.ownerUid === uid));
    onHasFarmChange(hasFarm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, user]);

  // Power Plant
  const [showPowerPlant, setShowPowerPlant] = useState(false);
  const [powerPlantSubscribing, setPowerPlantSubscribing] = useState(false);

  // Farm Modal (upgrade + collect)
  const [showFarmModal, setShowFarmModal] = useState(null); // { row, col, cell }
  const [farmUpgrading, setFarmUpgrading] = useState(false);
  const [farmCollecting, setFarmCollecting] = useState(false);
  const [farmUpgradeMsg, setFarmUpgradeMsg] = useState(null);

  // House Upgrade Modal
  const [showHouseModal, setShowHouseModal] = useState(null); // { row, col, cell }
  const [houseUpgrading, setHouseUpgrading] = useState(false);
  const [houseUpgradeMsg, setHouseUpgradeMsg] = useState(null);
  const [houseSkinChanging, setHouseSkinChanging] = useState(false);

  // Community Center Modal
  const [showCCModal, setShowCCModal] = useState(null); // { row, col, cell }
  const [ccUpgrading, setCCUpgrading] = useState(false);
  const [ccBuying, setCCBuying] = useState(false);
  const [ccMsg, setCCMsg] = useState(null);

  // Cashout
  const [showCashout, setShowCashout] = useState(false);
  const [cashoutPhone, setCashoutPhone] = useState("");
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [cashoutSending, setCashoutSending] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);
  const [cashoutError, setCashoutError] = useState("");

  const handleCashout = async () => {
    setCashoutError("");
    const coins = Number(cashoutAmount);
    if (!cashoutPhone.trim()) { setCashoutError(he.cashoutMissingPhone); return; }
    if (!coins || coins < 1000) { setCashoutError(he.cashoutMinimum); return; }
    if (!user || (user.money ?? 0) < coins) { setCashoutError(he.cashoutInsufficientFunds); return; }
    setCashoutSending(true);
    try {
      const res = await fetch("/api/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cashoutPhone.trim(), coins, uid: user.firebaseUid, name: user.name }),
      });
      const data = await res.json();
      if (data.ok) {
        setCashoutDone(true);
        setUser((prev) => ({ ...prev, money: (prev?.money ?? 0) - coins }));
      } else {
        setCashoutError(data.error || he.cashoutGenericError);
      }
    } catch (e) {
      setCashoutError(he.cashoutGenericError);
    } finally {
      setCashoutSending(false);
    }
  };

  const [showAzrieliShop, setShowAzrieliShop] = useState(false);

  // Candle shop
  const [showCandleShop, setShowCandleShop] = useState(false);
  const [candleBuying, setCandleBuying] = useState(false);
  const [candleDone, setCandleDone] = useState(false);

  // Config: star house + treasure winner + yad sara visibility
  const dismissedTreasureRef = useRef(null); // claimedAt string of dismissed toast
  const [starHouseUid, setStarHouseUid] = useState(null);
  const [starHouseName, setStarHouseName] = useState(null);
  const [starHouseSponsor, setStarHouseSponsor] = useState(null);
  const [treasureWinnerToast, setTreasureWinnerToast] = useState(null); // { name, sponsor }
  const [yadSaraVisible, setYadSaraVisible] = useState(true);

  // Leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [cameraPhoto, setCameraPhoto] = useState(null);
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetch("/api/camera-photo")
      .then((r) => r.json())
      .then((data) => { if (data.photo) setCameraPhoto(data.photo); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!showCameraPopup) return;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(console.error);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [showCameraPopup]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCameraPhoto(dataUrl);
    fetch("/api/camera-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: dataUrl }),
    }).catch(console.error);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCameraPopup(false);
  };

  useEffect(() => {
    const fetchConfig = () => {
      fetch("/api/config")
        .then((r) => r.json())
        .then((data) => {
          if (data.starHouse) {
            setStarHouseUid(data.starHouse.uid);
            setStarHouseName(data.starHouse.name);
            setStarHouseSponsor(data.starHouse.sponsor);
          }
          if (data.treasureWinner) {
            const claimedAt = data.treasureWinner.claimedAt;
            const age = Date.now() - new Date(claimedAt).getTime();
            if (age < 24 * 60 * 60 * 1000 && dismissedTreasureRef.current !== claimedAt) {
              dismissedTreasureRef.current = claimedAt;
              setTreasureWinnerToast({ name: data.treasureWinner.name, sponsor: data.treasureWinner.sponsor, claimedAt });
              setTimeout(() => setTreasureWinnerToast(null), 8000);
            }
          }
          setYadSaraVisible(data.yadSaraVisible !== false);
        })
        .catch(console.error);
    };
    fetchConfig();
    const interval = setInterval(fetchConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLeaderboardClick = async () => {
    setShowLeaderboard(true);
    if (leaderboard.length > 0) return;
    setLeaderboardLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (Array.isArray(data.users)) setLeaderboard(data.users);
    } catch (e) { console.error(e); }
    finally { setLeaderboardLoading(false); }
  };

  const handlePowerPlantClick = () => setShowPowerPlant(true);

  const [showGodzilla, setShowGodzilla] = useState(false);

  const handlePowerSubscribe = async () => {
    if (!user || powerPlantSubscribing) return;
    const ownerUid = user.firebaseUid || user.uid;
    setPowerPlantSubscribing(true);
    try {
      const res = await fetch("/api/powerplant/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error === "Insufficient funds" ? he.powerPlantInsufficientFunds : he.error);
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, powerBoostExpiry: data.powerBoostExpiry }));
      fireConfetti();
    } catch (e) { console.error(e); }
    finally { setPowerPlantSubscribing(false); }
  };

  const handleFarmModalCollect = async () => {
    if (!user || !showFarmModal || farmCollecting) return;
    const ownerUid = user.firebaseUid || user.uid;
    const { row, col } = showFarmModal;
    setFarmCollecting(true);
    const next = grid.map((r) => r.slice());
    next[row][col] = { ...next[row][col], eggReady: false };
    setGrid(next);
    setShowFarmModal((prev) => prev ? { ...prev, cell: { ...prev.cell, eggReady: false } } : null);
    try {
      const res = await fetch("/api/farm/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid }),
      });
      const data = await res.json();
      if (data.money != null) { setUser((prev) => ({ ...prev, money: data.money })); fireConfetti(); }
    } catch (e) { console.error(e); }
    finally { setFarmCollecting(false); }
  };

  const handleFarmUpgrade = async () => {
    if (!user || !showFarmModal || farmUpgrading) return;
    const ownerUid = user.firebaseUid || user.uid;
    const currentLevel = showFarmModal.cell.farmLevel || 1;
    if (currentLevel >= 3) return;
    const cost = currentLevel === 1 ? 600 : 1200;

    // Check conditions before calling API
    if ((user.money || 0) < cost) {
      setFarmUpgradeMsg(he.farmInsufficientFunds);
      return;
    }
    if (currentLevel === 1) {
      const friendShirts = (user.inventory || []).filter((i) => i.id === "shirt" && i.fromFriend);
      if (friendShirts.length < 2) {
        setFarmUpgradeMsg(he.farmNeedShirts);
        return;
      }
    }

    setFarmUpgradeMsg(null);
    setFarmUpgrading(true);
    try {
      const res = await fetch("/api/farm/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFarmUpgradeMsg(
          data.error === "Insufficient funds" ? he.farmInsufficientFunds :
          data.error === "Need friend shirts" ? he.farmNeedShirts :
          he.farmUpgradeError
        );
        return;
      }
      setFarmUpgradeMsg(null);
      setUser((prev) => ({ ...prev, money: data.money }));
      fireConfetti();
      const { row, col } = showFarmModal;
      const next = grid.map((r) => r.slice());
      next[row][col] = { ...next[row][col], farmLevel: data.farmLevel };
      setGrid(next);
      setShowFarmModal((prev) => prev ? { ...prev, cell: { ...prev.cell, farmLevel: data.farmLevel } } : null);
    } catch (e) { console.error(e); }
    finally { setFarmUpgrading(false); }
  };

  const handleHouseUpgrade = async () => {
    if (!user || !showHouseModal || houseUpgrading) return;
    const ownerUid = user.firebaseUid || user.uid;
    const currentLevel = showHouseModal.cell.houseLevel || 1;
    if (currentLevel >= 5) return;
    const req = HOUSE_UPGRADE_COSTS[currentLevel + 1];
    if ((user.money || 0) < req.cost) {
      setHouseUpgradeMsg(he.houseInsufficientFunds);
      return;
    }
    for (const { id, count } of req.friendItems) {
      const have = (user.inventory || []).filter((i) => i.id === id && i.fromFriend).length;
      if (have < count) {
        setHouseUpgradeMsg(`נדרשים ${count} ${ITEM_NAMES[id]} שקיבלת מחברים (יש לך ${have})`);
        return;
      }
    }
    setHouseUpgradeMsg(null);
    setHouseUpgrading(true);
    try {
      const res = await fetch("/api/house/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHouseUpgradeMsg(
          data.error === "Insufficient funds" ? he.houseInsufficientFunds :
          data.error === "Max level reached" ? he.houseMaxLevel :
          data.error?.startsWith("Need friend") ? he.houseFriendItemsRequired :
          he.houseUpgradeError
        );
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
      fireConfetti();
      const { row, col } = showHouseModal;
      const next = grid.map((r) => r.slice());
      next[row][col] = { ...next[row][col], houseLevel: data.houseLevel };
      setGrid(next);
      setShowHouseModal((prev) => prev ? { ...prev, cell: { ...prev.cell, houseLevel: data.houseLevel } } : null);
    } catch (e) { console.error(e); }
    finally { setHouseUpgrading(false); }
  };

  const handleChangeHouseSkin = async (img) => {
    if (!user || houseSkinChanging) return;
    const uid = user.firebaseUid || user.uid;
    setHouseSkinChanging(true);
    try {
      const res = await fetch("/api/house/skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, houseImg: img }),
      });
      if (res.ok) {
        const { row, col } = showHouseModal;
        const next = grid.map((r) => r.slice());
        next[row][col] = { ...next[row][col], houseImg: img };
        setGrid(next);
        setShowHouseModal((prev) => prev ? { ...prev, cell: { ...prev.cell, houseImg: img } } : null);
      }
    } catch (e) { console.error(e); }
    finally { setHouseSkinChanging(false); }
  };

  const handleBuyCC = async () => {
    if (!user || ccBuying) return;
    const ownerUid = user.firebaseUid || user.uid;
    const houseLevel = showHouseModal?.cell?.houseLevel || 1;
    if (houseLevel < 3) { setCCMsg(he.houseNeedLevel3); return; }
    if ((user.money || 0) < 600) { setCCMsg(he.houseInsufficientFundsCC); return; }
    const friendFlags = (user.inventory || []).filter((i) => i.id === "flag" && i.fromFriend);
    if (friendFlags.length < 2) { setCCMsg(he.houseCCNeedFlags); return; }
    setCCMsg(null);
    setCCBuying(true);
    try {
      const res = await fetch("/api/community-center/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCCMsg(
          data.error === "Insufficient funds" ? he.houseInsufficientFundsCC :
          data.error === "House level 3 required" ? he.houseNeedLevel3 :
          data.error === "Already has community center" ? he.houseCCAlreadyHas :
          data.error?.startsWith("Need friend") ? he.houseCCNeedFlagsFromFriends :
          he.houseCCError
        );
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
      fireConfetti();
      const next = grid.map((r) => r.slice());
      next[data.ccRow][data.ccCol] = {
        building: "community-center",
        ownerUid,
        ownerName: user.name,
        ccLevel: 1,
        houseLevel: 1,
        farmLevel: 1,
        item: null,
        pooped: false,
        eggReady: false,
        lastEggEpoch: null,
      };
      setGrid(next);
      setShowHouseModal(null);
    } catch (e) { console.error(e); }
    finally { setCCBuying(false); }
  };

  const handleCCUpgrade = async () => {
    if (!user || !showCCModal || ccUpgrading) return;
    const ownerUid = user.firebaseUid || user.uid;
    const currentLevel = showCCModal.cell.ccLevel || 1;
    if (currentLevel >= 5) return;
    const req = CC_UPGRADE_COSTS[currentLevel + 1];
    if ((user.money || 0) < req.cost) {
      setCCMsg(he.ccInsufficientFunds);
      return;
    }
    for (const { id, count } of req.friendItems) {
      const have = (user.inventory || []).filter((i) => i.id === id && i.fromFriend).length;
      if (have < count) {
        setCCMsg(`נדרשים ${count} ${ITEM_NAMES[id]} שקיבלת מחברים (יש לך ${have})`);
        return;
      }
    }
    setCCMsg(null);
    setCCUpgrading(true);
    try {
      const res = await fetch("/api/community-center/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCCMsg(
          data.error === "Insufficient funds" ? he.ccInsufficientFunds :
          data.error === "Max level reached" ? he.ccMaxLevel :
          he.ccUpgradeError
        );
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
      fireConfetti();
      const { row, col } = showCCModal;
      const next = grid.map((r) => r.slice());
      next[row][col] = { ...next[row][col], ccLevel: data.ccLevel };
      setGrid(next);
      setShowCCModal((prev) => prev ? { ...prev, cell: { ...prev.cell, ccLevel: data.ccLevel } } : null);
    } catch (e) { console.error(e); }
    finally { setCCUpgrading(false); }
  };

  const handleCloseCameraPopup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCameraPopup(false);
  };

  const [showSynagogue, setShowSynagogue] = useState(false);
  const [parasha, setParasha] = useState(null);
  const [parashaLoading, setParashaLoading] = useState(false);

  const handleSynagogueClick = async () => {
    setShowSynagogue(true);
    if (parasha) return;
    setParashaLoading(true);
    try {
      const res = await fetch("/api/parasha");
      const data = await res.json();
      setParasha(data);
    } catch (e) {
      console.error(e);
    } finally {
      setParashaLoading(false);
    }
  };

  const ITEM_NAMES = {
    flower: he.itemFlowers, falafel: he.itemFalafel, flag: he.itemFlags,
    shirt: he.itemShirts, headphones: he.itemHeadphones, pc: he.itemPCs, bike: he.itemBikes,
  };

  const HOUSE_UPGRADE_COSTS = {
    2: { cost: 200,  friendItems: [{ id: "flower", count: 1 }] },
    3: { cost: 400,  friendItems: [{ id: "flag", count: 2 }] },
    4: { cost: 800,  friendItems: [{ id: "falafel", count: 2 }, { id: "shirt", count: 1 }] },
    5: { cost: 1500, friendItems: [{ id: "shirt", count: 2 }, { id: "headphones", count: 1 }] },
  };

  const CC_UPGRADE_COSTS = {
    2: { cost: 1000, friendItems: [{ id: "falafel", count: 3 }] },
    3: { cost: 1500, friendItems: [{ id: "shirt", count: 2 }, { id: "flag", count: 1 }] },
    4: { cost: 2200, friendItems: [{ id: "shirt", count: 2 }, { id: "pc", count: 1 }] },
    5: { cost: 3500, friendItems: [{ id: "headphones", count: 3 }] },
  };

  const HOUSE_EGG_BONUS = [0, 0, 5, 10, 20, 35];
  const CC_ITEM_BONUS = [0, 5, 10, 20, 30, 50];

  const trackWaClick = () => {
    const uid = user?.firebaseUid || user?.uid;
    if (uid) fetch("/api/track/wa-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) });
  };

  const SHOP_ITEMS = [
    { id: "flower",      emoji: "🌸", name: he.shopItemFlower,      price: 10,  sellPrice: 7   },
    { id: "falafel",     emoji: "🧆", name: he.shopItemFalafel,      price: 25,  sellPrice: 17  },
    { id: "flag",        emoji: "🇮🇱", name: he.shopItemFlag,        price: 10,  sellPrice: 7   },
    { id: "bike",        img: "/assets/items/bike.png",        name: he.shopItemBike,        price: 80,  sellPrice: 55  },
    { id: "headphones",  img: "/assets/items/headphones.png",  name: he.shopItemHeadphones,  price: 50,  sellPrice: 35  },
    { id: "pc",          img: "/assets/items/pc.png",          name: he.shopItemPC,          price: 120, sellPrice: 85  },
    { id: "shirt",       img: "/assets/items/shirt.png",       name: he.shopItemShirt,       price: 30,  sellPrice: 20  },
  ];
  const DEFAULT_SELL_PRICE = 5;

  const [showKnesset, setShowKnesset] = useState(false);
  const [sellingItem, setSellingItem] = useState(null); // index being sold

  const [showYadSara, setShowYadSara] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donationDone, setDonationDone] = useState(false);
  const [donationCooldown, setDonationCooldown] = useState(false);

  // Trivia
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState(null);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [triviaCorrect, setTriviaCorrect] = useState(false);
  const [triviaAwarding, setTriviaAwarding] = useState(false);
  const triviaCountRef = useRef(0);

  const openTrivia = () => {
    triviaCountRef.current += 1;
    const isHard = triviaCountRef.current % 5 === 0;
    const pool = TRIVIA_QUESTIONS.filter((q) => q.hard === isHard);
    const q = pool[Math.floor(Math.random() * pool.length)];
    setTriviaQuestion(q);
    setTriviaAnswered(false);
    setTriviaCorrect(false);
    setShowTrivia(true);
  };

  const handleTriviaAnswer = async (optionIndex) => {
    if (triviaAnswered || !triviaQuestion) return;
    const correct = optionIndex === triviaQuestion.answer;
    setTriviaAnswered(true);
    setTriviaCorrect(correct);
    if (correct && user) {
      const uid = user.firebaseUid || user.uid;
      const amount = triviaQuestion.hard ? 20 : 10;
      setTriviaAwarding(true);
      try {
        const res = await fetch("/api/user/money", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, amount }),
        });
        const data = await res.json();
        if (typeof data.money === "number") {
          setUser((prev) => ({ ...prev, money: data.money }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setTriviaAwarding(false);
      }
    }
  };

  // Neighborhoods
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [nbhdClaimedTodayId, setNbhdClaimedTodayId] = useState(null);
  const [nbhdClaiming, setNbhdClaiming] = useState(false);
  const NBHD_DAILY_BONUS = 50;

  const fetchNeighborhoods = () => {
    const uid = user ? (user.firebaseUid || user.uid) : null;
    fetch(`/api/neighborhoods${uid ? `?uid=${uid}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.neighborhoods)) setNeighborhoods(data.neighborhoods);
        setNbhdClaimedTodayId(data.claimedTodayId ?? null);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNeighborhoods();
  }, [user]);

  const handleClaimNeighborhoodBonus = async (neighborhoodId) => {
    if (!user || nbhdClaiming) return;
    const uid = user.firebaseUid || user.uid;
    setNbhdClaiming(true);
    try {
      const res = await fetch("/api/neighborhoods/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, neighborhoodId }),
      });
      const data = await res.json();
      if (data.ok) {
        setUser((prev) => ({ ...prev, money: data.money }));
        setNbhdClaimedTodayId(neighborhoodId);
      }
    } catch (e) { console.error(e); }
    finally { setNbhdClaiming(false); }
  };

  // Poll
  const [pollMessi, setPollMessi] = useState(0);
  const [pollRonaldo, setPollRonaldo] = useState(0);
  const [pollUserVote, setPollUserVote] = useState(null);
  const [pollVoting, setPollVoting] = useState(false);

  useEffect(() => {
    const uid = user ? (user.firebaseUid || user.uid) : null;
    fetch(`/api/poll${uid ? `?uid=${uid}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setPollMessi(data.messi ?? 0);
        setPollRonaldo(data.ronaldo ?? 0);
        setPollUserVote(data.userVote ?? null);
      })
      .catch(console.error);
  }, [user]);

  const handlePollVote = async (vote) => {
    if (!user || pollVoting) return;
    const uid = user.firebaseUid || user.uid;
    setPollVoting(true);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, vote }),
      });
      const data = await res.json();
      setPollMessi(data.messi ?? 0);
      setPollRonaldo(data.ronaldo ?? 0);
      setPollUserVote(data.userVote ?? vote);
    } catch (e) { console.error(e); }
    finally { setPollVoting(false); }
  };

  const handleDonate = async () => {
    if (!user || donating) return;
    const uid = user.firebaseUid || user.uid;
    setDonating(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, name: user.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Already donated this week") {
          setDonationCooldown(true);
          return;
        }
        alert(data.error === "Insufficient funds" ? he.yadSaraInsufficientFunds : he.error);
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money }));
      setDonationDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDonating(false);
    }
  };

  const handleSellItem = async (itemIndex) => {
    if (!user || sellingItem !== null) return;
    const uid = user.firebaseUid || user.uid;
    setSellingItem(itemIndex);
    try {
      const res = await fetch("/api/items/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, itemIndex }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
        fireConfetti();
      } else {
        alert(data.error || he.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSellingItem(null);
    }
  };

  const handleAzrieliClick = () => setShowAzrieliShop(true);

  const handleBuyCandle = async () => {
    if (!user || candleBuying) return;
    const uid = user.firebaseUid || user.uid;
    setCandleBuying(true);
    try {
      const res = await fetch("/api/candle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, name: user.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error === "Insufficient funds" ? he.insufficientFunds : he.error);
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
      fireConfetti();
      setCandleDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setCandleBuying(false);
    }
  };

  const [buyingItem, setBuyingItem] = useState(null);

  const handleBuyItem = async (item) => {
    if (!user || buyingItem) return;
    const uid = user.firebaseUid || user.uid;
    setBuyingItem(item.id);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, itemId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error === "Insufficient funds" ? he.insufficientMoney : he.error);
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
      fireConfetti();
    } finally {
      setBuyingItem(null);
    }
  };

  const [ads, setAds] = useState([]);
  const [adIndex, setAdIndex] = useState(0);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adText, setAdText] = useState("");
  const [adSubmitting, setAdSubmitting] = useState(false);
  const adTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadBoard = async () => {
      try {
        const res = await fetch("/api/board");
        if (!res.ok) {
          throw new Error("Failed to load board");
        }
        const data = await res.json();

        if (!cancelled && Array.isArray(data.cells) && data.cells.length) {
          const g = createEmptyGrid();
          data.cells.forEach((cell) => {
            if (
              cell &&
              typeof cell.row === "number" &&
              typeof cell.col === "number" &&
              cell.row >= 0 &&
              cell.row < ROWS &&
              cell.col >= 0 &&
              cell.col < COLS
            ) {
              g[cell.row][cell.col] = {
                building: cell.building || null,
                ownerUid: cell.ownerUid || null,
                ownerName: cell.ownerName || null,
                item: cell.item || null,
                pooped: cell.pooped || false,
                eggReady: cell.eggReady || false,
                lastEggEpoch: cell.lastEggEpoch ?? null,
                farmLevel: cell.farmLevel ?? 1,
                houseLevel: cell.houseLevel ?? 1,
                houseImg: cell.houseImg || null,
                ccLevel: cell.ccLevel ?? 1,
              };
            }
          });
          setGrid(g);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadBoard();

    const interval = setInterval(loadBoard, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardRefreshKey]);

  const loadAds = () => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.ads)) setAds(data.ads);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    adTimerRef.current = setInterval(() => {
      setAdIndex((i) => (i + 1) % ads.length);
    }, 5000);
    return () => clearInterval(adTimerRef.current);
  }, [ads.length]);

  const persistBoard = async (g) => {
    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = g[row][col];
        if (cell && (cell.building || cell.item)) {
          cells.push({
            row,
            col,
            building: cell.building || null,
            ownerUid: cell.ownerUid || null,
            ownerName: cell.ownerName || null,
            item: cell.item || null,
            ...(cell.building === "farm" ? { farmLevel: cell.farmLevel || 1, eggReady: cell.eggReady || false, lastEggEpoch: cell.lastEggEpoch ?? null } : {}),
          ...(cell.building === "main-house" ? { houseLevel: cell.houseLevel || 1, houseImg: cell.houseImg || null } : {}),
          ...(cell.building === "community-center" ? { ccLevel: cell.ccLevel || 1 } : {}),
          });
        }
      }
    }

    try {
      await fetch("/api/board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: ROWS,
          cols: COLS,
          cells,
        }),
      });
    } catch (e) {
      console.error("Failed to save board", e);
    }
  };

  // Mark house as pooped when thrown from parent
  useEffect(() => {
    if (!justPoopedUid) return;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell && cell.building === "main-house" && cell.ownerUid === justPoopedUid
            ? { ...cell, pooped: true }
            : cell
        )
      )
    );
  }, [justPoopedUid]);

  // Keep house labels in sync when the user's name changes
  useEffect(() => {
    if (!user) return;
    const ownerUid = user.firebaseUid || user.uid;
    if (!ownerUid || !user.name) return;

    let updated = null;
    setGrid((prev) => {
      let changed = false;
      const next = prev.map((row) =>
        row.map((cell) => {
          if (
            cell &&
            cell.building === "main-house" &&
            cell.ownerUid === ownerUid &&
            cell.ownerName !== user.name
          ) {
            changed = true;
            return { ...cell, ownerName: user.name };
          }
          return cell;
        })
      );
      updated = changed ? next : null;
      return changed ? next : prev;
    });

    if (updated) {
      void persistBoard(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user && user.name]);

  const handleClick = (row, col) => {
    if (!user) return;
    const ownerUid = user.firebaseUid || user.uid;
    if (!ownerUid) return;

    const cell = grid[row][col];

    // Own farm - open farm modal (collect + upgrade)
    if (cell && cell.building === "farm" && cell.ownerUid === ownerUid) {
      setShowFarmModal({ row, col, cell });
      return;
    }

    // Collecting an apple or orange
    if (cell && cell.item === "treasure") {
      fetch("/api/treasure/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, name: user.name, row, col }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error === "Treasure already claimed") {
            alert(he.treasureAlreadyClaimed);
            return;
          }
          if (data.ok) {
            const next = grid.map((r) => r.slice());
            next[row][col] = null;
            setGrid(next);
            setUser((prev) => ({ ...prev, money: data.money }));
            fireConfetti();
            const toast = { name: user.name, sponsor: data.sponsor };
            setTreasureWinnerToast(toast);
            setTimeout(() => setTreasureWinnerToast(null), 8000);
          }
        })
        .catch(console.error);
      return;
    }

    if (cell && (cell.item === "apple" || cell.item === "orange")) {
      const amount = 5;
      const next = grid.map((r) => r.slice());
      next[row][col] = null;
      setGrid(next);
      void persistBoard(next);

      fetch("/api/user/money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, amount }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.money === "number") {
            setUser((prev) => ({ ...prev, money: data.money }));
            fireConfetti();
          }
        })
        .catch(console.error);

      return;
    }

    if (cell && cell.item === "shirt") {
      const next = grid.map((r) => r.slice());
      next[row][col] = null;
      setGrid(next);
      void persistBoard(next);

      fetch("/api/items/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, itemId: "shirt" }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.inventory) { setUser((prev) => ({ ...prev, inventory: data.inventory })); fireConfetti(); }
        })
        .catch(console.error);

      return;
    }

    if (cell && cell.item === "poop") {
      const next = grid.map((r) => r.slice());
      next[row][col] = null;
      setGrid(next);
      void persistBoard(next);

      fetch("/api/items/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, itemId: "poop" }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.inventory) { setUser((prev) => ({ ...prev, inventory: data.inventory })); fireConfetti(); }
        })
        .catch(console.error);

      return;
    }

    // Clicking own CC → open CC upgrade modal
    if (cell && cell.building === "community-center" && cell.ownerUid === ownerUid) {
      setShowCCModal({ row, col, cell });
      setCCMsg(null);
      return;
    }

    // Clicking own poophouse → clean it
    if (cell && cell.building === "main-house" && cell.ownerUid === ownerUid && cell.pooped) {
      handleCleanHouse();
      return;
    }

    // Clicking own non-pooped house → open house upgrade modal
    if (cell && cell.building === "main-house" && cell.ownerUid === ownerUid && !cell.pooped) {
      setShowHouseModal({ row, col, cell });
      setHouseUpgradeMsg(null);
      return;
    }

    // Clicking another user's house → open message compose
    if (cell && cell.building === "main-house" && cell.ownerUid !== ownerUid) {
      onOtherHouseClick && onOtherHouseClick({ ownerUid: cell.ownerUid, ownerName: cell.ownerName });
      return;
    }

    // When guiding right after signup, enforce placement only in that mode
    if (needsHousePlacement === true) {
      // ok, we are in placement mode
    } else {
      // Outside explicit placement mode, only allow if user has no main house yet
      const hasHouseAlready = grid.some((r) =>
        r.some(
          (cell) =>
            cell &&
            cell.building === "main-house" &&
            cell.ownerUid === ownerUid
        )
      );
      if (hasHouseAlready) return;
    }

    // Prevent more than one main house per user
    const alreadyHasHouse = grid.some((r) =>
      r.some(
        (cell) =>
          cell &&
          cell.building === "main-house" &&
          cell.ownerUid === ownerUid
      )
    );
    if (alreadyHasHouse) return;

    // Don't overwrite an occupied tile
    if (grid[row][col]) return;

    const next = grid.map((r) => r.slice());
    next[row][col] = {
      building: "main-house",
      ownerUid,
      ownerName: user.name || user.email,
      houseImg: HOUSE_IMAGES[Math.floor(Math.random() * HOUSE_IMAGES.length)],
    };

    setGrid(next);
    void persistBoard(next);
    setMainHouse({ row, col });
  };

  const handleHouseMouseEnter = (e, cell) => {
    const rect = e.currentTarget.getBoundingClientRect();
    tooltipTimer.current = setTimeout(async () => {
      let bio = null;
      try {
        const res = await fetch(`/api/user/profile?uid=${cell.ownerUid}`);
        const data = await res.json();
        bio = data.bio || null;
      } catch (_) {}
      setHouseTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top,
        ownerName: cell.ownerName,
        bio,
      });
    }, 1000);
  };

  const handleHouseMouseLeave = () => {
    clearTimeout(tooltipTimer.current);
    setHouseTooltip(null);
  };


  const handleCleanHouse = async () => {
    if (!user) return;
    const uid = user.firebaseUid || user.uid;
    try {
      const res = await fetch("/api/poop/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (res.ok) {
        setGrid((prev) => prev.map((row) =>
          row.map((cell) =>
            cell && cell.building === "main-house" && cell.ownerUid === uid && cell.pooped
              ? { ...cell, pooped: false }
              : cell
          )
        ));
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmitAd = async () => {
    if (!adText.trim() || !user) return;
    const ownerUid = user.firebaseUid || user.uid;
    setAdSubmitting(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, text: adText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error === "Insufficient funds" ? he.insufficientMoney : he.error);
        return;
      }
      if (typeof data.money === "number") {
        setUser((prev) => ({ ...prev, money: data.money }));
      }
      loadAds();
      setAdText("");
      setShowAdPopup(false);
    } catch (err) {
      console.error(err);
      alert(he.error);
    } finally {
      setAdSubmitting(false);
    }
  };

  return (
    <>
      {onlineCount !== null && (
        <div className={styles.onlineLabel}>
          <span className={styles.onlineDot} />
          {he.onlineNow} <strong>{onlineCount}</strong>
        </div>
      )}

      {houseTooltip && (
        <div
          className={styles.houseTooltip}
          style={{ left: houseTooltip.x, top: houseTooltip.y }}
        >
          <span className={styles.houseTooltipName}>{houseTooltip.ownerName}</span>
          {houseTooltip.bio && <span className={styles.houseTooltipBio}>{houseTooltip.bio}</span>}
        </div>
      )}
      <div className={styles.board} ref={boardRef}>
        {(() => {
          const ownerUid = user && (user.firebaseUid || user.uid);
          let userHousePos = null;
          if (ownerUid) {
            outer: for (let r = 0; r < ROWS; r++) {
              for (let c = 0; c < COLS; c++) {
                if (grid[r][c]?.building === "main-house" && grid[r][c]?.ownerUid === ownerUid) {
                  userHousePos = { row: r, col: c };
                  break outer;
                }
              }
            }
          }
          return (
            <>
              {userHousePos && (
                <div
                  className={styles.myHouseArrow}
                  style={{
                    right: userHousePos.col * TILE_SIZE + TILE_SIZE / 2,
                    top: userHousePos.row * TILE_SIZE - 36,
                  }}
                >
                  ▼
                </div>
              )}
              {Array.from({ length: ROWS }).map((_, row) =>
                Array.from({ length: COLS }).map((_, col) => {
                  const key = `${row}-${col}`;
                  const cell = grid[row][col];
            const hasMainHouse = cell && cell.building === "main-house";
            const hasFarm = cell && cell.building === "farm";
            const hasEgg = hasFarm && cell.eggReady && cell.ownerUid === ownerUid;
            const hasApple = cell && cell.item === "apple";
            const hasOrange = cell && cell.item === "orange";
            const hasShirt = cell && cell.item === "shirt";
            const hasPoop = cell && cell.item === "poop";
            const hasTreasure = cell && cell.item === "treasure";
            const isPoopHouse = hasMainHouse && cell.pooped;
            const isStarHouse = hasMainHouse && !isPoopHouse && starHouseUid && cell.ownerUid === starHouseUid;
            const isEmpty = !cell;
            const userHasHouse =
              !!ownerUid &&
              grid.some((r) =>
                r.some(
                  (c) =>
                    c &&
                    c.building === "main-house" &&
                    c.ownerUid === ownerUid
                )
              );
            const canPreview =
              !!user &&
              !!ownerUid &&
              needsHousePlacement === true &&
              !userHasHouse &&
              isEmpty;

            const hasCC = !!(cell && cell.building === "community-center");
            const isClickable =
              hasApple ||
              hasOrange ||
              hasShirt ||
              hasPoop ||
              hasTreasure ||
              hasEgg ||
              (hasFarm && cell.ownerUid === ownerUid) ||
              (hasMainHouse && cell.ownerUid !== ownerUid) ||
              (hasMainHouse && cell.ownerUid === ownerUid && isPoopHouse) ||
              (hasMainHouse && cell.ownerUid === ownerUid && !isPoopHouse) ||
              (hasCC && cell.ownerUid === ownerUid) ||
              canPreview;

            return (
              <div
                key={key}
                className={`${styles.tile}${!isClickable ? ` ${styles.tileDefault}` : ""}`}
                onClick={() => handleClick(row, col)}
                onMouseEnter={(e) => {
                  setHover({ row, col });
                  if (hasMainHouse) handleHouseMouseEnter(e, cell);
                }}
                onMouseLeave={() => {
                  setHover((prev) =>
                    prev && prev.row === row && prev.col === col ? null : prev
                  );
                  if (hasMainHouse) handleHouseMouseLeave();
                }}
              >
                {hasApple && (
                  <span className={styles.apple}>🍎</span>
                )}
                {hasOrange && (
                  <span className={styles.apple}>🍊</span>
                )}
                {hasShirt && (
                  <img src="/assets/items/shirt.png" alt={he.shirtAlt} className={styles.tileItemImg} />
                )}
                {hasPoop && (
                  <span className={styles.apple}>💩</span>
                )}
                {hasTreasure && (
                  <span className={styles.treasure}>💎</span>
                )}
                {hasMainHouse && (
                  <div className={styles.houseWrapper}>
                    <img
                      src={isPoopHouse ? "/assets/poophouse.png" : (cell.houseImg || HOUSE_IMAGES[0])}
                      alt={isPoopHouse ? he.dirtyHouseAlt : he.mainHouseAlt}
                      className={styles.mainHouse}
                      style={(cell.houseLevel || 1) >= 5 && !isPoopHouse ? { filter: "sepia(1) saturate(4) hue-rotate(10deg)" } : undefined}
                    />
                    {(cell.ownerUid === ownerUid ? (user?.name || cell.ownerName) : cell.ownerName) && (
                      <span className={styles.houseLabel}>
                        {cell.ownerUid === ownerUid ? (user?.name || cell.ownerName) : cell.ownerName}
                      </span>
                    )}
                    {isPoopHouse && cell.ownerUid === ownerUid && (
                      <span className={styles.cleanHouseHint}>{he.cleanHouseHint}</span>
                    )}
                    {isStarHouse && <span className={styles.starBadge}>⭐</span>}
                    {cell.ownerUid === ownerUid && (cell.houseLevel || 1) > 1 && (
                      <span className={styles.houseLevelBadge}>L{cell.houseLevel}</span>
                    )}
                  </div>
                )}
                {hasCC && (
                  <div className={styles.ccWrapper}>
                    <img src="/assets/community-center.png" alt={he.communityCenter} className={styles.mainHouse} />
                    {cell.ownerUid === ownerUid && (cell.ccLevel || 1) > 1 && (
                      <span className={styles.farmLevelBadge}>L{cell.ccLevel}</span>
                    )}
                  </div>
                )}
                {hasFarm && (
                  <div className={styles.farmWrapper}>
                    <img src="/assets/farm.png" alt={he.farmAlt} className={styles.mainHouse} />
                    {hasEgg && <span className={styles.eggBadge}>🥚</span>}
                    {cell.ownerUid === ownerUid && (cell.farmLevel || 1) > 1 && (
                      <span className={styles.farmLevelBadge}>L{cell.farmLevel}</span>
                    )}
                  </div>
                )}
                {!hasMainHouse &&
                  canPreview &&
                  hover &&
                  hover.row === row &&
                  hover.col === col && (
                    <div className={styles.houseWrapper}>
                      <img
                        src={HOUSE_IMAGES[0]}
                        alt={he.mainHousePlacementAlt}
                        className={styles.mainHouse}
                      />
                    </div>
                  )}
              </div>
                  );
                })
              )}
            </>
          );
        })()}

        {/* Azrieli Building */}
        <div
          className={styles.azrieliBoard}
          style={{
            top: AZRIELI_ROW * TILE_SIZE,
            left: AZRIELI_COL * TILE_SIZE,
            width: AZRIELI_W * TILE_SIZE,
            height: AZRIELI_H * TILE_SIZE,
          }}
          onClick={handleAzrieliClick}
        >
          <img src="/assets/azrieli.png" alt={he.azrieliAlt} className={styles.azrieliBuilding} />
        </div>

        {/* Synagogue */}
        <div
          className={styles.azrieliBoard}
          style={{
            top: SYNAGOGUE_ROW * TILE_SIZE,
            left: SYNAGOGUE_COL * TILE_SIZE,
            width: SYNAGOGUE_W * TILE_SIZE,
            height: SYNAGOGUE_H * TILE_SIZE,
          }}
          onClick={handleSynagogueClick}
        >
          <img src="/assets/synagogue.png" alt={he.synagogueAlt} className={styles.azrieliBuilding} />
        </div>

        {/* Knesset */}
        <div
          className={styles.azrieliBoard}
          style={{
            top: KNESSET_ROW * TILE_SIZE,
            left: KNESSET_COL * TILE_SIZE,
            width: KNESSET_W * TILE_SIZE,
            height: KNESSET_H * TILE_SIZE,
          }}
          onClick={() => setShowKnesset(true)}
        >
          <img src="/assets/knesset.png" alt={he.knessetAlt} className={styles.azrieliBuilding} />
        </div>

        {/* Leaderboard Building */}
        <div
          className={styles.leaderboardBuilding}
          style={{
            top: LEADERBOARD_ROW * TILE_SIZE,
            left: LEADERBOARD_COL * TILE_SIZE,
            width: LEADERBOARD_W * TILE_SIZE,
            height: LEADERBOARD_H * TILE_SIZE,
          }}
          onClick={handleLeaderboardClick}
        >
          <span className={styles.leaderboardBuildingIcon}>🏆</span>
          <span className={styles.leaderboardBuildingLabel}>{he.leaderboardBuildingLabel}</span>
        </div>

        {/* Yad Sara Building */}
        {yadSaraVisible && (
          <div
            className={styles.yadSaraBuilding}
            style={{
              top: YAD_SARA_ROW * TILE_SIZE,
              left: YAD_SARA_COL * TILE_SIZE,
              width: YAD_SARA_W * TILE_SIZE,
              height: YAD_SARA_H * TILE_SIZE,
            }}
            onClick={() => { setShowYadSara(true); setDonationDone(false); setDonationCooldown(false); }}
          >
            <img src="/assets/yad-sara.jpg" alt={he.yadSaraAlt} className={styles.yadSaraImg} />
          </div>
        )}

        {/* Trivia Building */}
        <div
          className={styles.triviaBuilding}
          style={{
            top: TRIVIA_ROW * TILE_SIZE,
            left: TRIVIA_COL * TILE_SIZE,
            width: TRIVIA_W * TILE_SIZE,
            height: TRIVIA_H * TILE_SIZE,
          }}
          onClick={openTrivia}
        >
          <span className={styles.triviaBuildingIcon}>🧠</span>
          <span className={styles.triviaBuildingLabel}>{he.triviaBuildingLabel}</span>
        </div>

        {/* Camera Widget */}
        <div
          className={styles.cameraWidget}
          style={{
            top: CAMERA_ROW * TILE_SIZE,
            left: CAMERA_COL * TILE_SIZE,
            width: CAMERA_W * TILE_SIZE,
            height: CAMERA_H * TILE_SIZE,
          }}
          onClick={() => setShowCameraPopup(true)}
        >
          {cameraPhoto && (
            <img src={cameraPhoto} alt={he.cameraPhotoAlt} className={styles.cameraPhoto} />
          )}
          <div className={`${styles.cameraPlaceholder} ${cameraPhoto ? styles.cameraPlaceholderOverlay : ""}`}>
            <span className={styles.cameraIcon}>📷</span>
            {!cameraPhoto && <span className={styles.cameraLabel}>{he.cameraTakePhoto}</span>}
          </div>
        </div>
        <div
          className={styles.cameraCaption}
          style={{
            top: (CAMERA_ROW + CAMERA_H) * TILE_SIZE + 4,
            left: CAMERA_COL * TILE_SIZE,
            width: CAMERA_W * TILE_SIZE,
          }}
        >
          {he.cameraLabel}
        </div>

        {/* Cashout Building */}
        <div
          className={styles.cashoutBuilding}
          style={{
            top: CASHOUT_ROW * TILE_SIZE,
            left: CASHOUT_COL * TILE_SIZE,
            width: CASHOUT_W * TILE_SIZE,
            height: CASHOUT_H * TILE_SIZE,
          }}
          onClick={() => { setShowCashout(true); setCashoutDone(false); setCashoutError(""); }}
        >
          <span className={styles.cashoutBuildingIcon}>💵</span>
          <span className={styles.cashoutBuildingLabel}>{he.cashoutBuildingLabel}</span>
        </div>

        {/* Godzilla */}
        <div
          style={{
            position: "absolute",
            top: GODZILLA_ROW * TILE_SIZE,
            left: GODZILLA_COL * TILE_SIZE,
            width: GODZILLA_W * TILE_SIZE,
            height: GODZILLA_H * TILE_SIZE,
            cursor: "pointer",
            zIndex: 10,
            filter: "drop-shadow(0 0 18px rgba(0,255,80,0.7))",
            animation: "godzillaPulse 2.5s ease-in-out infinite",
          }}
          onClick={() => setShowGodzilla(true)}
        >
          <img src="/assets/godzilla.png" alt={he.godzillaAlt} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>

        {/* Power Plant Building */}
        <div
          className={styles.azrieliBoard}
          style={{
            top: POWERPLANT_ROW * TILE_SIZE,
            left: POWERPLANT_COL * TILE_SIZE,
            width: POWERPLANT_W * TILE_SIZE,
            height: POWERPLANT_H * TILE_SIZE,
            cursor: "pointer",
          }}
          onClick={handlePowerPlantClick}
        >
          <img src="/assets/electric.png" alt={he.powerPlantAlt} className={styles.azrieliBuilding} />
        </div>

        {/* Candle Building */}
        <div
          className={styles.azrieliBoard}
          style={{
            top: CANDLE_ROW * TILE_SIZE,
            left: CANDLE_COL * TILE_SIZE,
            width: CANDLE_W * TILE_SIZE,
            height: CANDLE_H * TILE_SIZE,
            cursor: "pointer",
            filter: "drop-shadow(10px -6px 10px rgba(0,0,0,0.6))",
          }}
          onClick={() => { setShowCandleShop(true); setCandleDone(false); }}
        >
          <img src="/assets/candle-building.png" alt={he.candleBuildingAlt} className={styles.azrieliBuilding} />
        </div>

        {/* Poll Widget */}
        {(() => {
          const total = pollMessi + pollRonaldo;
          const messiPct = total ? Math.round((pollMessi / total) * 100) : 50;
          const ronaldoPct = total ? 100 - messiPct : 50;
          return (
            <div
              className={styles.pollWidget}
              style={{
                top: POLL_ROW * TILE_SIZE,
                left: POLL_COL * TILE_SIZE,
                width: POLL_W * TILE_SIZE,
                height: POLL_H * TILE_SIZE,
              }}
            >
              <div className={styles.pollWidgetPlayers}>
                <div
                  className={`${styles.pollWidgetPlayer} ${pollUserVote === "messi" ? styles.pollWidgetVoted : ""}`}
                  onClick={() => handlePollVote("messi")}
                  title={he.pollVoteMessi}
                >
                  <img src="/assets/messi.png" alt={he.pollMessiAlt} className={styles.pollWidgetImg} />
                  {pollUserVote === "messi" && <span className={styles.pollWidgetCheck}>✓</span>}
                </div>
                <span className={styles.pollWidgetVs}>VS</span>
                <div
                  className={`${styles.pollWidgetPlayer} ${pollUserVote === "ronaldo" ? styles.pollWidgetVoted : ""}`}
                  onClick={() => handlePollVote("ronaldo")}
                  title={he.pollVoteRonaldo}
                >
                  <img src="/assets/ronaldo.png" alt={he.pollRonaldoAlt} className={styles.pollWidgetImg} />
                  {pollUserVote === "ronaldo" && <span className={styles.pollWidgetCheck}>✓</span>}
                </div>
              </div>
              <div className={styles.pollBar}>
                <span className={styles.pollBarMessi} style={{ width: `${messiPct}%` }} />
              </div>
              <div className={styles.pollNames}>
                <span className={styles.pollNameMessi}>{messiPct}%</span>
                <span className={styles.pollNameRonaldo}>{ronaldoPct}%</span>
              </div>
            </div>
          );
        })()}

        {/* Neighborhood Labels */}
        {neighborhoods.map((nbhd) => {
          const ownerUid = user && (user.firebaseUid || user.uid);
          const isMyNbhd = ownerUid && nbhd.members.includes(ownerUid);
          const claimedToday = nbhdClaimedTodayId === nbhd.id;
          return (
            <div
              key={nbhd.id}
              className={`${styles.neighborhoodLabel} ${isMyNbhd ? styles.neighborhoodLabelMine : ""}`}
              style={{
                top: nbhd.centerRow * TILE_SIZE - 28,
                left: nbhd.centerCol * TILE_SIZE - 60,
              }}
            >
              <span className={styles.neighborhoodName}>{nbhd.name}</span>
              <span className={styles.neighborhoodCount}>{he.neighborhoodCount(nbhd.memberCount)}</span>
              {isMyNbhd && !claimedToday && (
                <button
                  className={styles.neighborhoodClaimBtn}
                  onClick={() => handleClaimNeighborhoodBonus(nbhd.id)}
                  disabled={nbhdClaiming}
                >
                  {nbhdClaiming ? "..." : `+${NBHD_DAILY_BONUS} 🎁`}
                </button>
              )}
              {isMyNbhd && claimedToday && (
                <span className={styles.neighborhoodClaimed}>{he.neighborhoodCollected}</span>
              )}
            </div>
          );
        })}

        {/* Eilat Building */}
        <div
          className={styles.azrieliBoard}
          style={{
            top: EILAT_ROW * TILE_SIZE,
            left: EILAT_COL * TILE_SIZE,
            width: EILAT_W * TILE_SIZE,
            height: EILAT_H * TILE_SIZE,
          }}
        >
          <img src="/assets/eilat.png" alt={he.eilatAlt} className={styles.azrieliBuilding} />
        </div>

        {/* Advertisement Board */}
        <div
          className={styles.adBoard}
          style={{
            top: AD_ROW * TILE_SIZE,
            left: AD_COL * TILE_SIZE,
            width: AD_W * TILE_SIZE,
            height: AD_H * TILE_SIZE,
          }}
        >
          {user && (
            <button
              className={styles.adAddBtn}
              onClick={() => setShowAdPopup(true)}
              title={he.adBoardAddTitle}
            >
              +
            </button>
          )}
          <div className={styles.adContent}>
            {ads.length > 0 ? (
              <span className={styles.adText}>{renderWithLinks(ads[adIndex]?.text ?? "")}</span>
            ) : (
              <span className={styles.adEmptyText}>{he.adBoardEmpty}</span>
            )}
          </div>
        </div>
      </div>

      {/* Ad Submission Popup */}
      {showAdPopup && (
        <div className={styles.adPopupBackdrop}>
          <div className={styles.adPopupModal}>
            <p className={styles.adPopupTitle}>{he.adBoardAddPopupTitle}</p>
            <textarea
              className={styles.adPopupTextarea}
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              placeholder={he.adBoardPlaceholder}
              rows={3}
              maxLength={120}
            />
            <p className={styles.adPopupInfo}>{he.adBoardInfo1}</p>
            <p className={styles.adPopupInfo}>{he.adBoardInfo2}</p>
            <div className={styles.adPopupActions}>
              <button
                className={styles.adPopupSubmit}
                onClick={handleSubmitAd}
                disabled={adSubmitting || !adText.trim()}
              >
                {adSubmitting ? he.adBoardSubmitting : he.adBoardSubmit}
              </button>
              <button
                className={styles.adPopupCancel}
                onClick={() => { setShowAdPopup(false); setAdText(""); }}
              >
                {he.adBoardCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Azrieli Shop */}
      {showAzrieliShop && (
        <div className={styles.shopBackdrop} onClick={() => setShowAzrieliShop(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.azrieliShopTitle}</p>
            <p className={styles.shopBalance}>{he.azrieliShopBalance(user?.money ?? 0)}</p>
            <div className={styles.shopItems}>
              {SHOP_ITEMS.map((item) => (
                <div key={item.id} className={styles.shopItem}>
                  {item.img
                    ? <img src={item.img} alt={item.name} className={styles.shopItemImg} />
                    : <span className={styles.shopEmoji}>{item.emoji}</span>
                  }
                  <span className={styles.shopItemName}>{item.name}</span>
                  <button
                    className={styles.shopBuyBtn}
                    onClick={() => handleBuyItem(item)}
                    disabled={!user || (user.money ?? 0) < item.price || !!buyingItem}
                  >
                    {buyingItem === item.id ? <span className={styles.shopSpinner} /> : `${item.price} 🪙`}
                  </button>
                </div>
              ))}
            </div>
            <button className={styles.shopCloseBtn} onClick={() => setShowAzrieliShop(false)}>{he.azrieliShopClose}</button>
          </div>
        </div>
      )}

      {/* Candle Shop */}
      {showCandleShop && (
        <div className={styles.shopBackdrop} onClick={() => setShowCandleShop(false)}>
          <div className={styles.candleModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.candleTitle}>{he.candleShopTitle}</p>
            <p className={styles.candleSubtitle}>{he.candleShopSubtitle}</p>
            {candleDone ? (
              <>
                <p className={styles.candleThanks}>{he.candleShopThanks}</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowCandleShop(false)}>{he.candleShopClose}</button>
              </>
            ) : (
              <>
                <img src="/assets/candle-building.png" alt={he.candleAlt} className={styles.candleImg} />
                <p className={styles.candleDesc}>{he.candleDesc}</p>
                <p className={styles.candleBalance}>{he.candleBalance(user?.money ?? 0)}</p>
                <div className={styles.candleActions}>
                  <button
                    className={styles.candleBuyBtn}
                    onClick={handleBuyCandle}
                    disabled={candleBuying || !user || (user?.money ?? 0) < 40}
                  >
                    {candleBuying ? he.candleBuying : he.candleBuy}
                  </button>
                  <button className={styles.shopCloseBtn} onClick={() => setShowCandleShop(false)}>{he.candleShopClose}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Camera Popup */}
      {showCameraPopup && (
        <div className={styles.cameraBackdrop} onClick={handleCloseCameraPopup}>
          <div className={styles.cameraModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.cameraTitle}>{he.cameraCaptureTitle}</p>
            <div className={styles.cameraBody}>
              <div className={styles.cameraActions}>
                <button className={styles.cameraSnapBtn} onClick={handleCapture}>{he.cameraCaptureBtn}</button>
                <button className={styles.cameraCancelBtn} onClick={handleCloseCameraPopup}>{he.cameraCancelBtn}</button>
              </div>
              <video ref={videoRef} autoPlay playsInline className={styles.cameraVideo} />
            </div>
          </div>
        </div>
      )}

      {/* Treasure Winner Toast */}
      {treasureWinnerToast && (
        <div className={styles.treasureToast}>
          <span className={styles.treasureToastGem}>💎</span>
          <div className={styles.treasureToastText}>
            <span className={styles.treasureToastName}>{he.treasureFound(treasureWinnerToast.name)}</span>
            {treasureWinnerToast.sponsor && (
              <span className={styles.treasureToastSponsor}>{he.treasureSponsor(treasureWinnerToast.sponsor)}</span>
            )}
          </div>
          <button className={styles.treasureToastClose} onClick={() => { dismissedTreasureRef.current = treasureWinnerToast.claimedAt; setTreasureWinnerToast(null); }}>✕</button>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className={styles.shopBackdrop} onClick={() => setShowLeaderboard(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.leaderboardTitle}</p>
            {leaderboardLoading ? (
              <p className={styles.shopBalance}>{he.leaderboardLoading}</p>
            ) : (
              <div className={styles.leaderboardList}>
                {leaderboard.map((u, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMe = user && (user.firebaseUid || user.uid) === u.uid;
                  return (
                    <div key={u.uid || i} className={`${styles.leaderboardRow} ${isMe ? styles.leaderboardRowMe : ""}`}>
                      <span className={styles.leaderboardRank}>{medals[i] || `#${i + 1}`}</span>
                      <span className={styles.leaderboardName}>{u.name || he.leaderboardAnonymous}</span>
                      <span className={styles.leaderboardMoney}>{u.money ?? 0} ₪</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowLeaderboard(false)}>{he.leaderboardClose}</button>
          </div>
        </div>
      )}

      {/* Knesset - Sell Items */}
      {showKnesset && (
        <div className={styles.shopBackdrop} onClick={() => setShowKnesset(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.knessetTitle}</p>
            <p className={styles.shopBalance}>{he.knessetBalance(user?.money ?? 0)}</p>
            {!user ? (
              <p className={styles.knessetEmpty}>{he.knessetNotLoggedIn}</p>
            ) : !user.inventory?.length ? (
              <p className={styles.knessetEmpty}>{he.knessetNoItems}</p>
            ) : (
              <div className={styles.shopItems}>
                {user.inventory.map((item, i) => {
                  const shopItem = SHOP_ITEMS.find((s) => s.id === item.id);
                  const price = shopItem?.sellPrice ?? DEFAULT_SELL_PRICE;
                  return (
                    <div key={i} className={styles.shopItem}>
                      {shopItem?.img
                        ? <img src={shopItem.img} alt={item.name} className={styles.shopItemImg} />
                        : <span className={styles.shopEmoji}>{item.emoji}</span>
                      }
                      <span className={styles.shopItemName}>{item.name}</span>
                      <span className={styles.knessetSellPrice}>+{price} ₪</span>
                      <button
                        className={styles.knessetSellBtn}
                        onClick={() => handleSellItem(i)}
                        disabled={sellingItem !== null}
                      >
                        {sellingItem === i ? <span className={styles.shopSpinner} /> : he.knessetSell}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowKnesset(false)}>{he.knessetClose}</button>
          </div>
        </div>
      )}

      {/* Yad Sara Donation Popup */}
      {showYadSara && (
        <div className={styles.shopBackdrop} onClick={() => setShowYadSara(false)}>
          <div className={styles.yadSaraModal} onClick={(e) => e.stopPropagation()}>
            <img src="/assets/yad-sara.jpg" alt={he.yadSaraAlt} className={styles.yadSaraModalImg} />
            <p className={styles.yadSaraTitle}>{he.yadSaraTitle}</p>
            {donationDone ? (
              <>
                <p className={styles.yadSaraThanks}>{he.yadSaraThanks}</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowYadSara(false)}>{he.yadSaraClose}</button>
              </>
            ) : donationCooldown ? (
              <>
                <p className={styles.yadSaraMsg}>{he.yadSaraCooldown}</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowYadSara(false)}>{he.yadSaraClose}</button>
              </>
            ) : (
              <>
                <p className={styles.yadSaraMsg}>{he.yadSaraMsg}</p>
                <p className={styles.yadSaraBalance}>{he.yadSaraBalance(user?.money ?? 0)}</p>
                <div className={styles.yadSaraActions}>
                  <button
                    className={styles.yadSaraDonateBtn}
                    onClick={handleDonate}
                    disabled={donating || !user || (user?.money ?? 0) < 100}
                  >
                    {donating ? he.yadSaraDonating : he.yadSaraDonate}
                  </button>
                  <button className={styles.shopCloseBtn} onClick={() => setShowYadSara(false)}>{he.yadSaraClose}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cashout Modal */}
      {showCashout && (
        <div className={styles.shopBackdrop} onClick={() => setShowCashout(false)}>
          <div className={styles.cashoutModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.cashoutTitle}>{he.cashoutTitle}</p>
            {cashoutDone ? (
              <>
                <p className={styles.cashoutSuccess}>{he.cashoutSuccess}</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowCashout(false)}>{he.cashoutClose}</button>
              </>
            ) : (
              <>
                <div className={styles.cashoutInfo}>
                  <p>{he.cashoutInfoBit}</p>
                  <p>{he.cashoutInfoRate}</p>
                  <p>{he.cashoutInfoMin}</p>
                </div>
                <p className={styles.cashoutBalance}>{he.cashoutBalanceLabel} <strong>{user?.money ?? 0}</strong> {he.coins}</p>
                <div className={styles.cashoutFields}>
                  <div className={styles.cashoutField}>
                    <label>{he.cashoutPhoneLabel}</label>
                    <input
                      type="tel"
                      value={cashoutPhone}
                      onChange={(e) => setCashoutPhone(e.target.value)}
                      placeholder="050-0000000"
                      className={styles.cashoutInput}
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.cashoutField}>
                    <label>{he.cashoutAmountLabel}</label>
                    <input
                      type="number"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      placeholder={he.cashoutAmountPlaceholder}
                      className={styles.cashoutInput}
                      min={1000}
                    />
                  </div>
                </div>
                {cashoutAmount >= 1000 && (
                  <p className={styles.cashoutCalc}>{he.cashoutCalc(cashoutAmount)}</p>
                )}
                {cashoutError && <p className={styles.cashoutError}>{cashoutError}</p>}
                <div className={styles.cashoutActions}>
                  <button
                    className={styles.cashoutSubmitBtn}
                    onClick={handleCashout}
                    disabled={cashoutSending || !user}
                  >
                    {cashoutSending ? he.cashoutSending : he.cashoutSubmit}
                  </button>
                  <button className={styles.shopCloseBtn} onClick={() => setShowCashout(false)}>{he.cashoutClose}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* Trivia Modal */}
      {showTrivia && triviaQuestion && (
        <div className={styles.shopBackdrop} onClick={() => setShowTrivia(false)}>
          <div className={styles.triviaModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.triviaTitle}>{he.triviaTitle}</p>
            <p className={styles.triviaLevel}>{triviaQuestion.hard ? he.triviaLevelHard : he.triviaLevelEasy}</p>
            <p className={styles.triviaQuestion}>{triviaQuestion.q}</p>
            <div className={styles.triviaOptions}>
              {triviaQuestion.options.map((opt, i) => {
                let cls = styles.triviaOption;
                if (triviaAnswered) {
                  if (i === triviaQuestion.answer) cls = `${styles.triviaOption} ${styles.triviaOptionCorrect}`;
                  else if (i !== triviaQuestion.answer) cls = `${styles.triviaOption} ${styles.triviaOptionWrong}`;
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => handleTriviaAnswer(i)}
                    disabled={triviaAnswered}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {triviaAnswered && (
              <div className={styles.triviaResult}>
                {triviaCorrect ? (
                  <p className={styles.triviaResultCorrect}>
                    {he.triviaCorrect(triviaQuestion.hard ? 20 : 10, triviaAwarding)}
                  </p>
                ) : (
                  <p className={styles.triviaResultWrong}>{he.triviaWrong(triviaQuestion.options[triviaQuestion.answer])}</p>
                )}
                <button className={styles.triviaNextBtn} onClick={openTrivia}>{he.triviaNextQuestion}</button>
              </div>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowTrivia(false)}>{he.triviaClose}</button>
          </div>
        </div>
      )}

      {/* Synagogue Parasha Popup */}
      {showSynagogue && (
        <div className={styles.shopBackdrop} onClick={() => setShowSynagogue(false)}>
          <div className={styles.parashaModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.parashaTitle}>{he.synagogueTitle}</p>
            {parashaLoading && <p className={styles.parashaLoading}>{he.synagogueLoading}</p>}
            {!parashaLoading && parasha && (
              <>
                <p className={styles.parashaName}>{parasha.name}</p>
                <p className={styles.parashaNameEn}>{parasha.nameEn}</p>
                {parasha.verses?.length > 0 && (
                  <div className={styles.parashaText}>
                    {parasha.verses.map((verse, i) => (
                      <span key={i}>
                        <span className={styles.parashaVerseNum}>{i + 1}. </span>
                        <span dangerouslySetInnerHTML={{ __html: verse }} />
                        {" "}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            {!parashaLoading && !parasha && (
              <p className={styles.parashaLoading}>{he.synagogueNotFound}</p>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowSynagogue(false)}>{he.synagogueClose}</button>
          </div>
        </div>
      )}

      {/* Farm Modal */}
      {showFarmModal && (
        <div className={styles.shopBackdrop} onClick={() => { setShowFarmModal(null); setFarmUpgradeMsg(null); }}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.farmTitle}</p>
            <p className={styles.shopBalance}>{he.farmBalance(user?.money ?? 0)}</p>
            <p style={{ margin: 0, fontSize: 14 }}>
              {he.farmLevel(showFarmModal.cell.farmLevel || 1, (showFarmModal.cell.farmLevel || 1) === 1 ? "20" : (showFarmModal.cell.farmLevel || 1) === 2 ? "40" : "80")}
            </p>
            {showFarmModal.cell.eggReady ? (
              <button className={styles.shopBuyBtn} onClick={handleFarmModalCollect} disabled={farmCollecting}>
                {farmCollecting ? he.farmCollecting : he.farmCollect}
              </button>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{he.farmNextEgg}</p>
            )}
            {(showFarmModal.cell.farmLevel || 1) < 3 ? (
              <>
                {farmUpgradeMsg && (
                  <p style={{ margin: "4px 0", fontSize: 12, color: "#c0392b", direction: "rtl" }}>
                    {farmUpgradeMsg}
                    {farmUpgradeMsg.includes("חברים") && (
                      <>
                        {" "}
                        <a
                          href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={trackWaClick}
                          style={{ color: "#25D366", textDecoration: "underline", cursor: "pointer" }}
                        >
                          {he.inviteFriends}
                        </a>
                      </>
                    )}
                  </p>
                )}
                <button
                  className={styles.shopBuyBtn}
                  onClick={handleFarmUpgrade}
                  disabled={farmUpgrading}
                >
                  {farmUpgrading
                    ? he.upgrading
                    : he.farmUpgrade((showFarmModal.cell.farmLevel || 1) + 1, (showFarmModal.cell.farmLevel || 1) === 1 ? "600" : "1,200")}
                </button>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#4a7c3f", fontWeight: 600 }}>{he.farmMaxLevel}</p>
            )}
            <button className={styles.shopCloseBtn} onClick={() => { setShowFarmModal(null); setFarmUpgradeMsg(null); }}>{he.farmClose}</button>
          </div>
        </div>
      )}

      {/* House Upgrade Modal */}
      {showHouseModal && (
        <div className={styles.shopBackdrop} onClick={() => { setShowHouseModal(null); setHouseUpgradeMsg(null); setCCMsg(null); }}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.houseTitle}</p>
            <p className={styles.shopBalance}>{he.houseBalance(user?.money ?? 0)}</p>
            <div style={{ margin: "8px 0" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#888" }}>{he.houseSkinLabel}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {HOUSE_IMAGES.map((img) => (
                  <button
                    key={img}
                    onClick={() => handleChangeHouseSkin(img)}
                    disabled={houseSkinChanging}
                    style={{
                      border: (showHouseModal.cell.houseImg || HOUSE_IMAGES[0]) === img ? "2px solid #4a90d9" : "2px solid #3a3a55",
                      background: "transparent",
                      borderRadius: 6,
                      padding: 4,
                      cursor: houseSkinChanging ? "not-allowed" : "pointer",
                      opacity: houseSkinChanging ? 0.6 : 1,
                    }}
                  >
                    <img src={img} alt="house" style={{ width: 40, height: 40, objectFit: "contain", display: "block" }} />
                  </button>
                ))}
              </div>
            </div>
            <p style={{ margin: "4px 0", fontSize: 14 }}>
              {he.houseLevelOf5(showHouseModal.cell.houseLevel || 1)}
              {" · "}{he.houseBonus(HOUSE_EGG_BONUS[showHouseModal.cell.houseLevel || 1])}
            </p>
            {(showHouseModal.cell.houseLevel || 1) < 5 && (() => {
              const req = HOUSE_UPGRADE_COSTS[(showHouseModal.cell.houseLevel || 1) + 1];
              return (
                <p style={{ margin: "2px 0", fontSize: 11, color: "#888", direction: "rtl" }}>
                  {he.houseRequirementsLine((showHouseModal.cell.houseLevel || 1) + 1, req.cost)}
                  {req.friendItems.map(({ id, count }) => `${count} ${ITEM_NAMES[id]} מחברים`).join(" + ")}
                </p>
              );
            })()}
            {houseUpgradeMsg && (
              <p style={{ margin: "4px 0", fontSize: 12, color: "#c0392b", direction: "rtl" }}>
                {houseUpgradeMsg}
                {houseUpgradeMsg.includes("חברים") && (
                  <>{" "}<a href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F" target="_blank" rel="noopener noreferrer" onClick={trackWaClick} style={{ color: "#25D366", textDecoration: "underline" }}>{he.inviteFriends}</a></>
                )}
              </p>
            )}
            {(showHouseModal.cell.houseLevel || 1) < 5 ? (
              <button className={styles.shopBuyBtn} onClick={handleHouseUpgrade} disabled={houseUpgrading}>
                {houseUpgrading ? he.upgrading : he.houseUpgrade((showHouseModal.cell.houseLevel || 1) + 1, HOUSE_UPGRADE_COSTS[(showHouseModal.cell.houseLevel || 1) + 1].cost)}
              </button>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#c8a200", fontWeight: 600 }}>{he.houseGoldMax}</p>
            )}
            {(showHouseModal.cell.houseLevel || 1) >= 3 && !grid.flat().some((c) => c && c.building === "community-center" && c.ownerUid === (user?.firebaseUid || user?.uid)) && (
              <>
                <hr style={{ margin: "10px 0", border: "none", borderTop: "1px solid #eee" }} />
                <p style={{ margin: "4px 0", fontSize: 13, color: "#4a7c3f" }}>{he.houseCCAvailable}</p>
                <p style={{ margin: "2px 0", fontSize: 11, color: "#888", direction: "rtl" }}>{he.houseCCCost}</p>
                {ccMsg && (
                  <p style={{ margin: "4px 0", fontSize: 12, color: "#c0392b", direction: "rtl" }}>
                    {ccMsg}
                    {ccMsg.includes("חברים") && (
                      <>{" "}<a href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F" target="_blank" rel="noopener noreferrer" onClick={trackWaClick} style={{ color: "#25D366", textDecoration: "underline" }}>{he.inviteFriends}</a></>
                    )}
                  </p>
                )}
                <button className={styles.shopBuyBtn} onClick={handleBuyCC} disabled={ccBuying}>
                  {ccBuying ? he.buying : he.houseCCBuy}
                </button>
              </>
            )}
            <button className={styles.shopCloseBtn} onClick={() => { setShowHouseModal(null); setHouseUpgradeMsg(null); setCCMsg(null); }}>{he.houseClose}</button>
          </div>
        </div>
      )}

      {/* Community Center Modal */}
      {showCCModal && (
        <div className={styles.shopBackdrop} onClick={() => { setShowCCModal(null); setCCMsg(null); }}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.ccTitle}</p>
            <p className={styles.shopBalance}>{he.ccBalance(user?.money ?? 0)}</p>
            <p style={{ margin: "4px 0", fontSize: 14 }}>
              {he.ccLevelOf5(showCCModal.cell.ccLevel || 1)}
              {" · "}{he.ccBonus(CC_ITEM_BONUS[showCCModal.cell.ccLevel || 1])}
            </p>
            {(showCCModal.cell.ccLevel || 1) < 5 && (() => {
              const req = CC_UPGRADE_COSTS[(showCCModal.cell.ccLevel || 1) + 1];
              return (
                <p style={{ margin: "2px 0", fontSize: 11, color: "#888", direction: "rtl" }}>
                  {he.houseRequirementsLine((showCCModal.cell.ccLevel || 1) + 1, req.cost)}
                  {req.friendItems.map(({ id, count }) => `${count} ${ITEM_NAMES[id]} מחברים`).join(" + ")}
                </p>
              );
            })()}
            {ccMsg && (
              <p style={{ margin: "4px 0", fontSize: 12, color: "#c0392b", direction: "rtl" }}>
                {ccMsg}
                {ccMsg.includes("חברים") && (
                  <>{" "}<a href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F" target="_blank" rel="noopener noreferrer" onClick={trackWaClick} style={{ color: "#25D366", textDecoration: "underline" }}>{he.inviteFriends}</a></>
                )}
              </p>
            )}
            {(showCCModal.cell.ccLevel || 1) < 5 ? (
              <button className={styles.shopBuyBtn} onClick={handleCCUpgrade} disabled={ccUpgrading}>
                {ccUpgrading ? he.upgrading : he.ccUpgrade((showCCModal.cell.ccLevel || 1) + 1, CC_UPGRADE_COSTS[(showCCModal.cell.ccLevel || 1) + 1].cost)}
              </button>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#4a7c3f", fontWeight: 600 }}>{he.ccMaxLevelMsg}</p>
            )}
            <button className={styles.shopCloseBtn} onClick={() => { setShowCCModal(null); setCCMsg(null); }}>{he.ccClose}</button>
          </div>
        </div>
      )}

      {/* Power Plant Modal */}
      {showPowerPlant && (
        <div className={styles.shopBackdrop} onClick={() => setShowPowerPlant(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>{he.powerPlantTitle}</p>
            <p className={styles.shopBalance}>{he.powerPlantBalance(user?.money ?? 0)}</p>
            {user?.powerBoostExpiry && new Date(user.powerBoostExpiry) > new Date() ? (
              <>
                <p style={{ margin: 0, fontSize: 13, color: "#4a7c3f" }}>{he.powerPlantActiveSubscription}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#888" }}>
                  {he.powerPlantExpiry(new Date(user.powerBoostExpiry).toLocaleDateString("he-IL"))}
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 13 }}>{he.powerPlantDesc}</p>
                <button
                  className={styles.shopBuyBtn}
                  onClick={handlePowerSubscribe}
                  disabled={powerPlantSubscribing || !user || (user.money ?? 0) < 400}
                >
                  {powerPlantSubscribing ? he.buying : he.powerPlantSubscribe}
                </button>
              </>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowPowerPlant(false)}>{he.powerPlantClose}</button>
          </div>
        </div>
      )}
      {/* Godzilla Modal */}
      {showGodzilla && (
        <div className={styles.shopBackdrop} onClick={() => setShowGodzilla(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 8 }}>🦖</div>
            <p className={styles.shopTitle} style={{ fontSize: 22 }}>{he.godzillaTitle}</p>
            <img src="/assets/godzilla.png" alt={he.godzillaAlt} style={{ width: 140, height: 140, objectFit: "contain", margin: "8px auto", display: "block" }} />
            <p style={{ margin: "8px 0 4px", fontSize: 15, direction: "rtl", color: "#333" }}>
              {he.godzillaWarning}
            </p>
            <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#666", direction: "rtl" }}>
              {he.godzillaDesc}
            </p>
            <button className={styles.shopCloseBtn} onClick={() => setShowGodzilla(false)}>{he.godzillaRun}</button>
          </div>
        </div>
      )}
    </>
  );
}
