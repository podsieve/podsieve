import React, { useEffect, useState } from 'react';
import { Calendar, Building2, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PodcastTile {
  id: string;
  channel_id: string;
  channel_name: string;
  video_title: string;
  companies: string;
  video_publish_date: string;
  channel_image_url: string;
}

const TilesSection: React.FC = () => {
  const [podcasts, setPodcasts] = useState<PodcastTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();

  const handleTileClick = (channelName: string) => {
    navigate(`/podcast/${channelName}`);
  };

  const fetchPodcasts = async () => {
    try {
      setError(null);
      setRetrying(true);
      
      const { data, error: supabaseError } = await supabase
        .from('podcast_tiles_view')
        .select('*')
        .order('video_publish_date', { ascending: false })
        .limit(6);

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        setPodcasts(data);
      }
    } catch (error) {
      console.error('Error fetching podcast tiles:', error);
      setError('Failed to load podcast data. Please try again.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="bg-gray-100 rounded-2xl p-4 h-[300px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-red-500" />
          <p className="font-medium text-gray-900">{error}</p>
          <button
            onClick={fetchPodcasts}
            disabled={retrying}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={`${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[300px]">
      {podcasts.map((podcast) => (
        <Link
          to={`/podcast/${podcast.channel_name}`}
          key={podcast.id || podcast.channel_id} 
          className="bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Image Section - Top 1/3 */}
          <div className="relative h-[33%] w-full">
            <img 
              src={podcast.channel_image_url || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60'}
              alt={podcast.channel_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60';
              }}
            />
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col">
            {/* Fixed height podcast name section with 2-line clamp */}
            <div className="min-h-[48px] mb-3">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                {podcast.channel_name}
              </h3>
            </div>
            
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 min-w-[70px]">
                  <PlayCircle size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-medium">Video:</span>
                </div>
                <span 
                  className="text-xs text-gray-600 font-medium truncate"
                  title={podcast.video_title}
                >
                  {podcast.video_title}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-2 min-w-[70px]">
                  <Building2 size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-medium">Mentions:</span>
                </div>
                <span className="text-xs text-gray-600 font-medium line-clamp-1 flex-1">
                  {podcast.companies}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 min-w-[70px]">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-medium">Published:</span>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {new Date(podcast.video_publish_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button 
              className="mt-auto w-full px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors text-center"
            >
              Details
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TilesSection;