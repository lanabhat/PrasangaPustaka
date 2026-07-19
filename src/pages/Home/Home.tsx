import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import EntryCard from '@/components/EntryCard/EntryCard';
import TrendChart from '@/components/TrendChart/TrendChart';
import { fetchStats } from '@/services/api';
import type { StatsData } from '@/services/api';

const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/prasangaprathisangraha2.wordpress.com/posts/?_embed&categories=1171&per_page=4';

interface WpPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  jetpack_featured_media_url?: string;
}

const PROJECT_LINKS = [
  { title: 'ಯಕ್ಷಪ್ರಸಂಗಪಟ್ಟಿ', url: 'http://yakshaprasangayaadi.yakshavahini.com/' },
  { title: 'ಪ್ರಸಂಗಪ್ರತಿಸಂಗ್ರಹ', url: 'http://prasangaprathisangraha.yakshavahini.com/' },
  { title: 'ಯಕ್ಷಪ್ರಸಂಗಕೋಶ', url: 'https://yakshaprasangakosha.yakshavahini.com/' },
  { title: 'ಯಕ್ಷಮಟ್ಟುಕೋಶ', url: 'http://yakshamattukosha.yakshavahini.com/' },
  { title: 'ಯಕ್ಷಸಂಘಟನಾಕೋಶ', url: 'https://yakshasanghatanakosha.yakshavahini.com/' },
  { title: 'ಯಕ್ಷಪುಸ್ತಕಯಾದಿ', url: 'http://yakshapusthakayaadi.yakshavahini.com/' },
];

const INDEX_LINKS = [
  { title: 'ಪ್ರಸಂಗಪ್ರತಿಸಂಗ್ರಹ (ಕೋಷ್ಟಕ)', url: 'https://drive.google.com/open?id=1W8dZG9xmlAAn7TwsyTWUFIMTa-hdw4kW' },
  { title: 'ಯಕ್ಷಪ್ರಸಂಗಯಾದಿ (ಪ್ರಸಂಗ ಪ್ರಕಾರ)', url: 'https://drive.google.com/file/d/1yqr3M8ItXiPGMA512A_gYVEKMal6GeMG/view' },
  { title: 'ಯಕ್ಷಪ್ರಸಂಗಯಾದಿ (ಕವಿ ಪ್ರಕಾರ)', url: 'https://drive.google.com/file/d/1hK-0ki4DsHlDhkXr88o_hI8BoVA3iADE/view' },
];

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function SectionHeading({ title, linkLabel, onLink }: { title: string; linkLabel?: string; onLink?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 className="ps-serif" style={{ fontWeight: 600, fontSize: 21, margin: 0, color: 'var(--ps-text)' }}>{title}</h2>
      {linkLabel && onLink && (
        <button onClick={onLink}
          style={{ fontFamily: 'system-ui', fontSize: 13.5, fontWeight: 500, color: 'var(--ps-accent-text)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [animStats, setAnimStats] = useState({ total: 0, kavis: 0, publishers: 0 });
  const [wpPosts, setWpPosts] = useState<WpPost[]>([]);

  useEffect(() => {
    fetchStats()
      .then((r) => {
        setStats(r.data);
        // Animate stats count-up
        const T = { total: r.data.total, kavis: r.data.by_kavi.length, publishers: r.data.by_publisher.length };
        const dur = 1100, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          setAnimStats({ total: Math.round(T.total * e), kavis: Math.round(T.kavis * e), publishers: Math.round(T.publishers * e) });
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      })
      .catch(console.error);

    fetch(WP_API)
      .then((r) => r.json())
      .then((posts: WpPost[]) => setWpPosts(posts))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--ps-bg)' }}>

 {/* ── About + links ──────────────────────────────── */}
        

      {/* ── Hero ───────────────────────────────────────────── */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '56px 22px 32px', textAlign: 'center' }}>
        <a href="https://www.yakshavahini.com" target="_blank" rel="noopener" className="block">
              <img src="/yakshavahini.jpg" alt="ಯಕ್ಷವಾಹಿನಿ"
                style={{ width: '100%', objectFit: 'contain', background: '#fff', padding: '16px 32px', maxHeight: 120 }} />
            </a>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ps-accent-soft)', color: 'var(--ps-accent-text)',
          borderRadius: 999, padding: '6px 14px',
          fontFamily: 'system-ui', fontSize: 11.5, fontWeight: 600,
          letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 24,
        }}>
          {t('home.badge')}
        </div>

        <h1 className="ps-serif" style={{
          fontWeight: 600, fontSize: 'clamp(28px, 5vw, 48px)',
          lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 0 18px',
          color: 'var(--ps-text)',
        }}>
          {t('home.title')}
        </h1>

        <p className="kn-serif" style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.6,
          color: 'var(--ps-muted)', margin: '0 auto 32px', maxWidth: 620,
        }}>
          {t('home.description')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/library')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'var(--ps-grad)', color: '#fff',
              borderRadius: 999, padding: '14px 28px',
              fontFamily: "'Noto Sans Kannada', sans-serif", fontSize: 15, fontWeight: 600,
              cursor: 'pointer', border: 'none',
              boxShadow: 'var(--ps-shadow-md)',
            }}
          >
            {t('home.cta')}
          </button>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 22px 16px' }}>
        <div style={{
          display: 'flex', gap: 0,
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 20, padding: '22px 0',
          boxShadow: 'var(--ps-shadow-sm)', justifyContent: 'space-around',
        }}>
          {[
            { value: animStats.total, label: t('home.stats.total') },
            { value: animStats.kavis, label: t('home.stats.kavis') },
            { value: animStats.publishers, label: t('home.stats.publishers') },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, background: 'var(--ps-border)' }} />}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div className="ps-serif" style={{ fontWeight: 600, fontSize: 32, color: 'var(--ps-text)', letterSpacing: '-.01em' }}>
                  {s.value.toLocaleString()}
                </div>
                <div className="kn-sans" style={{ fontSize: 12.5, color: 'var(--ps-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 22px 60px' }}>

        {/* ── Recently added ─────────────────────────────── */}
        {stats?.recently_added && stats.recently_added.length > 0 && (
          <section style={{ marginBottom: 52 }}>
            <SectionHeading title={t('home.recently_added')} linkLabel={t('home.view_all')} onLink={() => navigate('/library')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {stats.recently_added.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </section>
        )}

        {/* ── Blog posts ─────────────────────────────────── */}
        {wpPosts.length > 0 && (
          <section style={{ marginBottom: 52 }}>
            <SectionHeading title={t('home.from_journal')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {wpPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  style={{
                    background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                    borderRadius: 18, padding: 18, boxShadow: 'var(--ps-shadow-sm)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
                    textAlign: 'left', transition: 'box-shadow .18s, transform .18s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--ps-shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)'; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{
                    display: 'inline-flex', alignSelf: 'flex-start',
                    background: 'var(--ps-accent-soft)', color: 'var(--ps-accent-text)',
                    borderRadius: 7, padding: '4px 10px',
                    fontFamily: 'system-ui', fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                  }}>{t('home.news_label')}</div>
                  <div className="ps-serif kn"
                    style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.35, color: 'var(--ps-text)' }}
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <p className="kn" style={{ fontFamily: 'system-ui', fontSize: 13, lineHeight: 1.55, color: 'var(--ps-muted)', margin: 0 }}>
                    {stripHtml(post.excerpt.rendered).slice(0, 120)}…
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)' }}>
                    {new Date(post.date).toLocaleDateString('kn-IN', { year: 'numeric', month: 'long' })}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Top Kavis ──────────────────────────────────── */}
        {stats?.by_kavi && stats.by_kavi.length > 0 && (
          <section style={{ marginBottom: 52 }}>
            <SectionHeading title={t('home.top_kavis')} linkLabel={t('home.browse_by_kavi')} onLink={() => navigate('/library')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {stats.by_kavi.slice(0, 8).map((k) => (
                <button
                  key={k.name}
                  onClick={() => navigate(`/library?kavi=${encodeURIComponent(k.name)}`)}
                  style={{
                    background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                    borderRadius: 14, padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ps-accent)'; e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ps-border)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div className="kn-sans" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ps-text)' }}>{k.name}</div>
                  <div style={{ fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)', marginTop: 3 }}>{k.count} {t('home.entries')}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Charts ─────────────────────────────────────── */}
        {stats && (stats.date_trend.length > 0 || stats.by_publisher.length > 0) && (
          <section style={{ marginBottom: 52 }}>
            <SectionHeading title={t('home.collection_overview')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {stats.date_trend.length > 0 && (
                <div style={{ background: 'var(--ps-surface)', border: '1px solid var(--ps-border)', borderRadius: 18, padding: 20, boxShadow: 'var(--ps-shadow-sm)' }}>
                  <TrendChart data={stats.date_trend} title={t('home.trend_title')} />
                </div>
              )}
              {stats.by_publisher.length > 0 && (
                <div style={{ background: 'var(--ps-surface)', border: '1px solid var(--ps-border)', borderRadius: 18, padding: 20, boxShadow: 'var(--ps-shadow-sm)' }}>
                  <h3 className="ps-serif" style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--ps-text)' }}>{t('home.top_publishers')}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.by_publisher.slice(0, 8).map(p => ({ name: p.name.substring(0, 14), count: p.count }))}
                      layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--ps-border)" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--ps-muted)' }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 9, fill: 'var(--ps-muted)' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        )}

       

        {/* ── Yakshavahini projects ──────────────────────── */}
        <section style={{ marginBottom: 52 }}>
          <SectionHeading title={t('home.projects')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {PROJECT_LINKS.map((p) => (
              <a key={p.url} href={p.url} target="_blank" rel="noopener"
                style={{
                  background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                  borderRadius: 14, padding: '12px 16px', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ps-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ps-border)')}>
                <span className="kn-sans" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ps-text)' }}>{p.title}</span>
                <ExternalLink style={{ width: 12, height: 12, color: 'var(--ps-faint)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </section>

      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '22px 22px 40px',
        borderTop: '1px solid var(--ps-border)',
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="kn-sans" style={{ fontSize: 12.5, color: 'var(--ps-faint)' }}>
          {t('home.footer_org')}
        </div>
        <div style={{ fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)' }}>
          {t('home.footer_desc')}
        </div>
        <a href="/admin-login" style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--ps-faint)', textDecoration: 'none', opacity: 0.5 }}>
          v1.0
        </a>
      </div>
    </div>
  );
};

export default Home;
