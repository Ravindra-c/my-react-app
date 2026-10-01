import React, { useState, useEffect } from 'react';
import { Image, ExternalLink, Plus, Trash2, Loader2, FolderPlus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Array of vibrant nature images to rotate across different album cards
const NATURE_TEMPLATES = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', // Foggy Mountain
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Ocean Beach
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', // Forest Sunlight
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', // Yosemite Valley
  'https://images.unsplash.com/photo-1511497584788-8767611136f0?auto=format&fit=crop&w=800&q=80', // Pine Forest
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', // Green Meadow
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80', // Waterfall
];

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

  // Helper to pick a nature template image based on index or custom cover
  function getAlbumCover(album, index) {
    if (album.cover_url && album.cover_url.trim() !== '') {
      return album.cover_url;
    }
    return NATURE_TEMPLATES[index % NATURE_TEMPLATES.length];
  }

  async function addAlbum(e) {
    e.preventDefault();
    if (!title.trim() || !sharedLink.trim()) return;

    // Pick a random nature template if no cover URL is provided
    const randomTemplate = NATURE_TEMPLATES[Math.floor(Math.random() * NATURE_TEMPLATES.length)];

    const { data, error } = await supabase
      .from('gallery_albums')
      .insert([
        {
          title: title.trim(),
          cover_url: coverUrl.trim() || randomTemplate,
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
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat p-6 sm:p-10 -m-6 sm:-m-10"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      {/* Full-Screen Dark Blur Overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs pointer-events-none" />

      {/* Main Content Container Centered On Screen */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Google Photos Albums</h2>
              <p className="text-xs text-slate-300">Access and view your shared Google Photos collections</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Album'}
          </button>
        </div>

        {/* Add Album Form */}
        {showAddForm && (
          <form
            onSubmit={addAlbum}
            className="p-5 bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-2xl space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-semibold text-white">Connect a Google Photos Album</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Album Title (e.g. Vacation 2026)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="url"
                placeholder="Google Photos Shared Link"
                value={sharedLink}
                onChange={(e) => setSharedLink(e.target.value)}
                required
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="url"
                placeholder="Cover Image URL (Optional)"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Save Album
            </button>
          </form>
        )}

        {/* Album Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12 text-slate-300">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400 mr-2" />
            <span>Loading albums...</span>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/15 rounded-2xl bg-slate-900/40 backdrop-blur-md">
            <Image className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-slate-300">No albums added yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Add Album" above to link a Google Photos shared link!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album, index) => {
              const coverImg = getAlbumCover(album, index);
              return (
                <div
                  key={album.id}
                  className="group relative bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 w-full overflow-hidden relative">
                    <img
                      src={coverImg}
                      alt={album.title}
                      onError={(e) => {
                        e.target.src = NATURE_TEMPLATES[index % NATURE_TEMPLATES.length];
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => deleteAlbum(album.id)}
                      className="absolute top-3 right-3 p-2 bg-slate-950/70 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md transition-colors shadow-md cursor-pointer"
                      title="Delete Album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <h3 className="font-semibold text-white text-base line-clamp-1">
                      {album.title}
                    </h3>
                    <a
                      href={album.shared_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-amber-500/30 hover:border-amber-500 transition-all"
                    >
                      <span>Open in Google Photos</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}