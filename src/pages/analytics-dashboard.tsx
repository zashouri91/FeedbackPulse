import React, { useState, useEffect } from 'react';
import { useEnhancedSurveys } from '../lib/hooks/use-enhanced-surveys';
import { Analytics } from '../lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const { getAnalytics } = useEnhancedSurveys();
  const [metrics, setMetrics] = useState<Analytics['metrics']>();
  const [filters, setFilters] = useState<Analytics['filters']>({
    dateRange: {
      start: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
  });
  const [groupBy, setGroupBy] = useState<Analytics['groupBy']>('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [filters, groupBy]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics(filters);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Analytics['filters'], value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="mt-1 flex space-x-2">
            <input
              type="date"
              value={filters.dateRange?.start}
              onChange={e =>
                handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value,
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.dateRange?.end}
              onChange={e =>
                handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value,
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Group By</label>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as Analytics['groupBy'])}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="group">Group</option>
            <option value="location">Location</option>
          </select>
        </div>

        {filters.ratingRange && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating Range</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="number"
                min={1}
                max={5}
                value={filters.ratingRange.min}
                onChange={e =>
                  handleFilterChange('ratingRange', {
                    ...filters.ratingRange,
                    min: parseInt(e.target.value),
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                min={1}
                max={5}
                value={filters.ratingRange.max}
                onChange={e =>
                  handleFilterChange('ratingRange', {
                    ...filters.ratingRange,
                    max: parseInt(e.target.value),
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {metrics?.averageRating.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Responses</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{metrics?.responseCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Drivers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Response Drivers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.topDrivers}
                  dataKey="count"
                  nameKey="id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {metrics?.topDrivers.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            /* Implement CSV export */
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export as CSV
        </button>
        <button
          onClick={() => {
            /* Implement PDF export */
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export as PDF
        </button>
      </div>
    </div>
  );
}
