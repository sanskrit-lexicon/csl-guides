// "What's your Sanskrit level?" — beginner lead-magnet quiz (H313). 6 items
// ramping from an akṣara-sound check to a sandhi concept, drawn from the
// committed corpus-frequency item bank (src/data/level-quiz.json, built by
// scripts/build-level-quiz.mjs). Ends in a level badge + a next-step CTA
// (per the H312 §0 funnel skeleton: free first Zoom webinar class), plus a
// soft email-capture stub matching the H312 Transliterator pattern. Reuses
// the H288 quiz telemetry rails (Quiz.js) rather than a second localStorage
// scheme, so score distribution is measurable from the same export.
import React, {useEffect, useMemo, useState} from 'react';
import levelQuiz from '@site/src/data/level-quiz.json';
import {
  loadTelemetryOptIn,
  saveTelemetryOptIn,
  recordQuizAnswer,
  TELEMETRY_EVENT,
} from './Quiz';
import styles from './LevelQuiz.module.css';

const STRINGS = {
  en: {
    title: "What's your Sanskrit level?",
    intro: `${levelQuiz.items.length} quick questions — no prior knowledge needed for question 1.`,
    telemetryLabel: 'Track my answers (helps calibrate item difficulty)',
    telemetryNote:
      "Stored only in this browser's localStorage — never sent anywhere.",
    next: 'Next',
    of: 'of',
    resultTitle: 'Your result',
    scoreLabel: (score, total) => `You got ${score} of ${total} right.`,
    retake: 'Take it again',
    emailLabel: 'Get your full result + a personalized starting plan by email',
    emailPlaceholder: 'you@example.com',
    emailButton: 'Send it to me',
    emailThanks: "Thanks — you're on the list. Check your inbox soon.",
    ctaTitle: 'Your next step',
    badges: {
      novice: {
        label: 'Curious Novice',
        blurb:
          "You're right at the start — and that's the best place to be. The script and sounds will come fast once you see them structured.",
        cta: 'Join the free first Sanskrit class (live on Zoom) to get the structure in one session.',
      },
      sounder: {
        label: 'Can Sound It Out',
        blurb:
          "You're already picking up the letters and common words. A little structure now turns that into real reading.",
        cta: 'Join the free first Sanskrit class (live on Zoom) — the natural next step from here.',
      },
      ready: {
        label: 'Ready for Grammar',
        blurb:
          'You already recognize real words and know the frequency intuition, and sandhi makes sense to you. Grammar is the next real lever.',
        cta: 'Join the free first Sanskrit class (live on Zoom), then move straight into the grammar track.',
      },
    },
  },
  ru: {
    title: 'Какой у вас уровень санскрита?',
    intro: `${levelQuiz.items.length} коротких вопросов — для первого не нужно никаких знаний.`,
    telemetryLabel: 'Отслеживать мои ответы (помогает откалибровать сложность)',
    telemetryNote: 'Хранится только в localStorage этого браузера — никуда не отправляется.',
    next: 'Далее',
    of: 'из',
    resultTitle: 'Ваш результат',
    scoreLabel: (score, total) => `Правильных ответов: ${score} из ${total}.`,
    retake: 'Пройти ещё раз',
    emailLabel: 'Получите полный результат и личный план старта по почте',
    emailPlaceholder: 'you@example.com',
    emailButton: 'Отправить мне',
    emailThanks: 'Спасибо — вы в списке. Скоро проверьте почту.',
    ctaTitle: 'Ваш следующий шаг',
    badges: {
      novice: {
        label: 'Любопытный новичок',
        blurb:
          'Вы в самом начале — и это отличная точка старта. Письмо и звуки быстро уложатся в голове, как только появится структура.',
        cta: 'Присоединяйтесь к бесплатному первому уроку санскрита (на Zoom), чтобы получить эту структуру за одно занятие.',
      },
      sounder: {
        label: 'Умеет читать по слогам',
        blurb: 'Вы уже узнаёте буквы и частые слова. Немного структуры — и это превратится в настоящее чтение.',
        cta: 'Присоединяйтесь к бесплатному первому уроку санскрита (на Zoom) — логичный следующий шаг.',
      },
      ready: {
        label: 'Готов к грамматике',
        blurb:
          'Вы уже узнаёте настоящие слова, чувствуете частотность и понимаете сандхи. Грамматика — следующий реальный рычаг роста.',
        cta: 'Присоединяйтесь к бесплатному первому уроку санскрита (на Zoom), а затем сразу в курс грамматики.',
      },
    },
  },
};

const CAPTURE_STORAGE_KEY = 'csl-guides-level-quiz-lead-capture';

// Stub capture: same pattern as Transliterator.js (H312) — local-only until
// the ESP/list @DECIDE items land (see H312 §0 funnel skeleton).
function stubCaptureEmail(email, score, total, badgeKey) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(CAPTURE_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({email, score, total, badgeKey, capturedAt: new Date().toISOString()});
    window.localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // best-effort only — never block the quiz on storage failures
  }
}

function badgeFor(score, total) {
  const pct = score / total;
  if (pct <= 1 / 3) return 'novice';
  if (pct <= 2 / 3) return 'sounder';
  return 'ready';
}

export default function LevelQuiz({locale = 'en'}) {
  const t = STRINGS[locale] || STRINGS.en;
  const items = levelQuiz.items;
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [telemetryOn, setTelemetryOn] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setTelemetryOn(loadTelemetryOptIn());
    const handler = () => setTelemetryOn(loadTelemetryOptIn());
    window.addEventListener(TELEMETRY_EVENT, handler);
    return () => window.removeEventListener(TELEMETRY_EVENT, handler);
  }, []);

  const item = items[index];
  const localized = item ? item[locale] || item.en : null;
  const done = index >= items.length;
  const score = useMemo(() => answers.filter(Boolean).length, [answers]);
  const badgeKey = done ? badgeFor(score, items.length) : null;

  function handleToggleTelemetry(on) {
    saveTelemetryOptIn(on);
    setTelemetryOn(on);
  }

  function handleChoose(opt) {
    if (chosen != null) return;
    setChosen(opt);
    const correct = opt === localized.answer;
    if (telemetryOn) {
      recordQuizAnswer({
        quizTitle: t.title,
        item: {id: item.id, difficulty: item.difficulty},
        correct,
      });
    }
    setAnswers((prev) => [...prev, correct]);
  }

  function handleNext() {
    setChosen(null);
    setIndex((i) => i + 1);
  }

  function handleRetake() {
    setIndex(0);
    setChosen(null);
    setAnswers([]);
    setSubmitted(false);
    setEmail('');
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email) return;
    stubCaptureEmail(email, score, items.length, badgeKey);
    setSubmitted(true);
  }

  if (done) {
    const badge = t.badges[badgeKey];
    return (
      <div className={styles.widget}>
        <h3 className={styles.resultTitle}>{t.resultTitle}</h3>
        <p className={styles.scoreLine}>{t.scoreLabel(score, items.length)}</p>
        <div className={styles.badge}>
          <span className={styles.badgeLabel}>{badge.label}</span>
          <p className={styles.badgeBlurb}>{badge.blurb}</p>
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaTitle}>{t.ctaTitle}</p>
          <p className={styles.ctaText}>{badge.cta}</p>
        </div>

        <form className={styles.capture} onSubmit={handleEmailSubmit}>
          {submitted ? (
            <p className={styles.thanks}>{t.emailThanks}</p>
          ) : (
            <>
              <label className={styles.captureLabel} htmlFor="level-quiz-email">
                {t.emailLabel}
              </label>
              <div className={styles.captureRow}>
                <input
                  id="level-quiz-email"
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

        <button type="button" className={styles.retakeButton} onClick={handleRetake}>
          {t.retake}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{t.title}</h3>
      <p className={styles.intro}>{t.intro}</p>

      <label className={styles.telemetryToggle}>
        <input
          type="checkbox"
          checked={telemetryOn}
          onChange={(e) => handleToggleTelemetry(e.target.checked)}
        />
        {t.telemetryLabel}
      </label>
      <p className={styles.telemetryNote}>{t.telemetryNote}</p>

      <p className={styles.progress}>
        {index + 1} {t.of} {items.length}
      </p>

      <p className={styles.question}>{localized.question}</p>

      <ul className={styles.options}>
        {localized.options.map((opt) => {
          const isChosen = chosen === opt;
          const revealed = chosen != null;
          const isCorrectOpt = opt === localized.answer;
          const cls = [
            styles.optionButton,
            revealed && isCorrectOpt ? styles.optionCorrect : '',
            revealed && isChosen && !isCorrectOpt ? styles.optionIncorrect : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={opt}>
              <button
                type="button"
                className={cls}
                disabled={revealed}
                aria-pressed={isChosen}
                onClick={() => handleChoose(opt)}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {chosen != null && (
        <button type="button" className={styles.nextButton} onClick={handleNext}>
          {t.next}
        </button>
      )}
    </div>
  );
}
