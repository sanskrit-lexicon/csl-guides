// Beginner lead-magnet #4: the "flashcard streak" word game (H315). Reveal a
// Devanagari word drawn from frequency-ranked headwords, guess its meaning
// (multiple choice), build a streak. Fun first, capture second — no hard
// pitch (see the H312 §0 funnel skeleton: this LM's job is retention +
// warmth, not a direct sell). Reuses the H288 quiz telemetry rails (Quiz.js)
// rather than a third localStorage scheme.
import React, {useEffect, useMemo, useState} from 'react';
import wordGame from '@site/src/data/word-game.json';
import {
  loadTelemetryOptIn,
  saveTelemetryOptIn,
  recordQuizAnswer,
  TELEMETRY_EVENT,
} from './Quiz';
import styles from './WordGame.module.css';

const STREAK_STORAGE_KEY = 'csl-guides-word-game-best-streak';
const CAPTURE_STORAGE_KEY = 'csl-guides-word-game-lead-capture';
const SHARE_MILESTONES = [5, 10, 20, 50];

const STRINGS = {
  en: {
    title: 'Sanskrit Word Game',
    intro: 'What does this word mean? Guess right to build your streak.',
    telemetryLabel: 'Track my answers (helps calibrate word difficulty)',
    telemetryNote: "Stored only in this browser's localStorage — never sent anywhere.",
    question: 'What does this word mean?',
    streak: 'Streak',
    best: 'Best',
    correct: 'Right!',
    wrong: (correctText) => `Not quite — it means "${correctText}".`,
    next: 'Next word',
    shareTitle: (n) => `${n}-word streak!`,
    shareBody: (n) =>
      `I just got a ${n}-word streak on the Sanskrit word game — try it: `,
    shareCopy: 'Copy to share',
    shareCopied: 'Copied!',
    emailLabel: 'Get a free daily word by email + a beginner guide',
    emailPlaceholder: 'you@example.com',
    emailButton: 'Send it to me',
    emailThanks: "Thanks — you're on the list. Check your inbox soon.",
    sourceNote: 'Words are drawn from real frequency-ranked Sanskrit vocabulary, meanings verified against the Monier-Williams dictionary.',
  },
  ru: {
    title: 'Санскритская игра со словами',
    intro: 'Что означает это слово? Угадайте правильно, чтобы нарастить серию.',
    telemetryLabel: 'Отслеживать мои ответы (помогает откалибровать сложность)',
    telemetryNote: 'Хранится только в localStorage этого браузера — никуда не отправляется.',
    question: 'Что означает это слово?',
    streak: 'Серия',
    best: 'Рекорд',
    correct: 'Верно!',
    wrong: (correctText) => `Не совсем — это значит «${correctText}».`,
    next: 'Следующее слово',
    shareTitle: (n) => `Серия из ${n} слов!`,
    shareBody: (n) => `Я набрал серию из ${n} слов в санскритской игре со словами — попробуйте: `,
    shareCopy: 'Скопировать, чтобы поделиться',
    shareCopied: 'Скопировано!',
    emailLabel: 'Получайте бесплатное слово дня по почте + гид для новичков',
    emailPlaceholder: 'you@example.com',
    emailButton: 'Отправить мне',
    emailThanks: 'Спасибо — вы в списке. Скоро проверьте почту.',
    sourceNote: 'Слова взяты из реальной частотной санскритской лексики, значения сверены со словарём Монье-Вильямса.',
  },
};

function stubCaptureEmail(email, bestStreak) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(CAPTURE_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({email, bestStreak, capturedAt: new Date().toISOString()});
    window.localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // best-effort only — never block the game on storage failures
  }
}

function loadBestStreak() {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

function saveBestStreak(n) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STREAK_STORAGE_KEY, String(n));
}

// Fisher-Yates — client-side gameplay shuffle, not a build-time artifact.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The first EASY_FIRST words are pinned to the front of every deck (near-
// guaranteed wins before the harder words), then the remainder is shuffled.
function buildDeck() {
  const easySet = new Set(wordGame.easyFirst);
  const easy = wordGame.easyFirst
    .map((slp1) => wordGame.words.find((w) => w.slp1 === slp1))
    .filter(Boolean);
  const rest = shuffle(wordGame.words.filter((w) => !easySet.has(w.slp1)));
  return [...easy, ...rest];
}

function optionsFor(word, locale) {
  const others = wordGame.words.filter((w) => w.slp1 !== word.slp1);
  const distractors = shuffle(others)
    .slice(0, 3)
    .map((w) => w.gloss[locale] || w.gloss.en);
  return shuffle([word.gloss[locale] || word.gloss.en, ...distractors]);
}

export default function WordGame({locale = 'en'}) {
  const t = STRINGS[locale] || STRINGS.en;
  const [deck, setDeck] = useState(() => buildDeck());
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [telemetryOn, setTelemetryOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setBestStreak(loadBestStreak());
    setTelemetryOn(loadTelemetryOptIn());
    const handler = () => setTelemetryOn(loadTelemetryOptIn());
    window.addEventListener(TELEMETRY_EVENT, handler);
    return () => window.removeEventListener(TELEMETRY_EVENT, handler);
  }, []);

  const word = deck[index % deck.length];
  const options = useMemo(() => optionsFor(word, locale), [word, locale]);
  const correctGloss = word.gloss[locale] || word.gloss.en;
  const milestoneHit = SHARE_MILESTONES.includes(streak);

  function handleToggleTelemetry(on) {
    saveTelemetryOptIn(on);
    setTelemetryOn(on);
  }

  function handleChoose(opt) {
    if (chosen != null) return;
    setChosen(opt);
    const correct = opt === correctGloss;
    if (telemetryOn) {
      recordQuizAnswer({quizTitle: t.title, item: {id: word.slp1, difficulty: word.rank}, correct});
    }
    if (correct) {
      const next = streak + 1;
      setStreak(next);
      if (next > bestStreak) {
        setBestStreak(next);
        saveBestStreak(next);
      }
    } else {
      setStreak(0);
    }
  }

  function handleNext() {
    setChosen(null);
    setCopied(false);
    setIndex((i) => {
      const nextIndex = i + 1;
      // Reshuffle a fresh deck once the current one is exhausted, so a long
      // streak never just replays the same fixed order.
      if (nextIndex % deck.length === 0) setDeck(buildDeck());
      return nextIndex;
    });
  }

  async function handleShareCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const text = t.shareBody(streak) + (typeof window !== 'undefined' ? window.location.href : '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort only
    }
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email) return;
    stubCaptureEmail(email, bestStreak);
    setSubmitted(true);
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{t.title}</h3>
      <p className={styles.intro}>{t.intro}</p>

      <label className={styles.telemetryToggle}>
        <input type="checkbox" checked={telemetryOn} onChange={(e) => handleToggleTelemetry(e.target.checked)} />
        {t.telemetryLabel}
      </label>
      <p className={styles.telemetryNote}>{t.telemetryNote}</p>

      <div className={styles.streakRow}>
        <span className={styles.streakBadge}>
          {t.streak}: <strong>{streak}</strong>
        </span>
        <span className={styles.streakBadgeMuted}>
          {t.best}: {bestStreak}
        </span>
      </div>

      <div className={styles.card}>
        <div className={styles.devaText} lang="sa">
          {word.devanagari}
        </div>
        <code className={styles.iastText}>{word.iast}</code>
      </div>

      <p className={styles.question}>{t.question}</p>

      <ul className={styles.options}>
        {options.map((opt) => {
          const isChosen = chosen === opt;
          const revealed = chosen != null;
          const isCorrectOpt = opt === correctGloss;
          const cls = [
            styles.optionButton,
            revealed && isCorrectOpt ? styles.optionCorrect : '',
            revealed && isChosen && !isCorrectOpt ? styles.optionIncorrect : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={opt}>
              <button type="button" className={cls} disabled={revealed} aria-pressed={isChosen} onClick={() => handleChoose(opt)}>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {chosen != null && (
        <>
          <p className={chosen === correctGloss ? styles.feedbackCorrect : styles.feedbackWrong}>
            {chosen === correctGloss ? t.correct : t.wrong(correctGloss)}
          </p>
          <button type="button" className={styles.nextButton} onClick={handleNext}>
            {t.next}
          </button>
        </>
      )}

      {milestoneHit && chosen == null && (
        <div className={styles.share}>
          <p className={styles.shareTitle}>{t.shareTitle(streak)}</p>
          <button type="button" className={styles.shareButton} onClick={handleShareCopy}>
            {copied ? t.shareCopied : t.shareCopy}
          </button>

          <form className={styles.capture} onSubmit={handleEmailSubmit}>
            {submitted ? (
              <p className={styles.thanks}>{t.emailThanks}</p>
            ) : (
              <>
                <label className={styles.captureLabel} htmlFor="word-game-email">
                  {t.emailLabel}
                </label>
                <div className={styles.captureRow}>
                  <input
                    id="word-game-email"
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
      )}

      <p className={styles.sourceNote}>{t.sourceNote}</p>
    </div>
  );
}
