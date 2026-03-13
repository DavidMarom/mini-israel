import styles from "./Sidebar.module.css";
import { AuthCard, MessagesCard, StarHouseBanner, SiteHeader, SidebarFooter } from "../index";
import he from "../../lang/he";

export default function Sidebar({
  isOpen,
  onOpen,
  onClose,
  storedUser,
  boardRef,
  onWaClick,
  taglines,
  starHouse,
  // AuthCard props
  loading,
  user,
  displayName,
  money,
  bio,
  inventory,
  photoURL,
  error,
  onGoogleSignIn,
  onLogout,
  onUpdateName,
  onBuyFarm,
  hasFarm,
  buyingFarm,
  isVIP,
  onBuyVip,
}) {
  return (
    <>
      <button
        className={`${styles.sidebarToggle}${isOpen ? ` ${styles.sidebarToggleHidden}` : ""}`}
        onClick={onOpen}
        aria-label={he.sidebarOpenMenu}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <path d="M14 7l4 5-4 5" />
        </svg>
      </button>

      {isOpen && <div className={styles.sidebarBackdrop} onClick={onClose} />}

      <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}>
        <button className={styles.sidebarClose} onClick={onClose} aria-label={he.sidebarCloseMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <SiteHeader storedUser={storedUser} boardRef={boardRef} onWaClick={onWaClick} />

        <AuthCard
          loading={loading}
          user={user}
          displayName={displayName}
          money={money}
          bio={bio}
          inventory={inventory}
          photoURL={photoURL}
          onGoogleSignIn={onGoogleSignIn}
          onLogout={onLogout}
          error={error}
          onUpdateName={onUpdateName}
          onBuyFarm={onBuyFarm}
          hasFarm={hasFarm}
          buyingFarm={buyingFarm}
          isVIP={isVIP}
          onBuyVip={onBuyVip}
        />
        <MessagesCard user={storedUser} />
        <StarHouseBanner starHouse={starHouse} />
        {taglines.map((t, i) => (
          <p key={i} className={styles.tagline}>{t}</p>
        ))}
        <SidebarFooter />
      </div>
    </>
  );
}
