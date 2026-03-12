"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Vault() {
    const [history, setHistory] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    const [toastMessage, setToastMessage] = useState('');
    const [undoToast, setUndoToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: null, targetIds: [] });
    const [isDesktop, setIsDesktop] = useState(false);
    const pendingDeletes = useRef(new Set());

    useEffect(() => {
        setIsDesktop(window.innerWidth > 768);
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pendingDeletes.current.size > 0) {
                const ids = Array.from(pendingDeletes.current);
                fetch('/api/urls', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids }),
                    keepalive: true
                }).catch(() => {});
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            handleBeforeUnload();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const res = await fetch('/api/urls');
                const result = await res.json();
                if (result.success) {
                    const mappedLinks = result.data.map(item => ({
                        id: item._id,
                        originalUrl: item.url,
                        shortUrl: `bytz.io/${item.shorturl}`,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    }));
                    setHistory(mappedLinks);
                }
            } catch (error) {
                console.error('Failed to load links from db', error);
            }
        };
        fetchLinks();
    }, []);

    // Copy logic
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 7000);
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            showToast('Link copied to clipboard');
            setTimeout(() => setCopiedId(null), 1500);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // Selection logic
    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const allSelected = history.length > 0 && selectedIds.length === history.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                if (history.length > 0) {
                    setSelectedIds(history.map(item => item.id));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history]);

    // Delete trigger logic
    const initiateDelete = (type, id = null) => {
        if (type === 'single') {
            setConfirmDelete({ isOpen: true, type, targetIds: [id] });
        } else if (type === 'selected') {
            setConfirmDelete({ isOpen: true, type, targetIds: selectedIds });
        } else if (type === 'all') {
            setConfirmDelete({ isOpen: true, type, targetIds: history.map(item => item.id) });
        }
    };

    // Actual execute delete
    const executeDelete = () => {
        const idsToDelete = confirmDelete.targetIds;
        const deletedItems = history.filter(item => idsToDelete.includes(item.id));
        const newHistory = history.filter(item => !idsToDelete.includes(item.id));

        setHistory(newHistory);
        setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
        setConfirmDelete({ isOpen: false, type: null, targetIds: [] });

        idsToDelete.forEach(id => pendingDeletes.current.add(id));

        if (undoToast && undoToast.timeoutId) {
            clearTimeout(undoToast.timeoutId);
        }
        
        const timeoutId = setTimeout(() => {
            const toDeleteNow = idsToDelete.filter(id => pendingDeletes.current.has(id));
            if (toDeleteNow.length > 0) {
                fetch('/api/urls', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: toDeleteNow })
                }).catch(err => console.error(err));
                
                toDeleteNow.forEach(id => pendingDeletes.current.delete(id));
            }
            setUndoToast(null);
        }, 7000);

        setUndoToast({ items: deletedItems, timeoutId });
    };

    const cancelDelete = () => {
        setConfirmDelete({ isOpen: false, type: null, targetIds: [] });
    };

    const executeUndo = () => {
        if (!undoToast) return;
        const restoredHistory = [...undoToast.items, ...history];
        
        undoToast.items.forEach(item => pendingDeletes.current.delete(item.id));

        setHistory(restoredHistory);
        clearTimeout(undoToast.timeoutId);
        setUndoToast(null);
    };

    return (
        <main className="min-h-[calc(100vh-80px)] w-full bg-[#F5E6CC] text-stone-900 font-sans p-6 md:p-10 relative">

            <div className="max-w-4xl mx-auto relative z-10">

                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-stone-300">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-700 font-semibold mb-4 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Generator
                        </Link>
                        <h1 className="text-4xl font-extrabold flex items-center gap-3 text-stone-900">
                            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                            My Vault
                        </h1>
                        <p className="text-stone-600 mt-2 font-medium">Manage and track your shortened URLs</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 relative">
                        {isDesktop && someSelected && (
                            <div className="absolute -top-10 right-0 text-xs font-semibold text-stone-500 bg-[#EAE0C8] px-3 py-1.5 rounded-lg border border-stone-300 shadow-sm whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 hidden sm:block z-20">
                                Tip: Press <kbd className="font-sans bg-[#FBF6EC] border border-stone-300 rounded px-1.5 py-0.5 text-stone-700 mx-0.5 shadow-sm">Ctrl</kbd> + <kbd className="font-sans bg-[#FBF6EC] border border-stone-300 rounded px-1.5 py-0.5 text-stone-700 mx-0.5 shadow-sm">A</kbd> to select all links
                            </div>
                        )}
                        {someSelected && (
                            <button
                                onClick={() => initiateDelete('selected')}
                                className="bg-red-900/10 text-red-700 hover:bg-red-900/20 border border-red-300 hover:border-red-400 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm w-full sm:w-auto"
                            >
                                Delete Selected ({selectedIds.length})
                            </button>
                        )}
                        {allSelected && (
                            <button
                                onClick={() => initiateDelete('all')}
                                className="bg-red-900/10 text-red-700 hover:bg-red-900/20 border border-red-300 hover:border-red-400 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm w-full sm:w-auto"
                            >
                                Delete All
                            </button>
                        )}
                        <div className="bg-[#EAE0C8] border border-stone-300 text-stone-800 font-bold px-5 py-2.5 rounded-xl shadow-sm w-full sm:w-auto text-center hidden sm:block">
                            {history.length} active links
                        </div>
                    </div>
                </header>

                <div className="grid gap-4">
                    {history.length === 0 ? (
                        <div className="bg-[#EAE0C8] border border-stone-300 rounded-2xl py-20 flex flex-col items-center justify-center text-stone-500 shadow-md">
                            <svg className="w-16 h-16 opacity-50 mb-4 text-amber-900/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            <p className="font-medium text-lg text-stone-600">Your vault is empty</p>
                            <Link href="/" className="mt-4 text-amber-700 hover:text-amber-600 font-semibold underline">Generate your first BYTZ</Link>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#EAE0C8] border border-stone-300 hover:border-amber-400 rounded-2xl p-5 md:p-6 transition-all duration-300 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4 w-full">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleSelect(item.id)}
                                        className="w-5 h-5 rounded border border-stone-400 text-amber-700 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold text-amber-800 bg-[#FBF6EC] px-3 py-1 rounded-md border border-stone-300 whitespace-nowrap hidden sm:inline-block">
                                                {item.date}
                                            </span>
                                            <h3 className="text-xl font-bold text-stone-900 truncate tracking-tight">
                                                {item.shortUrl}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-stone-500 truncate w-full transition-colors">
                                            {item.originalUrl}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => initiateDelete('single', item.id)}
                                        className="p-3 bg-red-900/5 text-red-600 hover:bg-red-900/10 border border-transparent hover:border-red-300 rounded-xl transition-colors shrink-0"
                                        title="Delete Link"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(item.shortUrl, item.id)}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm ${copiedId === item.id
                                            ? 'bg-amber-600 text-[#F5E6CC] border-transparent'
                                            : 'bg-[#FBF6EC] text-stone-700 border-stone-300 hover:border-amber-500 hover:text-amber-700'
                                            }`}
                                    >
                                        {copiedId === item.id ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                Copy Link
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Copy Toast */}
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

            {/* Undo Toast */}
            {undoToast && (
                <div className="fixed bottom-6 left-6 md:left-auto md:right-6 bg-stone-900 text-[#F5E6CC] rounded-xl shadow-2xl z-50 transition-all duration-300 overflow-hidden min-w-[300px] animate-in slide-in-from-bottom-5">
                    <div className="px-6 py-4 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span className="font-bold text-sm tracking-wide">Links deleted</span>
                        </div>
                        <button
                            onClick={executeUndo}
                            className="text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider text-xs px-3 py-1.5 rounded bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                        >
                            Undo
                        </button>
                    </div>
                    <div className="h-1 bg-stone-800 w-full">
                        <div className="h-full bg-orange-500 animate-[shrink_7s_linear_forwards]"></div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[6px] transition-all duration-300">
                    <div className="bg-[#EAE0C8] border border-stone-300 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative text-center animate-in fade-in zoom-in duration-300">
                        <div className="mb-6 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-red-100/50 border border-red-200 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Confirm Deletion</h2>
                            <p className="text-stone-600 font-medium text-sm md:text-base">
                                {confirmDelete.type === 'single' && "Are you sure you want to delete this link?"}
                                {confirmDelete.type === 'selected' && "Are you sure you want to delete these selected links?"}
                                {confirmDelete.type === 'all' && "Are you sure you want to delete all saved links?"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-5 py-3 rounded-xl font-bold transition-all duration-300 bg-[#FBF6EC] text-stone-700 border border-stone-300 hover:border-[#2D4F1E] hover:text-[#2D4F1E]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 px-5 py-3 rounded-xl font-bold transition-all duration-300 bg-red-600 text-white hover:bg-red-700 shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
