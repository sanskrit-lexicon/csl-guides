// "Your name in Devanagari" — beginner lead-magnet widget (H312). Converts Latin
// input (typed IAST, diacritics optional) to Devanagari + SLP1 live, using the
// vendored sanskrit-util transcoder (src/vendor/) — never a hand-rolled table.
// Client-only (canvas export, localStorage) — safe to import into SSR pages.
import React, {useMemo, useState, useRef} from 'react';
import {to_slp1, slp1_to_devanagari} from '@site/src/vendor/sanskrit-util.js';
import styles from './Transliterator.module.css';

const DIACRITICS = ['ā', 'ī', 'ū', 'ṛ', 'ṝ', 'ḷ', 'ḹ', 'ṃ', 'ḥ', 'ṅ', 'ñ', 'ṭ', 'ḍ', 'ṇ', 'ś', 'ṣ'];

const TIPS = {
  en: [
    'Devanagari is an *abugida* — each consonant letter carries an inherent "a" sound unless another vowel sign is attached.',
    'Long vowels (ā, ī, ū) are held for roughly twice the duration of their short counterparts (a, i, u) — the length is meaningful, not decorative.',
    'Consonant clusters often merge into a single conjunct glyph (a *ligature*) rather than sitting side by side.',
    'The retroflex consonants (ṭ, ḍ, ṇ, ṣ) are made with the tongue curled back — English has no equivalent sound.',
    'Sanskrit has no capital letters — a proper name looks exactly like any other word in Devanagari.',
  ],
  ru: [
    'Деванагари — это *абугида*: каждая согласная буква несёт гласный звук «а» по умолчанию, если не добавлен другой гласный знак.',
    'Долгие гласные (ā, ī, ū) произносятся примерно вдвое дольше кратких (a, i, u) — долгота значима, а не декоративна.',
    'Стечения согласных часто сливаются в один составной знак (лигатуру), а не пишутся раздельно.',
    'Ретрофлексные согласные (ṭ, ḍ, ṇ, ṣ) произносятся с загнутым назад кончиком языка — в русском такого звука нет.',
    'В деванагари нет заглавных букв — имя собственное выглядит так же, как любое другое слово.',
  ],
};

const STRINGS = {
  en: {
    label: 'Type your name (or any word)',
    placeholder: 'e.g. Maria, ram, krishna…',
    deva: 'Devanagari',
    iast: 'IAST',
    slp1: 'SLP1',
    diacriticsHint: 'Add precision with these marks (inserted at your cursor):',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download as image',
    emailLabel: 'Get your Devanagari name card by email, plus a free beginner guide',
    emailPlaceholder: 'you@example.com',
    emailButton: 'Send it to me',
    emailThanks: "Thanks — you're on the list. Check your inbox soon.",
    empty: 'Start typing to see it appear…',
  },
  ru: {
    label: 'Введите своё имя (или любое слово)',
    placeholder: 'например, Мария, ram, krishna…',
    deva: 'Деванагари',
    iast: 'IAST',
    slp1: 'SLP1',
    diacriticsHint: 'Добавьте точность этими значками (вставляются в позицию курсора):',
    copy: 'Копировать',
    copied: 'Скопировано!',
    download: 'Скачать как изображение',
    emailLabel: 'Получите карточку с именем на деванагари по почте + бесплатный гид для новичков',
    emailPlaceholder: 'you@example.com',
    emailButton: 'Отправить мне',
    emailThanks: 'Спасибо — вы в списке. Скоро проверьте почту.',
    empty: 'Начните печатать, чтобы увидеть результат…',
  },
};

const CAPTURE_STORAGE_KEY = 'csl-guides-translit-lead-capture';

// Stub capture: stores the email + the word tried, locally only. Wiring to a
// real ESP/list is gated on the @DECIDE items in H312 (which storefront, which
// list) — this keeps the tool fully usable and testable standalone until then.
function stubCaptureEmail(email, word) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(CAPTURE_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({email, word, capturedAt: new Date().toISOString()});
    window.localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // best-effort only — never block the tool on storage failures
  }
}

function tipFor(text, locale) {
  const tips = TIPS[locale] || TIPS.en;
  const idx = text.length === 0 ? 0 : text.length % tips.length;
  return tips[idx];
}

async function copyToClipboard(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadDevanagariImage(devanagari, latin) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#fdf6ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.font = '160px "Noto Sans Devanagari", "Segoe UI", sans-serif';
  ctx.fillText(devanagari || '?', canvas.width / 2, 340, canvas.width - 80);

  ctx.font = '38px "Segoe UI", sans-serif';
  ctx.fillStyle = '#555555';
  ctx.fillText(latin, canvas.width / 2, 430, canvas.width - 80);

  ctx.font = '24px "Segoe UI", sans-serif';
  ctx.fillStyle = '#8a7a5c';
  ctx.fillText('sanskrit-lexicon.uni-koeln.de', canvas.width / 2, 560);

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(latin || 'devanagari').replace(/\s+/g, '-').toLowerCase()}-devanagari.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function Transliterator({locale = 'en'}) {
  const t = STRINGS[locale] || STRINGS.en;
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  const slp1 = useMemo(() => (text ? to_slp1(text) : ''), [text]);
  // slp1_to_devanagari is the abugida-correct path (consonant + mātrā/virāma);
  // the package's iast_to_devanagari is a naive per-letter substitute and
  // renders vowels as standalone signs instead of joining them to the
  // preceding consonant — wrong for anything but bare vowels (verified: it
  // turns "rāma" into "रआमअ" instead of "राम").
  const devanagari = useMemo(() => (slp1 ? slp1_to_devanagari(slp1) : ''), [slp1]);
  const tip = useMemo(() => tipFor(text, locale), [text, locale]);

  function insertDiacritic(mark) {
    const el = inputRef.current;
    if (!el) {
      setText((prev) => prev + mark);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + mark + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + mark.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleCopy() {
    const ok = await copyToClipboard(devanagari);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email) return;
    stubCaptureEmail(email, text);
    setSubmitted(true);
  }

  return (
    <div className={styles.widget}>
      <label className={styles.label} htmlFor="translit-input">
        {t.label}
      </label>
      <input
        id="translit-input"
        ref={inputRef}
        className={styles.input}
        type="text"
        value={text}
        placeholder={t.placeholder}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />

      <div className={styles.diacritics}>
        <span className={styles.diacriticsHint}>{t.diacriticsHint}</span>
        <div className={styles.diacriticButtons}>
          {DIACRITICS.map((d) => (
            <button
              key={d}
              type="button"
              className={styles.diacriticButton}
              onClick={() => insertDiacritic(d)}
              aria-label={`insert ${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.result}>
        <div className={styles.devaBlock}>
          <span className={styles.resultLabel}>{t.deva}</span>
          <div className={styles.devaText} lang="sa">
            {devanagari || <span className={styles.placeholder}>{t.empty}</span>}
          </div>
        </div>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.resultLabel}>{t.iast}</span>
            <code className={styles.code}>{text || '—'}</code>
          </div>
          <div className={styles.row}>
            <span className={styles.resultLabel}>{t.slp1}</span>
            <code className={styles.code}>{slp1 || '—'}</code>
          </div>
        </div>
      </div>

      {text && (
        <>
          <div className={styles.actions}>
            <button type="button" className={styles.actionButton} onClick={handleCopy}>
              {copied ? t.copied : t.copy}
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => downloadDevanagariImage(devanagari, text)}
            >
              {t.download}
            </button>
          </div>
          <p className={styles.tip}>{tip}</p>
        </>
      )}

      <form className={styles.capture} onSubmit={handleEmailSubmit}>
        {submitted ? (
          <p className={styles.thanks}>{t.emailThanks}</p>
        ) : (
          <>
            <label className={styles.captureLabel} htmlFor="translit-email">
              {t.emailLabel}
            </label>
            <div className={styles.captureRow}>
              <input
                id="translit-email"
                className={styles.captureInput}
                type="email"
                required
                value={email}
                placeholder={t.emailPlaceholder}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className={styles.captureButton}>
                {t.emailButton}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
