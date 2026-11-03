import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function Learn() {
  const { slug } = useParams();
  const list = useQuery({ queryKey: ['articles'], queryFn: () => api('/articles') });
  const post = useQuery({ queryKey: ['article', slug], queryFn: () => api('/articles/' + slug), enabled: !!slug });
  if (slug && post.data) {
    return (
      <article className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/learn" className="text-sm text-brand-dark">بازگشت</Link>
        {post.data.cover && <img src={post.data.cover} alt="" className="rounded-2xl w-full h-52 object-cover mt-4" />}
        <h1 className="text-3xl font-extrabold mt-4">{post.data.title}</h1>
        <p className="mt-6 leading-8 whitespace-pre-wrap">{post.data.body}</p>
      </article>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">آموزش</h1>
      <ul className="mt-6 space-y-3">
        {(list.data || []).map((p: any) => (
          <li key={p.id}>
            <Link to={`/learn/${p.slug}`} className="card overflow-hidden block">
              {p.cover && <img src={p.cover} alt="" className="h-40 w-full object-cover" />}
              <div className="p-4">
                <p className="text-xs text-ink-muted">{p.kind === 'guide' ? 'راهنما' : 'خبر'}</p>
                <p className="font-extrabold">{p.title}</p>
                <p className="text-sm text-ink-muted mt-1">{p.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
