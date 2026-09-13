import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BLOG_POSTS } from "../../data/blogPosts";

export default function BlogPage() {
  const { slug } = useParams();

  const post = useMemo(
    () => BLOG_POSTS.find((item) => item.slug === slug || item.view === slug),
    [slug]
  );

  if (slug && !post) {
    return (
      <main className="min-h-screen bg-[#f7f9fb] text-slate-900 px-4 sm:px-8 py-12 lg:px-16 text-left">
        <div className="max-w-6xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f172a] px-4 py-2 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc]">
            ← Back to Blog
          </Link>
          <h1 className="mt-8 text-3xl font-bold font-display text-slate-950">Post not found</h1>
        </div>
      </main>
    );
  }

  if (post) {
    return (
      <main className="min-h-screen bg-[#f7f9fb] text-slate-900 px-4 sm:px-8 py-10 lg:px-16 text-left">
        <article className="max-w-6xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f172a] px-4 py-2.5 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] shadow-xs mb-8">
            ← Back to Blog
          </Link>

          <div className="bg-white rounded-3xl lg:rounded-[40px] border border-[#e2e8f0] p-6 sm:p-10 lg:p-14 shadow-sm">
            <div className="relative w-full h-64 sm:h-96 lg:h-[480px] rounded-2xl lg:rounded-[32px] overflow-hidden bg-[#f2f4f6] mb-8">
              <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
            </div>

            <div className="max-w-4xl mx-auto">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#0f172a] mb-2">{post.cat} · {post.date} · {post.readTime}</p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-950 leading-tight mb-6">{post.title}</h1>
              <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed mb-8 border-b border-[#e2e8f0] pb-6">{post.excerpt}</p>
              <div className="space-y-6 text-slate-700 font-medium leading-relaxed text-base sm:text-lg">
                {(post.content || []).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-slate-900 px-4 sm:px-8 py-12 lg:px-16 text-left">
      <section className="max-w-7xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#0f172a] block mb-1">Editorial Articles</span>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-slate-950">Houserve Blog</h1>
        <p className="mt-3 text-slate-600 font-medium text-sm sm:text-base max-w-2xl">Service guides, maintenance checklists, and local Delhi household care insights.</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {BLOG_POSTS.map((item) => (
            <Link key={item.id} to={`/blog/${item.slug}`} className="group flex flex-col rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="h-56 overflow-hidden bg-[#f2f4f6]">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <p className="text-[10px] uppercase font-bold text-[#0f172a] tracking-widest mb-2">{item.cat} · {item.date}</p>
                <h2 className="text-lg font-bold text-slate-950 group-hover:text-[#0f172a] leading-snug mb-3">{item.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
