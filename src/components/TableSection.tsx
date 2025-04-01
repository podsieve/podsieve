import React, { useState } from 'react';
import { Plus, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CompanyMention {
  company_name: string;
  positive_mentions: number;
  negative_mentions: number;
}

const TableSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [activeTimeframe, setActiveTimeframe] = useState<'1W' | '1M' | '3M'>('1W');
  const [mentions, setMentions] = useState<CompanyMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Number of rows that fit in the container
  const MAX_VISIBLE_ROWS = 12;

  const tabs = [
    { id: 'positive', icon: <Plus size={18} />, label: 'Positive Mentions' },
    { id: 'negative', icon: <Minus size={18} />, label: 'Negative Mentions' },
  ];

  const timeframes = [
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
  ];

  const fetchMentions = async () => {
    try {
      setLoading(true);
      setError(null);
      setRetrying(true);

      // Calculate date range based on selected timeframe
      const now = new Date();
      let startDate = new Date();
      switch (activeTimeframe) {
        case '1W':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      // Fetch data from mentions_view
      const { data, error: supabaseError } = await supabase
        .from('mentions_view')
        .select('company_name, sentiment, video_publish_date')
        .gte('video_publish_date', startDate.toISOString())
        .lte('video_publish_date', now.toISOString());

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // Process the data to count positive and negative mentions
        const mentionsMap = new Map<string, { positive: number; negative: number }>();
        
        data.forEach(mention => {
          const current = mentionsMap.get(mention.company_name) || { positive: 0, negative: 0 };
          if (mention.sentiment.toLowerCase() === 'positive') {
            current.positive++;
          } else if (mention.sentiment.toLowerCase() === 'negative') {
            current.negative++;
          }
          mentionsMap.set(mention.company_name, current);
        });

        // Convert map to array
        const processedMentions: CompanyMention[] = Array.from(mentionsMap.entries()).map(([company_name, counts]) => ({
          company_name,
          positive_mentions: counts.positive,
          negative_mentions: counts.negative
        }));

        setMentions(processedMentions);
      }
    } catch (err) {
      console.error('Error fetching mentions:', err);
      setError('Failed to load mentions data');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  React.useEffect(() => {
    fetchMentions();
  }, [activeTimeframe]);

  // Sort mentions based on active tab
  const filteredAndSortedMentions = [...mentions]
    .filter(mention => activeTab === 'positive' ? mention.positive_mentions > 0 : mention.negative_mentions > 0)
    .sort((a, b) => {
    if (activeTab === 'positive') {
      return b.positive_mentions - a.positive_mentions;
    } else {
      return b.negative_mentions - a.negative_mentions;
    }
  })
  .slice(0, MAX_VISIBLE_ROWS);

  if (loading) {
    return (
      <div className="h-[616px] flex flex-col bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? tab.id === 'positive'
                    ? "text-gray-900 border-b-2 border-green-500"
                    : "text-gray-900 border-b-2 border-red-500"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab(tab.id as 'positive' | 'negative')}
            >
              <span className={activeTab === tab.id ? 'text-gray-900' : ''}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[616px] flex flex-col bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-4">{error}</p>
            <button
              onClick={fetchMentions}
              disabled={retrying}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[616px] flex flex-col bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? tab.id === 'positive'
                  ? "text-gray-900 border-b-2 border-green-500"
                  : "text-gray-900 border-b-2 border-red-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab(tab.id as 'positive' | 'negative')}
          >
            <span className={activeTab === tab.id ? 'text-gray-900' : ''}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="flex items-center py-2 font-medium text-gray-500 border-b border-gray-200 pr-4 sticky top-0 bg-white z-10">
          <span className="flex-1">Company</span>
          <span className="w-16 text-right">#</span>
        </div>
        
        {filteredAndSortedMentions.map((mention) => (
          <div key={mention.company_name} className="flex items-center py-3 border-b border-gray-200 last:border-b-0 pr-4">
            <span className="flex-1 font-medium">{mention.company_name}</span>
            <span className="w-16 text-right text-gray-600">
              {activeTab === 'positive' ? mention.positive_mentions : mention.negative_mentions}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.id}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTimeframe === timeframe.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTimeframe(timeframe.id as '1W' | '1M' | '3M')}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSection;