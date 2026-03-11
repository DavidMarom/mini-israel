import styles from "./horaot.module.css";

export const metadata = {
  title: "הוראות - מיני ישראל",
};

export default function HoraotPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/assets/main-house.png" alt="מיני ישראל" className={styles.logo} />
          <h1 className={styles.title}>הוראות משחק – מיני ישראל</h1>
        </div>

        <p className={styles.subtitle}>ברוכים הבאים למיני ישראל! הנה כל מה שצריך לדעת כדי להתחיל לשחק.</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏠 בניית הבית</h2>
          <p>לאחר ההתחברות, לחצו על משבצת ריקה במפה כדי למקם את הבית שלכם. הבית ישמור על מיקומו.</p>
          <p>ניתן לשנות את שם המשתמש ואת הביו דרך כפתור העריכה (✎) בתפריט.</p>
          <p>ניתן לשדרג את הבית עד לרמה 5. כל שדרוג עולה יותר מטבעות ומחייב פריטים שנשלחו מחברים. בתים ברמה גבוהה מניבים בונוס נוסף בעת איסוף ביצים מהחווה.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🌾 קניית חווה</h2>
          <p>לאחר שיש לכם בית, ניתן לקנות חווה תמורת 500 🪙. החווה תוצב ממש מימין לבית שלכם.</p>
          <p>כל שעה עגולה החווה מייצרת ביצה 🥚. לחצו על החווה שלכם כדי לאסוף את הביצה ולקבל מטבעות.</p>
          <ul className={styles.list}>
            <li>בסיס: 20 🪙 לשעה.</li>
            <li>בונוס מרמת הבית: רמה 2 = +5, רמה 3 = +10, רמה 4 = +20, רמה 5 = +35.</li>
            <li>בונוס תחנת כוח (אם פעילה): +20 🪙.</li>
            <li>בונוס VIP: +20 🪙.</li>
          </ul>
          <p>ניתן לשדרג את החווה עד לרמה 3. רמה 2 מכפילה את הרווח הבסיסי ×2, רמה 3 ×3. שדרוג לרמה 2 עולה 600 🪙 + 2 חולצות חברים, שדרוג לרמה 3 עולה 1200 🪙.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏘️ מרכז קהילתי</h2>
          <p>שחקנים עם בית ברמה 3 ומעלה יכולים לרכוש מרכז קהילתי תמורת 600 🪙 + 2 דגלים מחברים. ניתן לשדרג אותו עד לרמה 5 עם עלויות עולות.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💰 איך מרוויחים מטבעות?</h2>
          <ul className={styles.list}>
            <li>איסוף תפוחים 🍎 ותפוזים 🍊 מהמפה - 5 🪙 לכל אחד.</li>
            <li>מציאת אוצר 💎 - 200 🪙 למוצא הראשון.</li>
            <li>מענה נכון בטריוויה 🧠 - 10 🪙 (שאלה קלה) או 20 🪙 (שאלה קשה).</li>
            <li>איסוף ביצה מהחווה 🥚 - 20 🪙 לשעה + בונוסים (ראו פרק חווה).</li>
            <li>בונוס שכונה יומי 🎁 - 50 🪙 פעם ביום לכל שכונה שאתם חלק ממנה (100 🪙 אם אתם VIP).</li>
            <li>מכירת פריטים בכנסת 🏛️.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏘️ שכונות</h2>
          <p>שחקנים שגרים קרוב זה לזה (עד 5 משבצות) מקובצים אוטומטית לשכונה. שכונה מינימלית מכילה 10 בתים.</p>
          <p>פעם ביום ניתן לתבוע בונוס שכונה: 50 🪙 לשכונה (100 🪙 למנויי VIP). אם אתם חלק ממספר שכונות – תוכלו לתבוע מכל אחת.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ VIP</h2>
          <p>רכישת VIP עולה 1,500 🪙 (חד-פעמי). היתרונות:</p>
          <ul className={styles.list}>
            <li>בונוס שכונה יומי כפול: 100 🪙 במקום 50 🪙.</li>
            <li>בונוס נוסף של +20 🪙 בכל איסוף ביצה מהחווה.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚡ תחנת כוח – בוסט אנרגיה</h2>
          <p>לחצו על תחנת הכוח במפה כדי לרכוש מנוי בוסט אנרגיה תמורת 400 🪙 ל-7 ימים.</p>
          <p>בזמן שהמנוי פעיל, כל איסוף ביצה מהחווה מניב +20 🪙 נוספים.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏬 קניון אזריאלי</h2>
          <p>לחצו על בניין אזריאלי במפה כדי לפתוח את החנות. ניתן לרכוש פריטים שונים:</p>
          <ul className={styles.list}>
            <li>פרח 🌸 - 10 🪙</li>
            <li>דגל 🇮🇱 - 10 🪙</li>
            <li>פלאפל 🧆 - 25 🪙</li>
            <li>חולצה 👕 - 30 🪙</li>
            <li>אוזניות 🎧 - 50 🪙</li>
            <li>אופניים 🚲 - 80 🪙</li>
            <li>מחשב 💻 - 120 🪙</li>
          </ul>
          <p>ניתן למכור פריטים בכנסת 🏛️, ולשלוח פריטים לשחקנים אחרים דרך חלון ההודעות. פריטים שנשלחו מחברים משמשים גם לשדרוג בית וחווה.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💩 מערכת הקקי</h2>
          <p>אם יש לכם קקי במלאי, ניתן לזרוק אותו על הבית של שחקן אחר. הבית שלהם יראה מלוכלך עד שהבעלים ינקה אותו.</p>
          <p>כדי לנקות את הבית שלכם לאחר שהושלך עליו קקי - פשוט לחצו עליו.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>✉️ הודעות</h2>
          <p>לחצו על הבית של שחקן אחר כדי לשלוח לו הודעה. ניתן גם לצרף פריט מהמלאי שלכם כמתנה.</p>
          <p>ניתן לצפות בהודעות שקיבלתם דרך אייקון ההודעות בתפריט.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏆 מצעד העשירים</h2>
          <p>לחצו על בניין המצעד במפה כדי לראות את עשרת השחקנים העשירים ביותר.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💵 המרה לכסף אמיתי</h2>
          <p>שחקנים עם לפחות 1,000 מטבעות יכולים להמיר אותם לזיכוי טלפוני דרך בניין ה"המר לכסף" במפה.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📍 מבנים מיוחדים במפה</h2>
          <ul className={styles.list}>
            <li><strong>קניון אזריאלי</strong> - חנות לרכישת פריטים.</li>
            <li><strong>בית כנסת</strong> - פרשת השבוע.</li>
            <li><strong>הכנסת</strong> - מכירת פריטים מהמלאי.</li>
            <li><strong>יד שרה</strong> - תרומה לצדקה (100 🪙, פעם בשבוע).</li>
            <li><strong>טריוויה</strong> - שאלות ידע כללי לזכיה במטבעות.</li>
            <li><strong>מצעד העשירים</strong> - טבלת מובילים.</li>
            <li><strong>מצלמה</strong> - צלמו את עצמכם ושתפו עם כולם.</li>
            <li><strong>תחנת כוח</strong> - רכישת בוסט אנרגיה ל-7 ימים (400 🪙).</li>
            <li><strong>בניין הנר</strong> - רכישת נרות זיכרון 🕯️ (40 🪙 לנר).</li>
            <li><strong>פרסום</strong> - פרסמו הודעה על הלוח לכל השחקנים (100 🪙 ל-5 ימים).</li>
            <li><strong>בחירות</strong> - הצביעו במשאל השבועי.</li>
            <li><strong>המר לכסף</strong> - המרת מטבעות לזיכוי טלפוני (מינימום 1,000 🪙).</li>
            <li><strong>אילת</strong> - יעד תיירות בקצה המפה.</li>
          </ul>
        </section>

        <div className={styles.footer}>
          <a href="/" className={styles.backLink}>חזרה למיני ישראל</a>
        </div>
      </div>
    </div>
  );
}
