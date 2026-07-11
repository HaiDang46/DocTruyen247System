"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChapterListItem } from "@/components/chapter/chapter-list-item";
import { ModeSwitchToggle } from "@/components/mode-switch-toggle";
import { RatingStars } from "@/components/rating-stars";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { TagBadge } from "@/components/tag-badge";
import { formatStoryStatus, formatStoryType } from "@/lib/display";
import {
  chapters as mockChapters,
  episodes,
  stories as mockStories,
} from "@/lib/mock-data";
import {
  isDbConnected,
  getStoriesDb,
  getChaptersDb,
  getCommentsDb,
  createCommentDb,
  deleteCommentDb,
  getUserRatingDb,
  submitRatingDb,
  checkStoryUserStatusDb,
  toggleFavoriteDb,
  toggleFollowDb,
  incrementStoryViewsDb,
} from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";

export default function StoryDetailPage({ params }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [stories, setStories] = useState(mockStories);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    isDbConnected().then((connected) => {
      if (connected) {
        getStoriesDb().then((res) => {
          if (res.success && res.data) {
            setStories(res.data);
            const decodedSlug = decodeURIComponent(slug);
            const foundStory = res.data.find((item) => item.slug === decodedSlug || item.slug === slug);
            if (foundStory) {
              incrementStoryViewsDb(foundStory.id);
              getChaptersDb(foundStory.id).then((chapRes) => {
                if (chapRes.success && chapRes.data) {
                  setChapters(chapRes.data);
                }
              });

              // Load comments
              getCommentsDb(foundStory.id).then((commentRes) => {
                if (commentRes.success && commentRes.data) {
                  setComments(commentRes.data);
                }
              });

              // Load rating
              if (user) {
                getUserRatingDb(foundStory.id, user.id).then((rateRes) => {
                  if (rateRes.success && rateRes.data !== undefined) {
                    setUserRating(rateRes.data);
                  }
                });

                checkStoryUserStatusDb(user.id, foundStory.id).then((statusRes) => {
                  if (statusRes.success && statusRes.data) {
                    setIsFavorited(statusRes.data.isFavorited);
                    setIsFollowing(statusRes.data.isFollowing);
                  }
                });
              }
            }
          }
        });
      } else {
        const savedStories = localStorage.getItem("doc_truyen_stories");
        if (savedStories) {
          try {
            setStories(JSON.parse(savedStories));
          } catch (e) {
            console.error(e);
          }
        }

        const savedChapters = localStorage.getItem("doc_truyen_chapters");
        if (savedChapters) {
          try {
            setChapters(JSON.parse(savedChapters));
          } catch (e) {
            console.error(e);
          }
        } else {
          setChapters(mockChapters.map((c) => ({ ...c, storyId: "story-1" })));
        }

        const favs = JSON.parse(localStorage.getItem("doc_truyen_favorites") || "[]");
        const follows = JSON.parse(localStorage.getItem("doc_truyen_follows") || "[]");
        const currStory = (stories && stories.length > 0 ? stories : mockStories).find((item) => item.slug === slug) ?? mockStories[0];
        setIsFavorited(favs.includes(currStory.id));
        setIsFollowing(follows.includes(currStory.id));
      }
    });
  }, [slug, user?.id]);

  const decodedSlug = decodeURIComponent(slug);
  const story = stories.find((item) => item.slug === decodedSlug || item.slug === slug) ?? stories[0];

  // Filter chapters belonging to this story
  const storyChapters = chapters
    .filter((c) => c.storyId?.toLowerCase() === story.id?.toLowerCase())
    .sort((a, b) => b.number - a.number);
  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;
    const res = await createCommentDb(story.id, user.id, commentInput.trim());
    if (res.success && res.data) {
      setComments((prev) => [res.data, ...prev]);
      setCommentInput("");
    } else {
      alert("Lỗi đăng bình luận: " + res.error);
    }
  }

  async function handleDeleteComment(commentId) {
    const res = await deleteCommentDb(commentId, user.id);
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    } else {
      alert("Lỗi xóa bình luận: " + res.error);
    }
  }

  async function handleToggleFavorite() {
    if (!user) {
      const connected = await isDbConnected();
      if (!connected) {
        let favs = JSON.parse(localStorage.getItem("doc_truyen_favorites") || "[]");
        if (favs.includes(story.id)) {
          favs = favs.filter((id) => id !== story.id);
          setIsFavorited(false);
        } else {
          favs.push(story.id);
          setIsFavorited(true);
        }
        localStorage.setItem("doc_truyen_favorites", JSON.stringify(favs));
        return;
      }
      setIsAuthOpen(true);
      return;
    }
    const res = await toggleFavoriteDb(user.id, story.id);
    if (res.success) {
      setIsFavorited(res.data.isFavorited);
    }
  }

  async function handleToggleFollow() {
    if (!user) {
      const connected = await isDbConnected();
      if (!connected) {
        let follows = JSON.parse(localStorage.getItem("doc_truyen_follows") || "[]");
        if (follows.includes(story.id)) {
          follows = follows.filter((id) => id !== story.id);
          setIsFollowing(false);
        } else {
          follows.push(story.id);
          setIsFollowing(true);
        }
        localStorage.setItem("doc_truyen_follows", JSON.stringify(follows));
        return;
      }
      setIsAuthOpen(true);
      return;
    }
    const res = await toggleFollowDb(user.id, story.id);
    if (res.success) {
      setIsFollowing(res.data.isFollowing);
    }
  }

  return (
    <div className="space-y-8">
      {story && (
        <>
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-4">
              <StoryCover story={story} priority />
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href={
                    storyChapters.length > 0
                      ? `/read/${story.type.toLowerCase()}?storyId=${story.id}&chapterId=${storyChapters[storyChapters.length - 1].id}`
                      : `/read/${story.type.toLowerCase()}?storyId=${story.id}`
                  }
                  className="button-primary col-span-3 text-center block"
                >
                  Đọc ngay
                </Link>
                <button 
                  onClick={handleToggleFollow}
                  className={`button-ghost ${isFollowing ? 'text-primary border-primary bg-primary/10' : ''}`}
                >
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
                <button 
                  onClick={handleToggleFavorite}
                  className={`button-ghost ${isFavorited ? 'text-rose-500 border-rose-500 bg-rose-500/10' : ''}`}
                >
                  {isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Đã sao chép liên kết thành công!");
                  }}
                  className="button-ghost"
                >
                  Chia sẻ
                </button>
                {story.sourceUrl ? (
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-ghost col-span-3 text-center"
                  >
                    Mở link nguồn
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <TagBadge tone={story.type === "NOVEL" ? "blue" : "violet"}>
                  {formatStoryType(story.type)}
                </TagBadge>
                <TagBadge>{formatStoryStatus(story.status)}</TagBadge>
              </div>

              <h1 className="mt-4 text-3xl font-black text-ink md:text-5xl">
                {story.title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-subtle">
                bởi {story.author}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <RatingStars rating={story.rating} />

                {/* Interactive Star Chấm Điểm */}
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 border border-line">
                  <span className="text-xs font-bold text-subtle">
                    {user ? "Đánh giá của bạn:" : "Đăng nhập để đánh giá:"}
                  </span>
                  <div className="flex text-base text-amber-400">
                    {Array.from({ length: 5 }, (_, index) => {
                      const starValue = index + 1;
                      const isLit = hoverRating
                        ? starValue <= hoverRating
                        : starValue <= userRating;
                      return (
                        <button
                          key={index}
                          onClick={async () => {
                            if (!user) {
                              setIsAuthOpen(true);
                              return;
                            }
                            const res = await submitRatingDb(
                              story.id,
                              user.id,
                              starValue,
                            );
                            if (res.success) {
                              setUserRating(starValue);
                              const connected = await isDbConnected();
                              if (connected) {
                                const storyRes = await getStoriesDb();
                                if (storyRes.success && storyRes.data) {
                                  setStories(storyRes.data);
                                }
                              }
                            }
                          }}
                          onMouseEnter={() => user && setHoverRating(starValue)}
                          onMouseLeave={() => user && setHoverRating(0)}
                          className={`transition ${user ? "hover:scale-125 cursor-pointer" : "cursor-pointer"}`}
                          title={
                            user
                              ? `Đánh giá ${starValue} sao`
                              : "Đăng nhập để đánh giá"
                          }
                          type="button"
                        >
                          {isLit ? "★" : "☆"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span className="text-sm font-semibold text-subtle">
                  {story.views} lượt xem
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <TagBadge key={tag}>{tag}</TagBadge>
                ))}
              </div>

              <details
                className="mt-6 rounded-lg border border-line bg-muted/60 p-4 open:bg-muted"
                open
              >
                <summary className="cursor-pointer text-sm font-bold text-ink">
                  Giới thiệu
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-subtle whitespace-pre-line">
                  {story.description}
                </p>
                {story.sourceUrl ? (
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-bold text-primary hover:underline"
                  >
                    Xem truyện tại nguồn
                  </a>
                ) : null}
              </details>
            </div>
          </section>

          <section className="space-y-4">
            <ModeSwitchToggle active={story.type} />
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
                <SectionHeader
                  title="Danh sách chương"
                  action={`${storyChapters.length} chương`}
                />
                <div className="mt-4 divide-y divide-line">
                  {storyChapters.length > 0 ? (
                    storyChapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/read/${story.type.toLowerCase()}?storyId=${story.id}&chapterId=${chapter.id}`}
                        className="block hover:bg-muted/40 transition px-2 rounded-lg"
                      >
                        <ChapterListItem chapter={chapter} />
                      </Link>
                    ))
                  ) : (
                    <p className="py-6 text-sm text-subtle text-center">
                      Truyện chưa có chương nào.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
                <SectionHeader title="Danh sách tập manga" action="Dạng lưới" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {story.type === "MANGA" && storyChapters.length > 0
                    ? storyChapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="group overflow-hidden rounded-lg border border-line bg-muted transition hover:-translate-y-1 hover:shadow-soft"
                        >
                          <div className="aspect-[4/3] bg-slate-200 overflow-hidden dark:bg-slate-800 relative">
                            {chapter.imageUrls?.[0] ? (
                              <img
                                src={chapter.imageUrls[0]}
                                alt={chapter.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="h-full rounded-lg border border-white/40 bg-white/40 dark:border-white/10 dark:bg-white/10" />
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-bold text-ink">
                              Tập {chapter.number}
                            </p>
                            <p className="mt-1 truncate text-xs text-subtle">
                              {chapter.title}
                            </p>
                          </div>
                        </div>
                      ))
                    : episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="group overflow-hidden rounded-lg border border-line bg-muted transition hover:-translate-y-1 hover:shadow-soft"
                        >
                          <div className="aspect-[4/3] bg-slate-200 p-3 dark:bg-slate-800">
                            <div className="h-full rounded-lg border border-white/40 bg-white/40 dark:border-white/10 dark:bg-white/10" />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-bold text-ink">
                              Tập {episode.number}
                            </p>
                            <p className="mt-1 truncate text-xs text-subtle">
                              {episode.title}
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </section>

          {/* Comments Section */}
          <section className="rounded-lg border border-line bg-surface p-5 shadow-soft">
            <SectionHeader
              title="Bình luận & Thảo luận"
              action={`${comments.length} bình luận`}
            />

            {/* Comment Input */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
                <textarea
                  placeholder="Chia sẻ cảm nghĩ của bạn về bộ truyện..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  rows={3}
                  required
                />

                <div className="flex justify-end">
                  <button
                    className="button-primary text-xs py-2 px-5"
                    type="submit"
                  >
                    Gửi bình luận
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-line bg-muted/30 p-6 text-center">
                <p className="text-sm text-subtle">
                  Bạn cần đăng nhập để tham gia thảo luận.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/95 transition"
                  type="button"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="mt-6 space-y-4 divide-y divide-line">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="pt-4 flex gap-3 items-start group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primarySoft text-xs font-black text-primary uppercase flex-shrink-0">
                      {(comment.userName || comment.user?.name || "U").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-ink">
                            {comment.userName || comment.user?.name || "Người dùng ẩn danh"}
                          </span>
                          <span className="text-[10px] text-subtle ml-2">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        {user && user.id === comment.user?.id && (
                          <button 
                            onClick={() => setCommentToDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-rose-600 hover:underline transition"
                            type="button"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-subtle whitespace-pre-line leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-xs text-subtle text-center">
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Delete Comment Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-ink mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-subtle mb-6">Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-ink bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  handleDeleteComment(commentToDelete);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-lg shadow-rose-600/20"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
