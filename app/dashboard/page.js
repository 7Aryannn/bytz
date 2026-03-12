"use client";

import React, { useState } from 'react';

export default function Dashboard() {
    const [links, setLinks] = useState([]);
    const [selectedLink, setSelectedLink] = useState(null);

    const usageCount = links.length;
    const usageLimit = 100;

    const [longUrl, setLongUrl] = useState('');
    const [alias, setAlias] = useState('');
    const [aliasError, setAliasError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUrl, setEditUrl] = useState('');
    const [linkToEdit, setLinkToEdit] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState(null);

    React.useEffect(() => {
        const fetchLinks = async () => {
            try {
                const res = await fetch('/api/urls');
                const result = await res.json();
                if (result.success) {
                    const formattedLinks = result.data.map(item => ({
                        id: item._id,
                        originalUrl: item.url,
                        shortUrl: `bytz.io/${item.shorturl}`,
                        alias: item.shorturl,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        clicks: 0,
                        countries: [],
                        devices: []
                    }));
                    setLinks(formattedLinks);
                    if (formattedLinks.length > 0) {
                        setSelectedLink(formattedLinks[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch links:', error);
            }
        };
        fetchLinks();
    }, []);

    const handleAliasChange = (e) => {
        const val = e.target.value;
        setAlias(val);
        if (val && !/^[a-zA-Z0-9_-]*$/.test(val)) {
            setAliasError('Invalid characters. Use letters, numbers, hyphens, or underscores only.');
        } else {
            setAliasError('');
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!longUrl || aliasError) return;
        setIsGenerating(true);

        const finalAlias = alias || Math.random().toString(36).substring(2, 8);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            url: longUrl,
            shorturl: finalAlias
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        try {
            const response = await fetch("/api/generate", requestOptions);
            const result = await response.json();

            if (result.success) {
                const newLink = {
                    id: Math.random().toString(),
                    originalUrl: longUrl,
                    shortUrl: `bytz.io/${finalAlias}`,
                    alias: finalAlias,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    clicks: 0,
                    countries: [],
                    devices: []
                };
                const updatedList = [newLink, ...links];
                setLinks(updatedList);
                setSelectedLink(newLink);
                setLongUrl('');
                setAlias('');
                setAliasError('');
            } else {
                setAliasError(result.message || 'Failed to generate URL');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setAliasError('An error occurred while connecting to the server');
        } finally {
            setIsGenerating(false);
        }
    };

    const openEditModal = (link) => {
        setLinkToEdit(link);
        setEditUrl(link.originalUrl);
        setIsEditModalOpen(true);
    };

    const handleEditSave = () => {
        const updatedLinks = links.map(l =>
            l.id === linkToEdit.id ? { ...l, originalUrl: editUrl } : l
        );
        setLinks(updatedLinks);
        if (selectedLink && selectedLink.id === linkToEdit.id) {
            setSelectedLink({ ...selectedLink, originalUrl: editUrl });
        }
        setIsEditModalOpen(false);
    };

    const openDeleteModal = (link) => {
        setLinkToDelete(link);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const updatedLinks = links.filter(l => l.id !== linkToDelete.id);
        setLinks(updatedLinks);
        if (selectedLink && selectedLink.id === linkToDelete.id) {
            setSelectedLink(updatedLinks[0] || null);
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-indigo-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row items-center justify-between bg-indigo-900/40 p-6 rounded-2xl border border-fuchsia-500/20 backdrop-blur-md shadow-lg">
                    <div>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-indigo-300 mt-1">Manage your shortened links</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <div className="text-sm font-medium text-indigo-200">
                            Usage: {usageCount} / {usageLimit} BYTZ
                        </div>
                        <div className="w-48 h-2 bg-indigo-950 rounded-full mt-2 overflow-hidden border border-fuchsia-500/30">
                            <div
                                className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-400 transition-all duration-500"
                                style={{ width: `${(usageCount / usageLimit) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-indigo-900/40 p-6 rounded-2xl border border-fuchsia-500/20 backdrop-blur-md shadow-lg">
                            <h2 className="text-xl font-bold text-indigo-100 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Create New Link
                            </h2>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-indigo-300 mb-2">Destination URL</label>
                                    <input
                                        type="url"
                                        value={longUrl}
                                        onChange={(e) => setLongUrl(e.target.value)}
                                        required
                                        placeholder="https://your-long-url.com/something"
                                        className="w-full bg-indigo-950 border border-indigo-700 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 text-indigo-100 rounded-xl px-4 py-3 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-indigo-300 mb-2">Custom Alias (Optional)</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 bg-indigo-800 border border-r-0 border-indigo-700 rounded-l-xl text-indigo-300 font-medium">
                                            bytz.io/
                                        </span>
                                        <input
                                            type="text"
                                            value={alias}
                                            onChange={handleAliasChange}
                                            placeholder="custom-name"
                                            className={`flex-1 bg-indigo-950 border ${aliasError ? 'border-red-500' : 'border-indigo-700'} focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-indigo-100 rounded-r-xl px-4 py-3 outline-none transition-all`}
                                        />
                                    </div>
                                    {aliasError && <p className="text-red-400 text-xs mt-2">{aliasError}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isGenerating || !!aliasError}
                                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] flex items-center justify-center gap-2 mt-4"
                                >
                                    {isGenerating ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Generate BYTZ
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>

                        <section className="bg-indigo-900/40 p-6 rounded-2xl border border-fuchsia-500/20 backdrop-blur-md shadow-lg overflow-x-auto">
                            <h2 className="text-xl font-bold text-indigo-100 mb-6">Your Links</h2>
                            {links.length === 0 ? (
                                <p className="text-indigo-400 text-center py-8">No links generated yet.</p>
                            ) : (
                                <div className="min-w-[700px]">
                                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4 px-4 border-b border-indigo-500/20 pb-2">
                                        <div className="col-span-4">Short URL</div>
                                        <div className="col-span-3">Original URL</div>
                                        <div className="col-span-2">Date</div>
                                        <div className="col-span-1 text-right">Clicks</div>
                                        <div className="col-span-2 text-center">Actions</div>
                                    </div>
                                    <div className="space-y-3">
                                        {links.map(link => (
                                            <div
                                                key={link.id}
                                                onClick={() => setSelectedLink(link)}
                                                className={`grid grid-cols-12 gap-4 items-center bg-indigo-950/50 p-4 rounded-xl border cursor-pointer transition-all ${selectedLink?.id === link.id ? 'border-orange-400/50 shadow-[0_0_10px_rgba(251,146,60,0.2)]' : 'border-indigo-800/50 hover:border-fuchsia-500/30'}`}
                                            >
                                                <div className="col-span-4 font-bold text-indigo-100 truncate pr-4">
                                                    {link.shortUrl}
                                                </div>
                                                <div className="col-span-3 text-indigo-300/80 text-sm truncate pr-4">
                                                    {link.originalUrl}
                                                </div>
                                                <div className="col-span-2 text-indigo-300 text-sm">
                                                    {link.date}
                                                </div>
                                                <div className="col-span-1 text-right font-medium text-orange-300">
                                                    {link.clicks.toLocaleString()}
                                                </div>
                                                <div className="col-span-2 flex justify-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEditModal(link); }}
                                                        className="p-2 bg-indigo-800 text-indigo-200 rounded-lg hover:bg-indigo-700 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openDeleteModal(link); }}
                                                        className="p-2 bg-indigo-800 text-indigo-200 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-indigo-900/40 p-6 rounded-2xl border border-fuchsia-500/20 backdrop-blur-md shadow-lg sticky top-6">
                            <h2 className="text-xl font-bold text-indigo-100 mb-6">Analytics Overview</h2>
                            {!selectedLink ? (
                                <div className="text-indigo-400 text-center py-12">
                                    Select a link to view its performance analytics.
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="bg-indigo-950 p-5 rounded-xl border border-indigo-800">
                                        <p className="text-sm font-medium text-indigo-300 uppercase tracking-widest mb-1">Total Clicks</p>
                                        <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-400 to-fuchsia-500 bg-clip-text text-transparent">
                                            {selectedLink.clicks.toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-4 flex items-center justify-between">
                                            <span>Top Countries</span>
                                            <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </h3>
                                        {selectedLink.countries.length === 0 ? (
                                            <p className="text-sm text-indigo-400">Not enough data.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedLink.countries.map((c, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between text-sm mb-1 text-indigo-100 font-medium">
                                                            <span>{c.name}</span>
                                                            <span>{c.percentage}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${c.percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-4 flex items-center justify-between">
                                            <span>Device Types</span>
                                            <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </h3>
                                        {selectedLink.devices.length === 0 ? (
                                            <p className="text-sm text-indigo-400">Not enough data.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedLink.devices.map((d, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between text-sm mb-1 text-indigo-100 font-medium">
                                                            <span>{d.name}</span>
                                                            <span>{d.percentage}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
                                                            <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${d.percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </section>
                    </div>

                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-sm">
                    <div className="bg-indigo-900 border border-fuchsia-500/30 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-2xl font-bold text-white mb-2">Edit Link</h3>
                        <p className="text-indigo-300 text-sm mb-6">Update the destination URL for <span className="font-bold text-orange-300">{linkToEdit?.shortUrl}</span></p>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-indigo-300 mb-2">Destination URL</label>
                                <input
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    required
                                    className="w-full bg-indigo-950 border border-indigo-700 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 text-indigo-100 rounded-xl px-4 py-3 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-indigo-300 hover:bg-indigo-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                className="px-5 py-2.5 rounded-xl font-bold bg-fuchsia-500 text-white hover:bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-sm">
                    <div className="bg-indigo-900 border border-red-500/30 rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Link?</h3>
                        <p className="text-indigo-300 text-sm mb-8">This action cannot be undone. The link <span className="font-bold text-red-300">{linkToDelete?.shortUrl}</span> will no longer work.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-indigo-300 bg-indigo-800 hover:bg-indigo-700 transition-colors w-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all w-full"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
