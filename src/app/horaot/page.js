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
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🌾 קניית חווה</h2>
          <p>לאחר שיש לכם בית, ניתן לקנות חווה תמורת 500 שקלים. החווה תוצב ממש מימין לבית שלכם.</p>
          <p>כל שעה עגולה החווה מייצרת ביצה 🥚. לחצו על החווה שלכם כדי לאסוף את הביצה ולקבל 20 שקלים.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💰 איך מרוויחים מטבעות?</h2>
          <ul className={styles.list}>
            <li>איסוף תפוחים 🍎 ותפוזים 🍊 מהמפה - 5 שקלים לכל אחד.</li>
            <li>מציאת אוצר 💎 - פרס מיוחד למוצא הראשון.</li>
            <li>מענה נכון בטריוויה 🧠 - 10 שקלים (שאלה קלה) או 20 שקלים (שאלה קשה).</li>
            <li>איסוף ביצה מהחווה 🥚 - 20 שקלים לשעה.</li>
            <li>בונוס שכונה יומי 🎁 - 50 שקלים פעם ביום לכל שכונה שאתם חלק ממנה.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏬 קניון אזריאלי</h2>
          <p>לחצו על בניין אזריאלי במפה כדי לפתוח את החנות. ניתן לרכוש פריטים שונים כמו פרחים, אופניים, מחשב ועוד.</p>
          <p>ניתן למכור פריטים בכנסת 🏛️, ולשלוח פריטים לשחקנים אחרים דרך חלון ההודעות.</p>
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
            <li><strong>יד שרה</strong> - תרומה לצדקה.</li>
            <li><strong>טריוויה</strong> - שאלות ידע כללי לזכיה במטבעות.</li>
            <li><strong>מצעד העשירים</strong> - טבלת מובילים.</li>
            <li><strong>מצלמה</strong> - צלמו את עצמכם ושתפו עם כולם.</li>
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
