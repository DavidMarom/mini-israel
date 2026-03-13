import styles from "./SplashScreen.module.css";

export default function SplashScreen({ show, fading }) {
  if (!show) return null;

  return (
    <div className={`${styles.splash} ${fading ? styles.splashFading : ""}`}>
      <img src="/assets/splash.png" alt="מיני ישראל" className={styles.splashImg} />
      <div className={styles.splashLoader}>
        <div className={styles.splashSpinner} />
      </div>
    </div>
  );
}
