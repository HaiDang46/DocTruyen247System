import Link from "next/link";
import Image from "next/image";

export function StoryCard({ story, compact = false }) {
  // Format views to K/M
  const formatViews = (views) => {
    if (!views) return '0';
    if (typeof views === 'string') return views;
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  return (
    <div className="relative group text-center flex flex-col h-full">
      <Link href={`/stories/${story.slug}`} className="block relative overflow-hidden rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm aspect-[3/4]">
        {story.coverImage || story.coverUrl ? (
          <img 
            src={story.coverImage || story.coverUrl} 
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full ${story.coverClass || 'bg-gradient-to-br from-gray-700 to-gray-900'} transition-transform duration-300 group-hover:scale-110`}></div>
        )}
        
        {/* Hot badge if needed */}
        {story.views > 100000 && (
          <span className="absolute top-1 left-1 bg-netred text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm z-10">
            HOT
          </span>
        )}
        
        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex items-center justify-between px-2 py-1 text-[11px] text-white backdrop-blur-[2px]">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            {formatViews(story.views)}
          </span>
          <span className="flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
             {story.comments || 0}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            {story.likes || 0}
          </span>
        </div>
      </Link>
      
      <div className="mt-2 text-left flex flex-col flex-grow">
        <Link href={`/stories/${story.slug}`} className="line-clamp-2 text-[14px] font-bold text-gray-800 dark:text-gray-200 hover:text-netpurple transition leading-snug">
          {story.title}
        </Link>
        <div className="mt-auto pt-1 flex items-center justify-between">
          <span className="text-[12px] font-medium text-gray-800 dark:text-gray-300 truncate mr-2">
            {story.latestChapter || 'Chapter 1'}
          </span>
          <span className="text-[11px] text-gray-500 italic whitespace-nowrap">
            {story.timeAgo || 'Vừa xong'}
          </span>
        </div>
      </div>
    </div>
  );
}
