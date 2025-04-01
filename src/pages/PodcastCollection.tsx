import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import Fuse from 'fuse.js';

interface Channel {
  channel_id: string;
  channel_name: string;
  channel_description: string;
  channel_url: string;
  channel_image_url: string | null;
  channel_background_url: string | null;
  host: string;
}

const PodcastCollection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number>();
  const navigate = useNavigate();

  // Initialize Fuse instance
  const fuse = useRef<Fuse<Channel> | null>(null);

  useEffect(() => {
    if (channels.length > 0) {
      fuse.current = new Fuse(channels, {
        keys: ['channel_name', 'host', 'channel_description'],
        threshold: 0.3,
        shouldSort: true,
        ignoreLocation: true
      });
    }
  }, [channels]);

  React.useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('channels')
          .select('*')
          .order('channel_name');
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          setChannels(data);
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  // Debounced search function
  useEffect(() => {
    if (!fuse.current) return;

    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = window.setTimeout(() => {
      const results = fuse.current?.search(searchQuery).map(result => result.item) || [];
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleChannelClick = (channelName: string) => {
    navigate(`/podcast/${channelName}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const displayedChannels = searchQuery ? searchResults : channels;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore the curated list of Podcasts</h1>
          </div>
          
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by podcasts or hosts..."
                className="w-full pl-12 pr-24 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                aria-label="Search podcasts"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="text-gray-400" size={20} />
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="text-gray-500" size={16} />
                  </button>
                )}
                {isSearching && (
                  <div className="text-sm text-gray-500">Searching...</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-xl animate-pulse"
                  style={{ height: '160px' }}
                />
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
                >
                  Try Again
                </button>
              </div>
            ) : displayedChannels.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                {searchQuery ? 'No channels found matching your search.' : 'No channels available.'}
              </div>
            ) : (
              displayedChannels.map((channel) => (
                <div
                  key={channel.channel_id}
                  onClick={() => handleChannelClick(channel.channel_name)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-[16/7] relative bg-gray-100">
                    <img
                      src={channel.channel_image_url || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60'}
                      alt={channel.channel_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="p-2.5">
                    <h2 className="text-sm font-medium text-gray-900 line-clamp-1">{channel.channel_name}</h2>
                    {channel.host && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">Host: {channel.host}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">If you have suggestions to add to this list, please feel free to share it <Link to="/contact" className="text-blue-600 hover:underline">here</Link>.</p>
          </div>
        </div>
      </main>
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <Footer />
    </div>
  );
};

export default PodcastCollection;