"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { auth } from "../services/fb";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, } from "firebase/auth";
import { GameBoard, NameModal, ComposeModal, SplashScreen, LotteryPopup, ResourceBar, ScrollHint, MobilePortraitOverlay, Sidebar } from "../components";
import useUserStore from "../store/useUserStore";
import { fireConfetti } from "../utils/confetti";

const provider = new GoogleAuthProvider();

export default function Home() {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [taglines, setTaglines] = useState([]);
  const [starHouse, setStarHouse] = useState(null); // { name, sponsor }
  const [showLotteryPopup, setShowLotteryPopup] = useState(false);
  const [showMissile, setShowMissile] = useState(false);
  const [missileBottom, setMissileBottom] = useState(30);

  useEffect(() => {
    const check = () => setIsMobilePortrait(window.innerWidth < window.innerHeight);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fireMissile = () => {
      setMissileBottom(5 + Math.random() * 25);
      setShowMissile(true);
      setTimeout(() => setShowMissile(false), 4000);
    };
    const interval = setInterval(fireMissile, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/admin/taglines")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.taglines)) setTaglines(data.taglines); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.starHouse) setStarHouse(data.starHouse);
        if (data.lotteryPopupEnabled) setShowLotteryPopup(true);
      })
      .catch(console.error);
  }, []);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setSplashFading(true);
      setTimeout(() => setShowSplash(false), 300);
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  const [error, setError] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [composeTarget, setComposeTarget] = useState(null); // { ownerUid, ownerName }
  const [composeText, setComposeText] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeItemIndex, setComposeItemIndex] = useState(null);
  const [poopThrowing, setPoopThrowing] = useState(false);
  const [justPoopedUid, setJustPoopedUid] = useState(null);
  const [hasFarm, setHasFarm] = useState(false);
  const [buyingFarm, setBuyingFarm] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);
  const boardRef = useRef(null);

  const {
    user: storedUser,
    setUser: setUserStore,
    clearUser,
    setNeedsHousePlacement,
  } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Ensure the user exists in MongoDB
        syncUserWithBackend(firebaseUser).catch((err) => {
          console.error("Failed to sync user with backend", err);
          setError("לא ניתן לשמור את הפרופיל שלך, נסה שוב מאוחר יותר.");
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserWithBackend = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/auth/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync user");
      }

      const data = await res.json();
      if (data?.user) {
        setBackendUser(data.user);

        const mergedUser = {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: data.user.name || firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          mongoId: data.user._id,
          money: typeof data.user.money === "number" ? data.user.money : 0,
          bio: data.user.bio ?? null,
          inventory: data.user.inventory ?? [],
          isVIP: data.user.isVIP ?? false,
          powerBoostExpiry: data.user.powerBoostExpiry ?? null,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        };

        setUserStore(mergedUser);

        if (data.created) {
          setNameInput(mergedUser.name || "");
          setShowNameModal(true);
          setNeedsHousePlacement(true);
        }
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("ההתחברות באמצעות Google נכשלה, נסה שוב.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await signOut(auth);
      clearUser();
      setBackendUser(null);
    } catch (err) {
      console.error(err);
      setError("ההתנתקות נכשלה, נסה שוב.");
    }
  };

  const saveName = async (newName, newBio) => {
    if (!backendUser) return false;
    const trimmed = newName.trim();
    if (!trimmed) return false;

    try {
      const res = await fetch("/api/auth/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: backendUser.uid,
          email: backendUser.email,
          name: trimmed,
          bio: typeof newBio === "string" ? newBio.trim() : undefined,
          forceUpdate: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update name");
      }

      const data = await res.json();
      if (data?.user) {
        setBackendUser(data.user);
        setUserStore((prev) => ({
          ...(prev || {}),
          name: data.user.name,
          bio: data.user.bio ?? null,
          updatedAt: data.user.updatedAt,
        }));
      }

      return true;
    } catch (err) {
      console.error(err);
      setError("לא ניתן לשמור את השם, נסה שוב.");
      return false;
    }
  };

  const handleSaveName = async () => {
    const ok = await saveName(nameInput);
    if (ok) {
      setShowNameModal(false);
    }
  };

  const handleSendMessage = async () => {
    if (!composeTarget || !storedUser) return;
    if (composeItemIndex === null && !composeText.trim()) return;
    setComposeSending(true);
    try {
      if (composeItemIndex !== null) {
        const res = await fetch("/api/items/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUid: storedUser.firebaseUid,
            fromName: storedUser.name,
            toUid: composeTarget.ownerUid,
            toName: composeTarget.ownerName,
            itemIndex: composeItemIndex,
            text: composeText,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setUserStore((prev) => ({ ...prev, inventory: data.inventory }));
        }
      } else {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUid: storedUser.firebaseUid,
            fromName: storedUser.name,
            toUid: composeTarget.ownerUid,
            toName: composeTarget.ownerName,
            text: composeText,
          }),
        });
      }
      setComposeTarget(null);
      setComposeText("");
      setComposeItemIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setComposeSending(false);
    }
  };

  const handleBuyVip = async () => {
    if (!storedUser) return;
    const uid = storedUser.firebaseUid;
    try {
      const res = await fetch("/api/upgrade/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          data.error === "Insufficient funds" ? "אין מספיק מטבעות" :
          data.error === "Already VIP" ? "כבר VIP!" :
          "שגיאה, נסה שוב"
        );
        return;
      }
      setUserStore((prev) => ({ ...prev, money: data.money, isVIP: true }));
      fireConfetti();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyFarm = async () => {
    if (!storedUser || buyingFarm) return;
    const uid = storedUser.firebaseUid;
    setBuyingFarm(true);
    try {
      const res = await fetch("/api/farm/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          data.error === "Insufficient funds" ? "אין מספיק מטבעות" :
          data.error === "No house found" ? "יש לבנות בית לפני קניית חווה" :
          data.error === "Already has farm" ? "כבר יש לך חווה" :
          "שגיאה, נסה שוב"
        );
        return;
      }
      setUserStore((prev) => ({ ...prev, money: data.money }));
      fireConfetti();
      if (data.newHouseRow != null) {
        setUserStore((prev) => ({ ...prev, mainHouse: { row: data.newHouseRow, col: data.newHouseCol } }));
      }
      setHasFarm(true);
      setBoardRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setBuyingFarm(false);
    }
  };

  const handleThrowPoop = async () => {
    if (!composeTarget || !storedUser || poopThrowing) return;
    const uid = storedUser.firebaseUid || storedUser.uid;
    setPoopThrowing(true);
    try {
      const res = await fetch("/api/poop/throw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, targetUid: composeTarget.ownerUid }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserStore((prev) => ({ ...prev, inventory: data.inventory }));
        setJustPoopedUid(composeTarget.ownerUid);
        setComposeTarget(null);
        setComposeItemIndex(null);
      } else {
        alert(data.error || "שגיאה, נסה שוב");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPoopThrowing(false);
    }
  };

  return (
    <div className={styles.page}>
      <SplashScreen show={showSplash} fading={splashFading} />
      <MobilePortraitOverlay show={isMobilePortrait} />
      <div className={styles.boardLayer}>
        <GameBoard onOtherHouseClick={(target) => { setComposeTarget(target); setComposeText(""); setComposeItemIndex(null); }} justPoopedUid={justPoopedUid} boardRefreshKey={boardRefreshKey} onHasFarmChange={setHasFarm} boardRef={boardRef} />
      </div>

      {storedUser && <ResourceBar money={storedUser.money} />}
      <ScrollHint />

      <Sidebar
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        storedUser={storedUser}
        boardRef={boardRef}
        onWaClick={() => { const uid = storedUser?.firebaseUid; if (uid) fetch("/api/track/wa-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) }); }}
        taglines={taglines}
        starHouse={starHouse}
        loading={loading}
        user={user}
        displayName={(storedUser && storedUser.name) || (backendUser && (backendUser.name || backendUser.email)) || (user && user.email) || ""}
        money={(storedUser && storedUser.money) || (backendUser && backendUser.money) || 0}
        bio={(storedUser && storedUser.bio) || (backendUser && backendUser.bio) || ""}
        inventory={(storedUser && storedUser.inventory) || []}
        photoURL={user ? user.photoURL : null}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        error={error}
        onUpdateName={saveName}
        onBuyFarm={handleBuyFarm}
        hasFarm={hasFarm}
        buyingFarm={buyingFarm}
        isVIP={storedUser?.isVIP ?? false}
        onBuyVip={handleBuyVip}
      />

      <ComposeModal
        composeTarget={composeTarget}
        storedUser={storedUser}
        composeText={composeText}
        setComposeText={setComposeText}
        composeItemIndex={composeItemIndex}
        setComposeItemIndex={setComposeItemIndex}
        composeSending={composeSending}
        poopThrowing={poopThrowing}
        onSend={handleSendMessage}
        onThrowPoop={handleThrowPoop}
        onClose={() => { setComposeTarget(null); setComposeItemIndex(null); }}
      />

      {showNameModal && (<NameModal name={nameInput} onChangeName={setNameInput} onSave={handleSaveName} />)}
      {showMissile && (<img src="/assets/missile.png" alt="" className={styles.missile} style={{ bottom: `${missileBottom}vh` }} />)}

      <LotteryPopup show={showLotteryPopup} onClose={() => setShowLotteryPopup(false)} storedUser={storedUser} />

    </div>
  );
}
