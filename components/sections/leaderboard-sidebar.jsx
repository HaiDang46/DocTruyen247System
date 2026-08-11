"use client";

import { useState } from 'react';
import Link from 'next/link';

export function LeaderboardSidebar({ stories }) {
  const [activeTab, setActiveTab] = useState('month');

  // Helper to format views
  const formatViews = (views) => {
    if (!views) return '0';
    if (typeof views === 'string') return views;
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  // Mock sorting based on tabs for demonstration
  const getSortedStories = () => {
    if (!stories) return [];
    let sorted = [...stories];
    if (activeTab === 'week') {
      sorted = sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (activeTab === 'day') {
      sorted = sorted.sort((a, b) => (b.comments || 0) - (a.comments || 0));
    } else {
      sorted = sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return sorted.slice(0, 10);
  };

  const currentStories = getSortedStories();

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'text-blue-500 border-blue-500';
      case 1: return 'text-green-500 border-green-500';
      case 2: return 'text-orange-500 border-orange-500';
      default: return 'text-gray-400 border-transparent';
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'month', label: 'Top Tháng' },
          { id: 'week', label: 'Top Tuần' },
          { id: 'day', label: 'Top Ngày' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[13px] font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-netpurple border-t-[3px] border-netpurple'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 border-t-[3px] border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="p-0">
        {currentStories.map((story, index) => (
          <div key={story.id} className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <div className={`w-8 text-center text-xl font-bold ${getRankColor(index)}`}>
              {String(index + 1).padStart(2, '0')}
            </div>
            <Link href={`/stories/${story.slug}`} className="block flex-shrink-0">
              <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden">
                {story.coverImage || story.coverUrl ? (
                  <img src={story.coverImage || story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${story.coverClass || 'bg-gray-700'}`}></div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <Link href={`/stories/${story.slug}`} className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-netpurple truncate">
                {story.title}
              </Link>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {story.latestChapter || 'Chapter 1'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  {formatViews(story.views)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {currentStories.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            Chưa có dữ liệu.
          </div>
        )}
      </div>
    </div>
  );
}
