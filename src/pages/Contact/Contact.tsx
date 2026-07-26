import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Calendar } from 'lucide-react';

const WP_CONTACT_API = 'https://public-api.wordpress.com/wp/v2/sites/prasangaprathisangraha2.wordpress.com/posts/?_embed&categories=4018606&per_page=20';

interface WpPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  jetpack_featured_media_url?: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(WP_CONTACT_API)
      .then((r) => r.json())
      .then((data: WpPost[]) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-12">
      <h1 className="ps-display text-2xl font-bold mb-6" style={{ color: 'var(--ps-text)' }}>
        {t('nav.contact')}
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--ps-accent)' }} />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center py-16" style={{ color: 'var(--ps-muted)' }}>{t('library.no_results')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/blog/${post.id}`)}
              style={{
                background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                borderRadius: 18, padding: 20, boxShadow: 'var(--ps-shadow-sm)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                textAlign: 'left', transition: 'box-shadow .18s, transform .18s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--ps-shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)'; e.currentTarget.style.transform = ''; }}
            >
              <div className="ps-serif kn"
                style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.35, color: 'var(--ps-text)' }}
                dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              <p className="kn" style={{ fontFamily: 'system-ui', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ps-muted)', margin: 0 }}>
                {stripHtml(post.excerpt.rendered).slice(0, 180)}…
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)' }}>
                <Calendar style={{ width: 13, height: 13 }} />
                {new Date(post.date).toLocaleDateString('kn-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contact;
