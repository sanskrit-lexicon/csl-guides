import React, {useEffect, useState} from 'react';
import mwQuiz from '@site/src/data/mw-quiz.json';
import styles from './Quiz.module.css';

// Renders a quiz dataset as self-contained, no-JS-required practice cards: each
// question's answer lives in a native <details>/<summary> so it works server-side-
// rendered and is keyboard accessible (matches the site's a11y posture — see .ai_state.md).
// Usage in any .mdx page:
//   import Quiz from '@site/src/components/Quiz';
//   <Quiz lesson={12} />                          // MW quiz, one Wikner lesson
//   <Quiz lesson={12} types={['lookup']} />       // filter by type
//   import translit from '@site/src/data/translit-quiz.json';
//   <Quiz data={translit} group="convert" />      // a different dataset, filtered by group
//
// Props:
//   data    — a quiz dataset object ({questions:[…]}); defaults to the MW quiz.
//   lesson  — number | number[]; filter to Wikner lesson(s) (MW quiz only).
//   group   — string | string[]; filter to question group(s) (datasets that use `group`).
//   types   — string[]; filter to question types
//             ('concept' | 'multiple-choice' | 'lookup' | 'trace-to-dhatu' | 'convert').
//   title   — optional heading rendered above the cards.
//
// Opt-in telemetry (GH-5, docs/about/guides-hypotheses.md): client-side only, off by
// default. When a reader flips the toggle, multiple-choice questions switch from the
// no-JS <details> reveal to a click-an-option interactive mode that records
// {itemId, correct, attempts} counters in localStorage — never sent anywhere. All
// item types keep the plain <details> reveal when telemetry is off.

const TELEMETRY_OPTIN_KEY = 'csl-guides-quiz-telemetry-optin';
const TELEMETRY_STATS_KEY = 'csl-guides-quiz-stats-v1';
const TELEMETRY_EVENT = 'csl-guides-quiz-telemetry-change';

function loadTelemetryOptIn() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(TELEMETRY_OPTIN_KEY) === '1';
}

function saveTelemetryOptIn(on) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TELEMETRY_OPTIN_KEY, on ? '1' : '0');
  window.dispatchEvent(new Event(TELEMETRY_EVENT));
}

function loadQuizStats() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(TELEMETRY_STATS_KEY) || '{}');
  } catch {
    return {};
  }
}

function recordQuizAnswer({quizTitle, item, correct}) {
  if (typeof window === 'undefined') return;
  const stats = loadQuizStats();
  const prev = stats[item.id] || {attempts: 0, correct: 0};
  stats[item.id] = {
    quizTitle,
    difficulty: item.difficulty || null,
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
  };
  window.localStorage.setItem(TELEMETRY_STATS_KEY, JSON.stringify(stats));
}

function exportQuizStats() {
  if (typeof window === 'undefined') return;
  const stats = loadQuizStats();
  const items = Object.entries(stats).map(([itemId, s]) => ({itemId, ...s}));
  const payload = {exportedAt: new Date().toISOString(), items};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'csl-guides-quiz-stats.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const TYPE_LABELS = {
  concept: 'Concept',
  'multiple-choice': 'Multiple choice',
  lookup: 'Lookup',
  'trace-to-dhatu': 'Trace to dhātu',
  convert: 'Convert',
};

function AnswerBody({q}) {
  if (q.type === 'lookup') {
    const c = q.cdsl;
    return (
      <>
        MW <strong>{q.printRef || q.answer}</strong>
        {c && (
          <>
            {' · '}
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              CDSL entry #{c.entryId}
            </a>{' '}
            <span className={styles.slp1}>({c.slp1})</span>
          </>
        )}
        {q.note ? ` — ${q.note}` : ''}
      </>
    );
  }
  if (q.type === 'trace-to-dhatu') {
    const a = q.answer;
    const refs = a.dhatuRefs || [];
    return (
      <>
        {refs.length > 0 ? (
          refs.map((r, i) => (
            <React.Fragment key={r.entryId}>
              {i > 0 && ' + '}
              √{r.dhatuIast} (
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                CDSL #{r.entryId}
              </a>
              {`, MW ${r.page}`})
            </React.Fragment>
          ))
        ) : (
          <>√{a.dhatuIast || a.dhatu} (MW {a.mw})</>
        )}{' '}
        — {a.rootMeaning}. <em>Analysis:</em> {a.analysis}
      </>
    );
  }
  if (q.type === 'convert') {
    return (
      <>
        <code className={styles.answerCode}>{q.answer}</code>
        {q.note ? ` — ${q.note}` : ''}
      </>
    );
  }
  if (q.type === 'multiple-choice') {
    return <>{q.explanation ? `${q.answer}.  ${q.explanation}` : q.answer}</>;
  }
  return <>{q.answer}</>;
}

function TelemetryControls({telemetryOn, onToggle}) {
  return (
    <div className={styles.telemetry}>
      <label className={styles.telemetryToggle}>
        <input
          type="checkbox"
          checked={telemetryOn}
          onChange={(e) => onToggle(e.target.checked)}
        />
        Track my answers on multiple-choice questions (helps calibrate difficulty labels)
      </label>
      <p className={styles.telemetryNote}>
        Stored only in this browser's <code>localStorage</code> — never sent anywhere.
        Turn this off any time to go back to the plain reveal-only quiz.
      </p>
      {telemetryOn && (
        <button type="button" className={styles.exportButton} onClick={exportQuizStats}>
          Download my quiz stats
        </button>
      )}
    </div>
  );
}

function QuestionCard({q, quizTitle, telemetryOn}) {
  const [chosen, setChosen] = useState(null);
  const interactive = telemetryOn && q.type === 'multiple-choice';

  const prompt =
    q.question ||
    (q.type === 'lookup'
      ? `${q.prompt}  →  ${q.iast || q.word}`
      : `${q.prompt}  →  ${q.iast || q.word}${q.gloss ? ` (“${q.gloss}”)` : ''}`);
  const chip = q.section ? `§${q.section}` : q.group;

  function handleChoose(opt) {
    if (chosen != null) return;
    setChosen(opt);
    recordQuizAnswer({quizTitle, item: q, correct: opt === q.answer});
  }

  return (
    <li className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.badge}>{TYPE_LABELS[q.type] || q.type}</span>
        {chip && <span className={styles.section}>{chip}</span>}
        {q.difficulty && <span className={styles.difficulty}>{q.difficulty}</span>}
      </div>
      <p className={styles.prompt}>{prompt}</p>
      {q.type === 'multiple-choice' && Array.isArray(q.options) && (
        <ul className={styles.options}>
          {q.options.map((opt) => {
            if (!interactive) {
              return <li key={opt}>{opt}</li>;
            }
            const isChosen = chosen === opt;
            const revealed = chosen != null;
            const isCorrectOpt = opt === q.answer;
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
      )}
      {interactive ? (
        chosen != null && (
          <div className={styles.answerBody}>
            <p className={styles.answerResult}>
              {chosen === q.answer ? 'Correct.' : 'Not quite.'}
            </p>
            <AnswerBody q={q} />
          </div>
        )
      ) : (
        <details className={styles.answer}>
          <summary>Show answer</summary>
          <div className={styles.answerBody}>
            <AnswerBody q={q} />
          </div>
        </details>
      )}
    </li>
  );
}

export default function Quiz({data, lesson, group, types, title}) {
  const quiz = data || mwQuiz;
  const [telemetryOn, setTelemetryOn] = useState(false);

  useEffect(() => {
    setTelemetryOn(loadTelemetryOptIn());
    const handler = () => setTelemetryOn(loadTelemetryOptIn());
    window.addEventListener(TELEMETRY_EVENT, handler);
    return () => window.removeEventListener(TELEMETRY_EVENT, handler);
  }, []);

  function handleToggle(on) {
    saveTelemetryOptIn(on);
    setTelemetryOn(on);
  }

  const lessons = lesson == null ? null : Array.isArray(lesson) ? lesson : [lesson];
  const groups = group == null ? null : Array.isArray(group) ? group : [group];
  const items = quiz.questions.filter(
    (q) =>
      (lessons == null || lessons.includes(q.lesson)) &&
      (groups == null || groups.includes(q.group)) &&
      (types == null || types.includes(q.type)),
  );

  return (
    <section className={styles.quiz}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <p className={styles.count}>
        {items.length} question{items.length === 1 ? '' : 's'}
      </p>
      <TelemetryControls telemetryOn={telemetryOn} onToggle={handleToggle} />
      <ol className={styles.list}>
        {items.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            quizTitle={quiz.title || title}
            telemetryOn={telemetryOn}
          />
        ))}
      </ol>
    </section>
  );
}
