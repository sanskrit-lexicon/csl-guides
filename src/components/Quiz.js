import React from 'react';
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

function QuestionCard({q}) {
  const prompt =
    q.question ||
    (q.type === 'lookup'
      ? `${q.prompt}  →  ${q.iast || q.word}`
      : `${q.prompt}  →  ${q.iast || q.word}${q.gloss ? ` (“${q.gloss}”)` : ''}`);
  const chip = q.section ? `§${q.section}` : q.group;

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
          {q.options.map((opt) => (
            <li key={opt}>{opt}</li>
          ))}
        </ul>
      )}
      <details className={styles.answer}>
        <summary>Show answer</summary>
        <div className={styles.answerBody}>
          <AnswerBody q={q} />
        </div>
      </details>
    </li>
  );
}

export default function Quiz({data, lesson, group, types, title}) {
  const quiz = data || mwQuiz;
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
      <ol className={styles.list}>
        {items.map((q) => (
          <QuestionCard key={q.id} q={q} />
        ))}
      </ol>
    </section>
  );
}
