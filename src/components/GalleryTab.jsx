import React, { useState, useEffect } from 'react';
import { Image, ExternalLink, Plus, Trash2, Loader2, FolderPlus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function GalleryTab() {
  const [albums, setAlbums] = useState([]);
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [sharedLink, setSharedLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setAlbums(data || []);
    setLoading(false);
  }

  async function addAlbum(e) {
    e.preventDefault();
    if (!title.trim() || !sharedLink.trim()) return;

    const { data, error } = await supabase
      .from('gallery_albums')
      .insert([
        {
          title: title.trim(),
          cover_url: coverUrl.trim() || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80',
          shared_link: sharedLink.trim(),
        },
      ])
      .select();

    if (!error && data) {
      setAlbums([data[0], ...albums]);
      setTitle('');
      setCoverUrl('');
      setSharedLink('');
      setShowAddForm(false);
    }
  }

  async function deleteAlbum(id) {
    const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
    if (!error) {
      setAlbums(albums.filter((album) => album.id !== id));
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Image className="w-7 h-7 text-indigo-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Google Photos Albums</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Access and view your shared Google Photos collections</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <FolderPlus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Album'}
        </button>
      </div>

      {/* Add Album Form */}
      {showAddForm && (
        <form onSubmit={addAlbum} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Connect a Google Photos Album</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Album Title (e.g. Vacation 2026)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="url"
              placeholder="Google Photos Shared Link (https://photos.app.goo.gl/...)"
              value={sharedLink}
              onChange={(e) => setSharedLink(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="url"
              placeholder="Cover Image URL (Optional)"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Album
          </button>
        </form>
      )}

      {/* Album Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
          <span>Loading albums...</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <Image className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-400">No albums added yet.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add Album" above to link a Google Photos shared link!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition-all duration-300 flex flex-col"
            >
              {/* Cover Image */}
              <div className="h-44 w-full overflow-hidden relative">
                <img
                  src={album.cover_url}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="absolute top-3 right-3 p-2 bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl backdrop-blur-md transition-colors"
                  title="Delete Album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info & Action */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <h3 className="font-semibold text-slate-100 text-base mb-3 line-clamp-1">{album.title}</h3>
                <a
                  href={album.shared_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-indigo-500/20 hover:border-indigo-600 transition-all"
                >
                  <span>Open in Google Photos</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}