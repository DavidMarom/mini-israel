import styles from "./SidebarFooter.module.css";

export default function SidebarFooter() {
  return (
    <div className={styles.sidebarFooter}>
      <a href="/takanon" target="_blank" rel="noopener noreferrer" className={styles.takanonLink}>תקנון</a>
      <span> | </span>
      <span>האתר מופעל ע״י חברת </span>
      <a href="https://wa.me/972545779917?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C" target="_blank" rel="noopener noreferrer" className={styles.sidebarFooterPhone}>054-5779917</a>
      <span> | </span>
      <a href="https://www.stealthcode.co/" target="_blank" rel="noopener noreferrer" className={styles.sidebarFooterLink}>stealthCode</a>
    </div>
  );
}
