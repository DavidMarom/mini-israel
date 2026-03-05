import styles from "./takanon.module.css";

export const metadata = {
  title: "תקנון - מיני ישראל",
};

export default function TakanonPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/assets/main-house.png" alt="מיני ישראל" className={styles.logo} />
          <h1 className={styles.title}>תקנון מיני ישראל</h1>
        </div>

        <p className={styles.updated}>עודכן לאחרונה: מרץ 2026</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. כללי</h2>
          <p>מיני ישראל ("האתר") הוא משחק רשת חברתי מקוון המאפשר למשתמשים לבנות בתים, לסחור בפריטים ולתקשר זה עם זה.</p>
          <p>השימוש באתר מהווה הסכמה לתנאי תקנון זה. אם אינך מסכים לתנאים, אנא הימנע משימוש באתר.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. התנהגות מותרת</h2>
          <ul className={styles.list}>
            <li>שימוש בשפה מכבדת בהודעות ובפרסומות.</li>
            <li>פרסום תכנים חוקיים בלבד.</li>
            <li>כבד את המשתמשים האחרים ואת המרחב המשותף.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. התנהגות אסורה</h2>
          <ul className={styles.list}>
            <li>שימוש בשפה פוגענית, גזענית, מאיימת או מטרידה.</li>
            <li>פרסום תכנים בלתי חוקיים, פורנוגרפיים או מזיקים.</li>
            <li>ניסיון לפרוץ, לנצל לרעה או להשבית את האתר.</li>
            <li>יצירת חשבונות מרובים לצורך השגת יתרון לא הוגן.</li>
            <li>ספאם בהודעות או בפרסומות.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. פרסומות</h2>
          <p>משתמשים רשאים לפרסם פרסומות בתשלום של 100 מטבעות לשבוע. הפרסום חייב לעמוד בכללי ההתנהגות הנ"ל. מפעילי האתר שומרים לעצמם את הזכות להסיר כל פרסומת שנמצאת בניגוד לתקנון.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. פרטיות</h2>
          <p>האתר אוסף מידע בסיסי בלבד: כתובת דוא"ל, שם משתמש ותמונת פרופיל מחשבון Google. מידע זה משמש אך ורק לצורך פעילות האתר ולא יועבר לצדדים שלישיים.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. הגבלת אחריות</h2>
          <p>האתר ניתן "כמות שהוא" ללא כל אחריות. מפעילי האתר אינם אחראים לאובדן מטבעות, פריטים, נתונים, או כל נזק אחר שנגרם עקב שימוש באתר.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. שינויים בתקנון</h2>
          <p>מפעילי האתר שומרים לעצמם את הזכות לשנות תקנון זה בכל עת. המשך השימוש באתר לאחר עדכון התקנון מהווה הסכמה לשינויים.</p>
        </section>

        <div className={styles.footer}>
          <a href="/" className={styles.backLink}>חזרה למיני ישראל</a>
        </div>
      </div>
    </div>
  );
}
