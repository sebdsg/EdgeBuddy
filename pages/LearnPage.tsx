
import React from 'react';
import { LEARN_TOPICS, GLOSSARY } from '../constants';

const LearnPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">Learn Basics</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-widest">Betting guides in plain English.</p>
      </div>

      <div className="grid gap-4">
        {LEARN_TOPICS.map((topic) => (
          <div key={topic.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 space-y-2 theme-transition">
            <h3 className="font-black text-[var(--text-main)] flex items-center uppercase tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0"></span>
              {topic.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {topic.content}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Quick Glossary</h3>
        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden theme-transition">
          {GLOSSARY.map((item, idx) => (
            <div key={idx} className={`p-4 ${idx !== GLOSSARY.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
              <div className="text-sm font-black text-blue-900 dark:text-blue-300 mb-1 uppercase tracking-widest">{item.term}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed">{item.definition}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-800 dark:to-blue-900 rounded-3xl p-6 text-white text-center space-y-3 shadow-lg">
        <h3 className="text-lg font-black uppercase tracking-widest">Gold Rule</h3>
        <p className="text-sm opacity-90 leading-relaxed italic font-bold">
          "Never bet more than you are comfortable losing. Sports should be fun first, profitable second."
        </p>
      </section>
    </div>
  );
};

export default LearnPage;
