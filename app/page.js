"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isCopiedGen, setIsCopiedGen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let interval;
    if (generatedLink) {
      setCountdown(10);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setGeneratedLink(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && generatedLink) {
        setGeneratedLink(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [generatedLink]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 7000);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!longUrl) return;
    setIsGenerating(true);
    setGeneratedLink(null);
    setIsCopiedGen(false);

    setTimeout(() => {
      const finalAlias = alias || Math.random().toString(36).substring(2, 8);
      const newShortLink = `bytz.io/${finalAlias}`;

      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        originalUrl: longUrl,
        shortUrl: newShortLink,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      try {
        const existingStr = localStorage.getItem('bytz_links');
        const existingLinks = existingStr ? JSON.parse(existingStr) : [];
        localStorage.setItem('bytz_links', JSON.stringify([newHistoryItem, ...existingLinks]));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }

      setGeneratedLink(newShortLink);
      setLongUrl('');
      setAlias('');
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopiedGen(true);
      showToast('Link copied to clipboard!');
      setTimeout(() => setIsCopiedGen(false), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <main className="h-[calc(100vh-80px)] w-full bg-[#F5E6CC] flex flex-col items-center justify-center p-4 md:p-6 text-stone-900 overflow-hidden font-sans relative">

      <div className="w-full max-w-xl relative flex flex-col items-center space-y-6 md:space-y-8">

        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Link with Elegance.
          </h1>
          <p className="text-base md:text-lg text-stone-600 max-w-md mx-auto font-medium">
            Forge short, powerful BYTZ URLs instantly in a clean, minimalist space.
          </p>
        </div>

        <div className="w-full bg-[#EAE0C8] p-5 md:p-7 rounded-2xl border border-stone-300 shadow-[0_20px_50px_rgba(45,79,30,0.15)] relative">

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-widest pl-1">
                Destination URL
              </label>
              <div className="relative group">
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://your-very-long-url.com/something-here"
                  required
                  className="w-full bg-[#FBF6EC] border border-stone-300 focus:border-[#2D4F1E] text-stone-900 rounded-xl px-4 py-3 outline-none transition-all shadow-inner placeholder:text-stone-400 focus:ring-1 focus:ring-[#2D4F1E]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-widest pl-1">
                Custom Alias <span className="text-stone-500 font-normal normal-case">(Optional)</span>
              </label>
              <div className="flex shadow-inner rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#2D4F1E] transition-all border border-stone-300">
                <span className="flex items-center px-4 bg-[#EAE0C8] border-r border-stone-300 text-stone-700 font-medium">
                  bytz.io/
                </span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="custom-link"
                  className="flex-1 bg-[#FBF6EC] text-stone-900 px-4 py-3 outline-none transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 bg-[#2D4F1E] text-[#F5E6CC] font-bold text-base rounded-xl hover:bg-[#1A3011] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 border border-[#1A3011]"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#F5E6CC]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Forging...
                </>
              ) : (
                'Generate BYTZ'
              )}
            </button>
          </form>
        </div>

        <Link href="/vault" className="group flex items-center gap-2 text-stone-600 hover:text-[#2D4F1E] transition-colors duration-300 mt-2 bg-[#EAE0C8] px-5 py-2.5 rounded-full border border-stone-300 hover:border-[#2D4F1E]">
          <span className="font-semibold text-sm">View link history in the Vault</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </Link>
      </div>

      {generatedLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[6px] transition-all duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setGeneratedLink(null); }}
        >
          <div className="relative w-full max-w-lg bg-[#EAE0C8] border-2 border-stone-300 rounded-2xl p-6 md:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] text-center animate-in fade-in zoom-in duration-300 overflow-hidden">

            {/* Animated SVG Border Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              preserveAspectRatio="none"
            >
              <rect
                x="0" y="0"
                width="100%" height="100%"
                rx="16"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="8"
                strokeDasharray="100"
                strokeDashoffset="0"
                pathLength="100"
                className="animate-[border-draw_10s_linear_forwards]"
              />
            </svg>

            {/* Modal Content */}
            <div className="relative z-10">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Your BYTZ Link is Ready</h2>
                <p className="text-sm text-stone-500">Your shortened URL has been successfully forged.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FBF6EC] p-3 rounded-xl shadow-inner mb-8 border border-stone-300">
                <p className="text-xl font-bold text-[#2D4F1E] truncate px-3">{generatedLink}</p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => copyToClipboard(generatedLink)}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm text-sm ${isCopiedGen ? 'bg-[#2D4F1E] text-[#F5E6CC] border-transparent' : 'bg-[#EAE0C8] text-stone-800 border-2 border-transparent hover:border-[#2D4F1E] hover:text-[#2D4F1E]'}`}
                  >
                    {isCopiedGen ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy
                      </>
                    )}
                  </button>
                  <a
                    href={`https://${generatedLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm text-sm bg-[#EAE0C8] text-stone-800 border-2 border-transparent hover:border-[#2D4F1E] hover:text-[#2D4F1E]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Open
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-stone-300/50">
                <p className="text-sm text-stone-500 font-medium">Closing in {countdown}s...</p>
                <button
                  onClick={() => setGeneratedLink(null)}
                  className="text-sm text-stone-500 hover:text-stone-800 font-bold transition-colors z-30 relative"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#2D4F1E] text-[#F5E6CC] rounded-xl shadow-[0_10px_30px_rgba(45,79,30,0.5)] z-50 transition-all duration-300 overflow-hidden min-w-[300px] animate-in slide-in-from-bottom-5">
          <div className="px-6 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="font-bold">{toastMessage}</span>
          </div>
          <div className="h-1 bg-[#1A3011] w-full">
            <div className="h-full bg-emerald-400 animate-[shrink_7s_linear_forwards]"></div>
          </div>
        </div>
      )}
    </main>
  );
}
