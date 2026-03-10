"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameBoard.module.css";
import useUserStore from "../../store/useUserStore";
import TRIVIA_QUESTIONS from "../../data/triviaQuestions";

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

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function GameBoard({ onOtherHouseClick, justPoopedUid, boardRefreshKey, onHasFarmChange }) {
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
    if (!cashoutPhone.trim()) { setCashoutError("יש להזין מספר טלפון"); return; }
    if (!coins || coins < 1000) { setCashoutError("מינימום 1000 מטבעות"); return; }
    if (!user || (user.money ?? 0) < coins) { setCashoutError("אין מספיק מטבעות"); return; }
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
        setCashoutError(data.error || "שגיאה, נסה שוב");
      }
    } catch (e) {
      setCashoutError("שגיאה, נסה שוב");
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
        alert(data.error === "Insufficient funds" ? "אין מספיק מטבעות" : "שגיאה, נסה שוב");
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, powerBoostExpiry: data.powerBoostExpiry }));
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
      if (data.money != null) setUser((prev) => ({ ...prev, money: data.money }));
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
      setFarmUpgradeMsg("אין מספיק מטבעות לשדרוג");
      return;
    }
    if (currentLevel === 1) {
      const friendShirts = (user.inventory || []).filter((i) => i.id === "shirt" && i.fromFriend);
      if (friendShirts.length < 2) {
        setFarmUpgradeMsg("לשדרוג ראשון נדרשות לפחות 2 חולצות שקיבלת מחברים");
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
          data.error === "Insufficient funds" ? "אין מספיק מטבעות לשדרוג" :
          data.error === "Need friend shirts" ? "לשדרוג ראשון נדרשות לפחות 2 חולצות שקיבלת מחברים" :
          "שגיאה, נסה שוב"
        );
        return;
      }
      setFarmUpgradeMsg(null);
      setUser((prev) => ({ ...prev, money: data.money }));
      const { row, col } = showFarmModal;
      const next = grid.map((r) => r.slice());
      next[row][col] = { ...next[row][col], farmLevel: data.farmLevel };
      setGrid(next);
      setShowFarmModal((prev) => prev ? { ...prev, cell: { ...prev.cell, farmLevel: data.farmLevel } } : null);
    } catch (e) { console.error(e); }
    finally { setFarmUpgrading(false); }
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

  const SHOP_ITEMS = [
    { id: "flower",      emoji: "🌸", name: "פרח",         price: 10,  sellPrice: 7   },
    { id: "falafel",     emoji: "🧆", name: "פלאפל",       price: 25,  sellPrice: 17  },
    { id: "flag",        emoji: "🇮🇱", name: "דגל ישראל",  price: 10,  sellPrice: 7   },
    { id: "bike",        img: "/assets/items/bike.png",        name: "אופניים",    price: 80,  sellPrice: 55  },
    { id: "headphones",  img: "/assets/items/headphones.png",  name: "אוזניות",    price: 50,  sellPrice: 35  },
    { id: "pc",          img: "/assets/items/pc.png",          name: "מחשב",       price: 120, sellPrice: 85  },
    { id: "shirt",       img: "/assets/items/shirt.png",       name: "חולצה",      price: 30,  sellPrice: 20  },
  ];
  const DEFAULT_SELL_PRICE = 5;

  const [showKnesset, setShowKnesset] = useState(false);
  const [sellingItem, setSellingItem] = useState(null); // index being sold

  const [showYadSara, setShowYadSara] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donationDone, setDonationDone] = useState(false);

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
        alert(data.error === "Insufficient funds" ? "אין מספיק מטבעות לתרומה" : "שגיאה, נסה שוב");
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
      } else {
        alert(data.error || "שגיאה, נסה שוב");
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
        alert(data.error === "Insufficient funds" ? "אין מספיק מטבעות" : "שגיאה, נסה שוב");
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
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
        alert(data.error === "Insufficient funds" ? "אין מספיק כסף" : "שגיאה, נסה שוב");
        return;
      }
      setUser((prev) => ({ ...prev, money: data.money, inventory: data.inventory }));
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
            ...(cell.building === "farm" ? { eggReady: cell.eggReady || false, lastEggEpoch: cell.lastEggEpoch ?? null } : {}),
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
            alert("מישהו אחר כבר מצא את האוצר!");
            return;
          }
          if (data.ok) {
            const next = grid.map((r) => r.slice());
            next[row][col] = null;
            setGrid(next);
            setUser((prev) => ({ ...prev, money: data.money }));
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
          if (data.inventory) setUser((prev) => ({ ...prev, inventory: data.inventory }));
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
          if (data.inventory) setUser((prev) => ({ ...prev, inventory: data.inventory }));
        })
        .catch(console.error);

      return;
    }

    // Clicking own poophouse → clean it
    if (cell && cell.building === "main-house" && cell.ownerUid === ownerUid && cell.pooped) {
      handleCleanHouse();
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
        alert(data.error === "Insufficient funds" ? "אין מספיק כסף" : "שגיאה, נסה שוב");
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
      alert("שגיאה, נסה שוב");
    } finally {
      setAdSubmitting(false);
    }
  };

  return (
    <>
      {onlineCount !== null && (
        <div className={styles.onlineLabel}>
          <span className={styles.onlineDot} />
          מחוברים כרגע: <strong>{onlineCount}</strong>
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
      <div className={styles.board}>
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const key = `${row}-${col}`;
            const cell = grid[row][col];
            const ownerUid = user && (user.firebaseUid || user.uid);
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
                  <img src="/assets/items/shirt.png" alt="חולצה" className={styles.tileItemImg} />
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
                      src={isPoopHouse ? "/assets/poophouse.png" : "/assets/main-house.png"}
                      alt={isPoopHouse ? "בית מלוכלך" : "בית ראשי"}
                      className={styles.mainHouse}
                    />
                    {(cell.ownerUid === ownerUid ? (user?.name || cell.ownerName) : cell.ownerName) && (
                      <span className={styles.houseLabel}>
                        {cell.ownerUid === ownerUid ? (user?.name || cell.ownerName) : cell.ownerName}
                      </span>
                    )}
                    {isPoopHouse && cell.ownerUid === ownerUid && (
                      <span className={styles.cleanHouseHint}>לחץ לניקוי 🧹</span>
                    )}
                    {isStarHouse && <span className={styles.starBadge}>⭐</span>}
                  </div>
                )}
                {hasFarm && (
                  <div className={styles.farmWrapper}>
                    <img src="/assets/farm.png" alt="חווה" className={styles.mainHouse} />
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
                        src="/assets/main-house.png"
                        alt="מיקום בית ראשי"
                        className={styles.mainHouse}
                      />
                    </div>
                  )}
              </div>
            );
          })
        )}

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
          <img src="/assets/azrieli.png" alt="בניין אזריאלי" className={styles.azrieliBuilding} />
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
          <img src="/assets/synagogue.png" alt="בית כנסת" className={styles.azrieliBuilding} />
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
          <img src="/assets/knesset.png" alt="הכנסת" className={styles.azrieliBuilding} />
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
          <span className={styles.leaderboardBuildingLabel}>מצעד העשירים</span>
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
            onClick={() => { setShowYadSara(true); setDonationDone(false); }}
          >
            <img src="/assets/yad-sara.jpg" alt="יד שרה" className={styles.yadSaraImg} />
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
          <span className={styles.triviaBuildingLabel}>טריוויה</span>
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
            <img src={cameraPhoto} alt="תמונה שלי" className={styles.cameraPhoto} />
          )}
          <div className={`${styles.cameraPlaceholder} ${cameraPhoto ? styles.cameraPlaceholderOverlay : ""}`}>
            <span className={styles.cameraIcon}>📷</span>
            {!cameraPhoto && <span className={styles.cameraLabel}>צלם אותי</span>}
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
          צלמו את עצמכם!
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
          <span className={styles.cashoutBuildingLabel}>המר לכסף אמיתי!!</span>
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
          <img src="/assets/electric.png" alt="תחנת כוח" className={styles.azrieliBuilding} />
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
          <img src="/assets/candle-building.png" alt="בניין הנר" className={styles.azrieliBuilding} />
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
                  title="הצבע למסי"
                >
                  <img src="/assets/messi.png" alt="מסי" className={styles.pollWidgetImg} />
                  {pollUserVote === "messi" && <span className={styles.pollWidgetCheck}>✓</span>}
                </div>
                <span className={styles.pollWidgetVs}>VS</span>
                <div
                  className={`${styles.pollWidgetPlayer} ${pollUserVote === "ronaldo" ? styles.pollWidgetVoted : ""}`}
                  onClick={() => handlePollVote("ronaldo")}
                  title="הצבע לרונאלדו"
                >
                  <img src="/assets/ronaldo.png" alt="רונאלדו" className={styles.pollWidgetImg} />
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
              <span className={styles.neighborhoodCount}>{nbhd.memberCount} שכנים</span>
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
                <span className={styles.neighborhoodClaimed}>✓ נאסף היום</span>
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
          <img src="/assets/eilat.png" alt="אילת" className={styles.azrieliBuilding} />
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
              title="הוסף פרסומת"
            >
              +
            </button>
          )}
          <div className={styles.adContent}>
            {ads.length > 0 ? (
              <span className={styles.adText}>{renderWithLinks(ads[adIndex]?.text ?? "")}</span>
            ) : (
              <span className={styles.adEmptyText}>פרסם כאן!</span>
            )}
          </div>
        </div>
      </div>

      {/* Ad Submission Popup */}
      {showAdPopup && (
        <div className={styles.adPopupBackdrop}>
          <div className={styles.adPopupModal}>
            <p className={styles.adPopupTitle}>הוסף פרסומת</p>
            <textarea
              className={styles.adPopupTextarea}
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              placeholder="טקסט הפרסומת..."
              rows={3}
              maxLength={120}
            />
            <p className={styles.adPopupInfo}>עולה 100 מטבעות. הפרסום ישאר בלוח 5 ימים.</p>
            <p className={styles.adPopupInfo}>מותר לפרסם הכל, גם קישורים. אנא שימרו על שפה נאותה.</p>
            <div className={styles.adPopupActions}>
              <button
                className={styles.adPopupSubmit}
                onClick={handleSubmitAd}
                disabled={adSubmitting || !adText.trim()}
              >
                {adSubmitting ? "שולח..." : "פרסם"}
              </button>
              <button
                className={styles.adPopupCancel}
                onClick={() => { setShowAdPopup(false); setAdText(""); }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Azrieli Shop */}
      {showAzrieliShop && (
        <div className={styles.shopBackdrop} onClick={() => setShowAzrieliShop(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>🏬 קניון אזריאלי</p>
            <p className={styles.shopBalance}>יתרה: {user?.money ?? 0} שקלים</p>
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
            <button className={styles.shopCloseBtn} onClick={() => setShowAzrieliShop(false)}>סגור</button>
          </div>
        </div>
      )}

      {/* Candle Shop */}
      {showCandleShop && (
        <div className={styles.shopBackdrop} onClick={() => setShowCandleShop(false)}>
          <div className={styles.candleModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.candleTitle}>🕯️ חנות הנרות</p>
            <p className={styles.candleSubtitle}>יום האשה הבינלאומי</p>
            {candleDone ? (
              <>
                <p className={styles.candleThanks}>הנר נרכש! 🕯️✨<br />חג האשה שמח!</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowCandleShop(false)}>סגור</button>
              </>
            ) : (
              <>
                <img src="/assets/candle-building.png" alt="נר" className={styles.candleImg} />
                <p className={styles.candleDesc}>רכוש נר לכבוד יום האשה הבינלאומי 🌸</p>
                <p className={styles.candleBalance}>יתרתך: {user?.money ?? 0} מטבעות</p>
                <div className={styles.candleActions}>
                  <button
                    className={styles.candleBuyBtn}
                    onClick={handleBuyCandle}
                    disabled={candleBuying || !user || (user?.money ?? 0) < 40}
                  >
                    {candleBuying ? "מעבד..." : "רכוש נר - 40 🪙"}
                  </button>
                  <button className={styles.shopCloseBtn} onClick={() => setShowCandleShop(false)}>סגור</button>
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
            <p className={styles.cameraTitle}>צלם תמונה</p>
            <div className={styles.cameraBody}>
              <div className={styles.cameraActions}>
                <button className={styles.cameraSnapBtn} onClick={handleCapture}>צלם</button>
                <button className={styles.cameraCancelBtn} onClick={handleCloseCameraPopup}>ביטול</button>
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
            <span className={styles.treasureToastName}>{treasureWinnerToast.name} מצא את האוצר!</span>
            {treasureWinnerToast.sponsor && (
              <span className={styles.treasureToastSponsor}>בחסות {treasureWinnerToast.sponsor}</span>
            )}
          </div>
          <button className={styles.treasureToastClose} onClick={() => { dismissedTreasureRef.current = treasureWinnerToast.claimedAt; setTreasureWinnerToast(null); }}>✕</button>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className={styles.shopBackdrop} onClick={() => setShowLeaderboard(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>🏆 מצעד העשירים</p>
            {leaderboardLoading ? (
              <p className={styles.shopBalance}>טוען...</p>
            ) : (
              <div className={styles.leaderboardList}>
                {leaderboard.map((u, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMe = user && (user.firebaseUid || user.uid) === u.uid;
                  return (
                    <div key={u.uid || i} className={`${styles.leaderboardRow} ${isMe ? styles.leaderboardRowMe : ""}`}>
                      <span className={styles.leaderboardRank}>{medals[i] || `#${i + 1}`}</span>
                      <span className={styles.leaderboardName}>{u.name || "אנונימי"}</span>
                      <span className={styles.leaderboardMoney}>{u.money ?? 0} ₪</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowLeaderboard(false)}>סגור</button>
          </div>
        </div>
      )}

      {/* Knesset - Sell Items */}
      {showKnesset && (
        <div className={styles.shopBackdrop} onClick={() => setShowKnesset(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>🏛️ הכנסת</p>
            <p className={styles.shopBalance}>יתרה שלך: {user?.money ?? 0} שקלים</p>
            {!user ? (
              <p className={styles.knessetEmpty}>התחבר כדי למכור פריטים</p>
            ) : !user.inventory?.length ? (
              <p className={styles.knessetEmpty}>אין לך פריטים למכירה.<br />קנה פריטים בקניון אזריאלי!</p>
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
                        {sellingItem === i ? <span className={styles.shopSpinner} /> : "מכור"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowKnesset(false)}>סגור</button>
          </div>
        </div>
      )}

      {/* Yad Sara Donation Popup */}
      {showYadSara && (
        <div className={styles.shopBackdrop} onClick={() => setShowYadSara(false)}>
          <div className={styles.yadSaraModal} onClick={(e) => e.stopPropagation()}>
            <img src="/assets/yad-sara.jpg" alt="יד שרה" className={styles.yadSaraModalImg} />
            <p className={styles.yadSaraTitle}>❤️ תרומה לעמותת יד שרה</p>
            {donationDone ? (
              <>
                <p className={styles.yadSaraThanks}>תודה רבה על תרומתך! 🙏</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowYadSara(false)}>סגור</button>
              </>
            ) : (
              <>
                <p className={styles.yadSaraMsg}>בכל תרומה של 100 מטבעות משחק, אנחנו נתרום 2 שקלים לעמותת יד שרה!</p>
                <p className={styles.yadSaraBalance}>יתרתך: {user?.money ?? 0} מטבעות</p>
                <div className={styles.yadSaraActions}>
                  <button
                    className={styles.yadSaraDonateBtn}
                    onClick={handleDonate}
                    disabled={donating || !user || (user?.money ?? 0) < 100}
                  >
                    {donating ? "שולח תרומה..." : "תרום 100 מטבעות"}
                  </button>
                  <button className={styles.shopCloseBtn} onClick={() => setShowYadSara(false)}>סגור</button>
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
            <p className={styles.cashoutTitle}>💵 המר מטבעות לכסף אמיתי</p>
            {cashoutDone ? (
              <>
                <p className={styles.cashoutSuccess}>✅ הבקשה התקבלה! הכסף יועבר בביט בהקדם.</p>
                <button className={styles.shopCloseBtn} onClick={() => setShowCashout(false)}>סגור</button>
              </>
            ) : (
              <>
                <div className={styles.cashoutInfo}>
                  <p>הכסף יעבור בביט למספר שתזינו</p>
                  <p>על כל 100 מטבעות תקבלו 1 שקל אמיתי</p>
                  <p>מינימום 1000 מטבעות משחק להעברה</p>
                </div>
                <p className={styles.cashoutBalance}>יתרתך: <strong>{user?.money ?? 0}</strong> מטבעות</p>
                <div className={styles.cashoutFields}>
                  <div className={styles.cashoutField}>
                    <label>מספר טלפון לביט</label>
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
                    <label>כמות מטבעות לפדיון</label>
                    <input
                      type="number"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      placeholder="מינימום 1000"
                      className={styles.cashoutInput}
                      min={1000}
                    />
                  </div>
                </div>
                {cashoutAmount >= 1000 && (
                  <p className={styles.cashoutCalc}>תקבל: ₪{Math.floor(Number(cashoutAmount) / 100)}</p>
                )}
                {cashoutError && <p className={styles.cashoutError}>{cashoutError}</p>}
                <div className={styles.cashoutActions}>
                  <button
                    className={styles.cashoutSubmitBtn}
                    onClick={handleCashout}
                    disabled={cashoutSending || !user}
                  >
                    {cashoutSending ? "שולח..." : "שלח בקשה"}
                  </button>
                  <button className={styles.shopCloseBtn} onClick={() => setShowCashout(false)}>סגור</button>
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
            <p className={styles.triviaTitle}>🧠 טריוויה</p>
            <p className={styles.triviaLevel}>{triviaQuestion.hard ? "שאלה קשה - 20 מטבעות" : "שאלה קלה - 10 מטבעות"}</p>
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
                    ✅ נכון! +{triviaQuestion.hard ? 20 : 10} מטבעות{triviaAwarding ? " (מעדכן...)" : ""}
                  </p>
                ) : (
                  <p className={styles.triviaResultWrong}>❌ לא נכון. התשובה הנכונה: {triviaQuestion.options[triviaQuestion.answer]}</p>
                )}
                <button className={styles.triviaNextBtn} onClick={openTrivia}>שאלה הבאה</button>
              </div>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowTrivia(false)}>סגור</button>
          </div>
        </div>
      )}

      {/* Synagogue Parasha Popup */}
      {showSynagogue && (
        <div className={styles.shopBackdrop} onClick={() => setShowSynagogue(false)}>
          <div className={styles.parashaModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.parashaTitle}>🕍 פרשת השבוע</p>
            {parashaLoading && <p className={styles.parashaLoading}>טוען...</p>}
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
              <p className={styles.parashaLoading}>לא נמצאה פרשה</p>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowSynagogue(false)}>סגור</button>
          </div>
        </div>
      )}

      {/* Farm Modal */}
      {showFarmModal && (
        <div className={styles.shopBackdrop} onClick={() => { setShowFarmModal(null); setFarmUpgradeMsg(null); }}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>🌾 החווה שלי</p>
            <p className={styles.shopBalance}>יתרה: {user?.money ?? 0} שקלים</p>
            <p style={{ margin: 0, fontSize: 14 }}>
              רמה {showFarmModal.cell.farmLevel || 1} - {(showFarmModal.cell.farmLevel || 1) === 1 ? "20" : (showFarmModal.cell.farmLevel || 1) === 2 ? "40" : "80"} מטבעות לביצה
            </p>
            {showFarmModal.cell.eggReady ? (
              <button className={styles.shopBuyBtn} onClick={handleFarmModalCollect} disabled={farmCollecting}>
                {farmCollecting ? "אוסף..." : "🥚 אסוף ביצה"}
              </button>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>הביצה הבאה תהיה מוכנה בשעה הקרובה</p>
            )}
            {(showFarmModal.cell.farmLevel || 1) < 3 ? (
              <>
                {farmUpgradeMsg && (
                  <p style={{ margin: "4px 0", fontSize: 12, color: "#c0392b", direction: "rtl" }}>{farmUpgradeMsg}</p>
                )}
                <button
                  className={styles.shopBuyBtn}
                  onClick={handleFarmUpgrade}
                  disabled={farmUpgrading}
                >
                  {farmUpgrading
                    ? "משדרג..."
                    : `⬆️ שדרג לרמה ${(showFarmModal.cell.farmLevel || 1) + 1} – ${(showFarmModal.cell.farmLevel || 1) === 1 ? "600" : "1,200"} שקלים`}
                </button>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#4a7c3f", fontWeight: 600 }}>✅ חווה ברמה מקסימלית! (80 מטבעות לביצה)</p>
            )}
            <button className={styles.shopCloseBtn} onClick={() => { setShowFarmModal(null); setFarmUpgradeMsg(null); }}>סגור</button>
          </div>
        </div>
      )}

      {/* Power Plant Modal */}
      {showPowerPlant && (
        <div className={styles.shopBackdrop} onClick={() => setShowPowerPlant(false)}>
          <div className={styles.shopModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.shopTitle}>⚡ תחנת הכוח</p>
            <p className={styles.shopBalance}>יתרה: {user?.money ?? 0} שקלים</p>
            {user?.powerBoostExpiry && new Date(user.powerBoostExpiry) > new Date() ? (
              <>
                <p style={{ margin: 0, fontSize: 13, color: "#4a7c3f" }}>✅ מנוי חשמל פעיל! +20 מטבעות לכל ביצה</p>
                <p style={{ margin: 0, fontSize: 11, color: "#888" }}>
                  פג תוקף: {new Date(user.powerBoostExpiry).toLocaleDateString("he-IL")}
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 13 }}>קנה מנוי חשמל ל-7 ימים וקבל +20 מטבעות על כל ביצה שאתה אוסף!</p>
                <button
                  className={styles.shopBuyBtn}
                  onClick={handlePowerSubscribe}
                  disabled={powerPlantSubscribing || !user || (user.money ?? 0) < 400}
                >
                  {powerPlantSubscribing ? "רוכש..." : "⚡ קנה מנוי – 400 שקלים"}
                </button>
              </>
            )}
            <button className={styles.shopCloseBtn} onClick={() => setShowPowerPlant(false)}>סגור</button>
          </div>
        </div>
      )}
    </>
  );
}
