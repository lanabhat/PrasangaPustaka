import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface WpPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  jetpack_featured_media_url?: string;
}

const WP_BASE = 'https://public-api.wordpress.com/wp/v2/sites/prasangaprathisangraha2.wordpress.com';

const WpPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<WpPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${WP_BASE}/posts/${id}?_embed`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data: WpPost) => setPost(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">ಪೋಸ್ಟ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <article className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Featured image */}
        {post.jetpack_featured_media_url && (
          <img
            src={post.jetpack_featured_media_url}
            alt=""
            className="w-full max-h-64 object-cover"
          />
        )}

        <div className="p-6">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.date).toLocaleDateString('kn-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>

          {/* Title */}
          <h1
            className="text-2xl font-bold text-slate-900 kn leading-snug mb-4"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* Content */}
          <div
            className="prose prose-sm prose-slate max-w-none kn wp-content"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Link to WordPress */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button asChild variant="outline" size="sm">
              <a href={post.link} target="_blank" rel="noopener">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                ಸಂಪೂರ್ಣ ಲೇಖನ ನೋಡಿ (WordPress)
              </a>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default WpPost;
