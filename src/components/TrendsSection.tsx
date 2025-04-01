import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TrendsSectionProps {
  channelName?: string;
}

interface CompanyTrend {
  month: string;
  count: number;
}

interface TopCompany {
  company: string;
  count: number;
}

const TrendsSection: React.FC<TrendsSectionProps> = ({ channelName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [bullishData, setBullishData] = useState<{ company: string; trend: CompanyTrend[] }>({ company: '', trend: [] });
  const [bearishData, setBearishData] = useState<{ company: string; trend: CompanyTrend[] }>({ company: '', trend: [] });
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);

  const fetchTrendsData = async () => {
    try {
      setError(null);
      setRetrying(true);

      // Get insights for the channel
      const { data: insights, error: insightsError } = await supabase
        .from('insights_view')
        .select('*')
        .eq('channel_name', channelName)
        .order('video_publish_datetime', { ascending: false });

      if (insightsError) throw insightsError;
      
      if (!insights || insights.length === 0) {
        setError('No insights available for this channel');
        return;
      }

      // Process insights to get trends
      const companyMentions = insights.reduce((acc, insight) => {
        const company = insight.company_name;
        if (!acc[company]) {
          acc[company] = { positive: 0, negative: 0 };
        }
        if (insight.insight_sentiment === 'positive') {
          acc[company].positive++;
        } else if (insight.insight_sentiment === 'negative') {
          acc[company].negative++;
        }
        return acc;
      }, {} as Record<string, { positive: number; negative: number }>);

      // Get most bullish and bearish companies
      const companies = Object.entries(companyMentions);
      const mostBullish = companies.sort((a, b) => b[1].positive - a[1].positive)[0];
      const mostBearish = companies.sort((a, b) => b[1].negative - a[1].negative)[0];

      // Process monthly trends for bullish company
      if (mostBullish) {
        const bullishTrend = insights
          .filter(i => i.company_name === mostBullish[0] && i.insight_sentiment === 'positive')
          .reduce((acc, insight) => {
            const month = new Date(insight.video_publish_datetime).toLocaleString('en-US', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        setBullishData({
          company: mostBullish[0],
          trend: Object.entries(bullishTrend)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
            .slice(0, 6)
        });
      }

      // Process monthly trends for bearish company
      if (mostBearish) {
        const bearishTrend = insights
          .filter(i => i.company_name === mostBearish[0] && i.insight_sentiment === 'negative')
          .reduce((acc, insight) => {
            const month = new Date(insight.video_publish_datetime).toLocaleString('en-US', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        setBearishData({
          company: mostBearish[0],
          trend: Object.entries(bearishTrend)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
            .slice(0, 6)
        });
      }

      // Set top mentioned companies
      setTopCompanies(
        companies
          .map(([company, counts]) => ({
            company,
            count: counts.positive + counts.negative
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
      );

    } catch (error: any) {
      console.error('Error fetching trends:', error);
      setError('Failed to load trends data. Please try again.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, [channelName]);

  const renderChart = (title: string, data: { company: string; trend: CompanyTrend[] }, color: string) => (
    <div className="bg-white rounded-2xl p-3 border border-gray-200">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600 mb-2">Most {title.toLowerCase()} company: <span className="font-semibold">{data.company}</span></p>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 border border-gray-200">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-[120px] bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-3 border border-gray-200">
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <AlertCircle size={24} className="text-red-500" />
          <p className="font-medium text-gray-900 text-sm">{error}</p>
          <button
            onClick={fetchTrendsData}
            disabled={retrying}
            className="flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={`${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {renderChart('Bullish', bullishData, '#22c55e')}
      {renderChart('Bearish', bearishData, '#ef4444')}
      
      <div className="bg-white rounded-2xl p-3 border border-gray-200">
        <h3 className="text-base font-bold text-gray-900 mb-2">Most Mentioned</h3>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 text-xs font-semibold text-gray-900">Company</th>
                <th className="text-right py-1.5 text-xs font-semibold text-gray-900">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {topCompanies.map((company, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-1.5 text-xs font-medium text-gray-900">{company.company}</td>
                  <td className="py-1.5 text-xs text-right text-gray-600">{company.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrendsSection;