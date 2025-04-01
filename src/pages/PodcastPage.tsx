import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Filter, AlertCircle, RefreshCw, ImageOff, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Get or create anonymous ID from localStorage
const getAnonymousId = () => {
  const storageKey = 'anonymousUserId';
  let id = localStorage.getItem(storageKey);
  if (!id) {
    id = `anon_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, id);
  }
  return id;
};

interface Channel {
  channel_id: string;
  channel_name: string;
  channel_description: string;
  channel_url: string;
  channel_background_url?: string;
  host: string;
}

interface InsightRow {
  video_title: string;
  video_publish_datetime: string;
  company_name: string;
  insight_sentiment: string;
  insight_text: string;
  insight_id: number;
}

const PodcastPage: React.FC = () => {
  const { channelName } = useParams();
  // Update page title when channel name changes
  useEffect(() => {
    document.title = channelName ? `PodSieve - ${channelName}` : 'PodSieve';
    
    // Restore original title on unmount
    return () => {
      document.title = 'PodSieve - Podcast Insights';
    };
  }, [channelName]);
  
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [imageError, setImageError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<number, boolean>>({});
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const filterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Filter states
  const [filters, setFilters] = useState<{
    'Publish Date': string[];
    'Company': string[];
    'Sentiment': string[];
  }>({
    'Publish Date': [],
    'Company': [],
    'Sentiment': []
  });

  // Fetch insights data
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error: insightsError } = await supabase
          .from('insights_details_view')
          .select('video_title, video_publish_datetime, company_name, insight_sentiment, insight_text, insight_id')
          .eq('channel_name', channelName)
          .order('video_publish_datetime', { ascending: false });

        if (insightsError) {
          throw insightsError;
        }

        if (data) {
          setInsights(data);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights data');
      }
    };

    if (channelName) {
      fetchInsights();
    }
  }, [channelName]);

  // Fetch channel data
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);
        
        const { data, error: fetchError } = await supabase
          .from('channels')
          .select('*')
          .eq('channel_name', channelName)
          .single();
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          setChannel(data);
        } else {
          setError('Channel not found');
        }
      } catch (err) {
        console.error('Error fetching channel:', err);
        setError('Failed to load channel information');
      } finally {
        setLoading(false);
      }
    };
    
    if (channelName) {
      fetchChannelData();
    }
  }, [channelName]);

  // Fetch user's existing feedback
  useEffect(() => {
    const fetchUserFeedback = async () => {
      const anonymousId = getAnonymousId();
      
      const { data: feedbackData } = await supabase
        .from('insight_feedback')
        .select('insight_id, feedback_type')
        .eq('user_id', anonymousId);

      if (feedbackData) {
        const feedbackMap = feedbackData.reduce((acc, item) => ({
          ...acc,
          [item.insight_id]: item.feedback_type
        }), {});
        setUserFeedback(feedbackMap);
      }
    };

    fetchUserFeedback();
  }, []);

  const handleFeedback = async (insightId: number, feedbackType: 'up' | 'down') => {
    setFeedbackLoading(prev => ({ ...prev, [insightId]: true }));

    const anonymousId = getAnonymousId();

    try {
      const { data: existingFeedback, error: fetchError } = await supabase
        .from('insight_feedback')
        .select('*')
        .eq('insight_id', insightId)
        .eq('user_id', anonymousId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingFeedback && existingFeedback.feedback_type === feedbackType) {
        // Remove feedback if clicking the same button again
        const { error: deleteError } = await supabase
          .from('insight_feedback')
          .delete()
          .eq('insight_id', insightId)
          .eq('user_id', anonymousId);

        if (deleteError) throw deleteError;

        setUserFeedback(prev => {
          const newFeedback = { ...prev };
          delete newFeedback[insightId];
          return newFeedback;
        });
      } else {
        // First try to delete any existing feedback
        await supabase
          .from('insight_feedback')
          .delete()
          .eq('insight_id', insightId)
          .eq('user_id', anonymousId);

        // Then insert new feedback
        const { error: insertError } = await supabase
          .from('insight_feedback')
          .insert({
            insight_id: insightId,
            user_id: anonymousId,
            feedback_type: feedbackType
          });

        if (insertError) throw insertError;

        setUserFeedback(prev => ({
          ...prev,
          [insightId]: feedbackType
        }));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setFeedbackLoading(prev => ({ ...prev, [insightId]: false }));
    }
  };

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeFilter && filterRefs.current[activeFilter] && 
          !filterRefs.current[activeFilter]?.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilter]);

  // Retry loading channel data
  const handleRetry = () => {
    setRetrying(true);
    setError(null);
    // Re-trigger the useEffect
    setChannel(null);
    setRetrying(false);
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Filter the rows based on selected filters
  const filteredInsights = insights.filter(insight => {
    const dateMatch = filters['Publish Date'].length === 0 || 
      filters['Publish Date'].includes(new Date(insight.video_publish_datetime).toLocaleDateString());
    
    const companyMatch = filters['Company'].length === 0 || 
      filters['Company'].includes(insight.company_name);
    
    const sentimentMatch = filters['Sentiment'].length === 0 || 
      filters['Sentiment'].includes(insight.insight_sentiment);
    
    return dateMatch && companyMatch && sentimentMatch;
  })
    .sort((a, b) => {
      // Sort by publish date (newest first)
      return new Date(b.video_publish_datetime).getTime() - new Date(a.video_publish_datetime).getTime();
    })
    .slice(0, 100);

  // Group insights by title and publish date
  const groupedInsights = filteredInsights.reduce((acc, curr, index) => {
    const prevRow = index > 0 ? filteredInsights[index - 1] : null;
    const isSameGroup = prevRow && 
      prevRow.video_title === curr.video_title && 
      new Date(prevRow.video_publish_datetime).toLocaleDateString() === new Date(curr.video_publish_datetime).toLocaleDateString();
    
    if (!isSameGroup) {
      acc.push({
        ...curr,
        rowSpan: filteredInsights.filter((row, i) => 
          i >= index && 
          row.video_title === curr.video_title && 
          new Date(row.video_publish_datetime).toLocaleDateString() === new Date(curr.video_publish_datetime).toLocaleDateString()
        ).length
      });
    }
    return acc;
  }, [] as (InsightRow & { rowSpan: number })[]);

  // Get unique values for filter options
  const dateOptions = [...new Set(insights.map(i => new Date(i.video_publish_datetime).toLocaleDateString()))];
  const companyOptions = [...new Set(insights.map(i => i.company_name))];
  const sentimentOptions = [...new Set(insights.map(i => i.insight_sentiment))];

  const toggleFilter = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  const handleFilterChange = (title: string, option: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [title]: checked 
        ? [...prev[title as keyof typeof prev], option]
        : prev[title as keyof typeof prev].filter(item => item !== option)
    }));
  };

  const clearFilter = (title: string) => {
    setFilters(prev => ({
      ...prev,
      [title]: []
    }));
  };

  const FilterPopover = ({ title, options }: { title: string; options: string[] }) => {
    const selectedOptions = filters[title as keyof typeof filters];
    
    return (
      <div 
        ref={el => filterRefs.current[title] = el}
        className={`absolute top-full left-0 z-[100] mt-1 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 
          ${activeFilter === title ? 'block' : 'hidden'}`}
      >
        <div className="p-2">
          <div className="text-sm font-medium text-gray-900 px-3 py-2">
            Filter by {title}
          </div>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => handleFilterChange(title, option, e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between px-3 py-2 border-t">
            <button 
              onClick={() => clearFilter(title)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
            <button 
              onClick={() => setActiveFilter(null)}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FilterableHeader = ({ title, options }: { title: string; options: string[] }) => (
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
      <div className="relative flex items-center gap-2">
        <span>{title}</span>
        <button
          onClick={() => toggleFilter(title)}
          className={`p-1 rounded-md hover:bg-gray-200 transition-colors
            ${activeFilter === title ? 'bg-gray-200' : ''}`}
        >
          <Filter size={14} className={`text-gray-500 ${filters[title as keyof typeof filters].length > 0 ? 'text-blue-600' : ''}`} />
        </button>
        <FilterPopover title={title} options={options} />
      </div>
    </th>
  );

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="animate-pulse space-y-8 w-full max-w-7xl">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 rounded w-full"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Channel</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Default fallback image for banner
  const fallbackImage = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200&h=600';
  
  // Determine image source with fallbacks
  const bannerImageSrc = imageError || !channel?.channel_background_url 
    ? fallbackImage 
    : channel.channel_background_url;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-[21/9] w-full">
                {imageError && !channel?.channel_background_url ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <ImageOff size={32} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-gray-500 text-sm">Image not available</p>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={bannerImageSrc}
                    alt={channel?.channel_name || 'Channel banner'}
                    className="w-full h-full object-cover object-center"
                    onError={handleImageError}
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
              
              <div className="p-2 sm:p-3 flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {channel?.channel_name}
                </h1>
                
                <div className="mb-2">
                  <div className="text-base font-medium text-gray-900 mb-1">
                    <span className="text-gray-700">{channel?.host || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="prose prose-gray">
                  <p className="text-xs sm:text-sm text-gray-600 leading-normal">
                    {channel?.channel_description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Details by Episode</h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-[200px]">Title</th>
                    <FilterableHeader title="Publish Date" options={dateOptions} />
                    <FilterableHeader title="Company" options={companyOptions} />
                    <FilterableHeader title="Sentiment" options={sentimentOptions} />
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-[500px]">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white overflow-y-auto">
                  {filteredInsights.map((row, index) => {
                    const prevRow = index > 0 ? filteredInsights[index - 1] : null;
                    const showTitleAndDate = !prevRow || 
                      prevRow.video_title !== row.video_title || 
                      new Date(prevRow.video_publish_datetime).toLocaleDateString() !== new Date(row.video_publish_datetime).toLocaleDateString();
                    
                    const titleRowIndex = groupedInsights.findIndex(g => g.video_title === row.video_title);
                    const isAlternateRow = titleRowIndex % 2 === 1;
                    
                    const rowSpan = showTitleAndDate ? filteredInsights.filter((r, i) => 
                      i >= index && 
                      r.video_title === row.video_title && 
                      new Date(r.video_publish_datetime).toLocaleDateString() === new Date(row.video_publish_datetime).toLocaleDateString()
                    ).length : undefined;

                    return (
                    <tr key={index} className={`hover:bg-gray-50 transition-colors ${isAlternateRow && showTitleAndDate ? 'bg-gray-50' : ''}`}>
                      {showTitleAndDate && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 w-[200px] align-top" rowSpan={rowSpan}>
                            <div className="sticky top-[57px] bg-inherit pt-4 -mt-4 pb-4 -mb-4">
                              {row.video_title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 align-top" rowSpan={rowSpan}>
                            <div className="sticky top-[57px] bg-inherit pt-4 -mt-4 pb-4 -mb-4">
                              {new Date(row.video_publish_datetime).toLocaleDateString()}
                            </div>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                          {row.company_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${row.insight_sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                            row.insight_sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {row.insight_sentiment.charAt(0).toUpperCase() + row.insight_sentiment.slice(1).toLowerCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(row.insight_id, 'up');
                                }}
                                disabled={feedbackLoading[row.insight_id]}
                                className={`p-1.5 rounded-full transition-colors ${
                                  userFeedback[row.insight_id] === 'up' 
                                    ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                title="Helpful insight"
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(row.insight_id, 'down');
                                }}
                                disabled={feedbackLoading[row.insight_id]}
                                className={`p-1.5 rounded-full transition-colors ${
                                  userFeedback[row.insight_id] === 'down'
                                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                title="Not helpful insight"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 w-[500px] relative">
                        <p className={expandedRows.has(`${index}-${row.insight_text}`) ? '' : 'line-clamp-2'}>
                          {row.insight_text}
                        </p>
                        {row.insight_text.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(`${index}-${row.insight_text}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
                          >
                            {expandedRows.has(`${index}-${row.insight_text}`) ? 'Show less' : 'See more'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <Footer />
    </div>
  );
};

export default PodcastPage;