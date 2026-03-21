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
      <main className="min-h-screen bg-[#03060d] text-white px-6 py-16 lg:px-24">
        <Link to="/blog" className="text-xs uppercase tracking-widest opacity-70">← Back to Blog</Link>
        <h1 className="mt-6 text-4xl font-black">Post not found</h1>
      </main>
    );
  }

  if (post) {
    return (
      <main className="min-h-screen bg-[#03060d] text-white px-6 py-16 lg:px-24">
        <article className="max-w-4xl mx-auto">
          <Link to="/blog" className="text-xs uppercase tracking-widest opacity-70">← Back to Blog</Link>
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-white/50">{post.cat} · {post.date} · {post.readTime}</p>
          <h1 className="mt-4 text-4xl lg:text-6xl font-black leading-tight">{post.title}</h1>
          <img src={post.img} alt={post.title} className="mt-8 w-full rounded-[28px] border border-white/10 object-cover max-h-[420px]" />
          <p className="mt-8 text-lg text-white/70">{post.excerpt}</p>
          <div className="mt-8 space-y-5 text-white/80 leading-relaxed">
            {(post.content || []).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#03060d] text-white px-6 py-16 lg:px-24">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-black">Houserve Blog</h1>
        <p className="mt-4 text-white/70 max-w-2xl">Service guides, maintenance checklists, and local Delhi household care insights.</p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((item) => (
            <Link key={item.id} to={`/blog/${item.slug}`} className="rounded-[28px] border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/30 transition-colors">
              <img src={item.img} alt={item.title} className="w-full h-56 object-cover" />
              <div className="p-6">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">{item.cat} · {item.date}</p>
                <h2 className="mt-3 text-2xl font-black leading-tight">{item.title}</h2>
                <p className="mt-3 text-white/70">{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
