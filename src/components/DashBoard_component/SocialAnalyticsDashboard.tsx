import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { MoreVertical, X } from 'lucide-react';

type ChartType = 'followers' | 'growth' | 'posts' | 'interactions' | null;

type PayloadItem = {
  payload: { day: string; value: number };
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  const items = payload as PayloadItem[] | undefined;

  if (active && items && items.length) {
    const data = items[0].payload;
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-900">{data.day}</p>
        <p className="text-xs text-gray-600">
          Value:{' '}
          <span className="font-semibold">{data.value?.toLocaleString() ?? '0'}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function SocialAnalyticsDashboard() {
  const [selectedChart, setSelectedChart] = useState<ChartType>(null);

  const followersData = [
    { day: 'Day 1', value: 180000 },
    { day: 'Day 2', value: 200000 },
    { day: 'Day 3', value: 185000 },
    { day: 'Day 4', value: 210000 },
    { day: 'Day 5', value: 195000 },
    { day: 'Day 6', value: 220000 },
    { day: 'Day 7', value: 205000 },
    { day: 'Day 8', value: 215500 },
  ];

  const growthData = [
    { day: 'Day 1', value: 700 },
    { day: 'Day 2', value: 750 },
    { day: 'Day 3', value: 720 },
    { day: 'Day 4', value: 780 },
    { day: 'Day 5', value: 760 },
    { day: 'Day 6', value: 800 },
    { day: 'Day 7', value: 785 },
    { day: 'Day 8', value: 815 },
  ];

  const postsData = [
    { day: 'Day 1', value: 120 },
    { day: 'Day 2', value: 140 },
    { day: 'Day 3', value: 125 },
    { day: 'Day 4', value: 155 },
    { day: 'Day 5', value: 145 },
    { day: 'Day 6', value: 160 },
    { day: 'Day 7', value: 150 },
    { day: 'Day 8', value: 153 },
  ];

  const interactionsData = [
    { day: 'Day 1', value: 1800 },
    { day: 'Day 2', value: 2000 },
    { day: 'Day 3', value: 1900 },
    { day: 'Day 4', value: 2200 },
    { day: 'Day 5', value: 2100 },
    { day: 'Day 6', value: 2300 },
    { day: 'Day 7', value: 2150 },
    { day: 'Day 8', value: 2154 },
  ];

  const pieData = [
    { name: 'Instagram', value: 30, color: '#8b5cf6', percentage: '30%' },
    { name: 'Facebook', value: 35, color: '#3b82f6', percentage: '35%' },
    { name: 'Twitter', value: 25, color: '#10b981', percentage: '25%' },
    { name: 'LinkedIn', value: 10, color: '#60a5fa', percentage: '10%' },
  ];

  const totalLikes = 4100;

  const applications = [
    {
      name: 'Sophia Doe',
      position: 'Applied for Advertisi...',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      name: 'Mason Clark',
      position: 'Applied for Project Co...',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      name: 'Emily Paton',
      position: 'Applied for Layout E...',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      name: 'Daniel Breth',
      position: 'Applied for Interior A...',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      name: 'Theron Trump',
      position: 'Applied for Advertisi...',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  ];

  const chartDetails = {
    followers: {
      title: 'Total Followers Details',
      data: followersData,
      color: '#10b981',
      description:
        'Your follower count has grown by 18.5% over the last 8 days. Peak was on Day 6 with 220K followers.',
      average: '201.9K',
      peak: '220K',
      lowest: '180K',
    },
    growth: {
      title: 'Growth Details',
      data: growthData,
      color: '#3b82f6',
      description:
        'Daily growth shows steady increase with an average of 763 new followers per day.',
      average: '763',
      peak: '815',
      lowest: '700',
    },
    posts: {
      title: 'Number of Posts Details',
      data: postsData,
      color: '#8b5cf6',
      description:
        'You posted an average of 144 times over the last 8 days. Most active day was Day 6.',
      average: '144',
      peak: '160',
      lowest: '120',
    },
    interactions: {
      title: 'Interactions Details',
      data: interactionsData,
      color: '#fbbf24',
      description:
        'Total interactions peaked on Day 6 with 2,300 engagements. Average interaction rate is 2,075.',
      average: '2,075',
      peak: '2,300',
      lowest: '1,800',
    },
  } as const;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Followers */}
        <ChartCard
          title="Total Followers"
          subtitle="Last 5 days"
          value="215.5K"
          color="#10b981"
          data={followersData}
          gradientId="followers"
          onClick={() => setSelectedChart('followers')}
        />

        {/* Growth */}
        <ChartCard
          title="Growth of total follower"
          subtitle="Last 5 days"
          value="815"
          color="#3b82f6"
          data={growthData}
          gradientId="growth"
          onClick={() => setSelectedChart('growth')}
        />

        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm md:col-span-1 lg:row-span-2">
          <div className="flex justify-center items-center mb-4">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={1}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-900">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payload[0].payload.percentage}
                        </p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <h3 className="text-xs text-gray-700 font-semibold mb-3">
            Where do my Likes come from
          </h3>
          <div className="space-y-2.5">
            {pieData.map((entry, index) => {
              const count = Math.round((entry.value / 100) * totalLikes);
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{entry.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: entry.color }}>
                      ({entry.value}%)
                    </span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Posts */}
        <ChartCard
          title="Number of posts"
          subtitle="Last 5 days"
          value="153"
          color="#8b5cf6"
          data={postsData}
          gradientId="posts"
          onClick={() => setSelectedChart('posts')}
        />

        {/* Interactions */}
        <ChartCard
          title="Interactions"
          subtitle="Last 5 days"
          value="2154"
          color="#fbbf24"
          data={interactionsData}
          gradientId="interactions"
          onClick={() => setSelectedChart('interactions')}
        />

        {/* Applications */}
        <div className="bg-white rounded-xl p-5 shadow-sm md:col-span-2 lg:col-span-1 lg:row-span-2">
          <h3 className="text-xs text-gray-700 font-semibold mb-4">New Applications</h3>
          <div className="space-y-3">
            {applications.map((app, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <img
                    src={app.avatar}
                    alt={app.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900">{app.name}</h4>
                    <p className="text-[10px] text-gray-500">{app.position}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {chartDetails[selectedChart].title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {chartDetails[selectedChart].description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChart(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Average" value={chartDetails[selectedChart].average} />
                <StatCard label="Peak" value={chartDetails[selectedChart].peak} />
                <StatCard label="Lowest" value={chartDetails[selectedChart].lowest} />
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartDetails[selectedChart].data}>
                  <defs>
                    <linearGradient
                      id={`detail-${selectedChart}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartDetails[selectedChart].color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartDetails[selectedChart].color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartDetails[selectedChart].color}
                    strokeWidth={3}
                    fill={`url(#detail-${selectedChart})`}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-6">
                Daily Breakdown
              </h3>
              <div className="space-y-2">
                {chartDetails[selectedChart].data.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-sm text-gray-600">{item.day}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

const ChartCard: React.FC<{
  title: string;
  subtitle: string;
  value: string;
  color: string;
  data: { day: string; value: number }[];
  gradientId: string;
  onClick: () => void;
}> = ({ title, subtitle, value, color, data, gradientId, onClick }) => (
  <div
    className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <div className="mb-2">
      <h3 className="text-xs text-gray-500 mb-0.5 font-medium">{title}</h3>
      <p className="text-[10px] text-gray-400">{subtitle}</p>
    </div>
    <div className="mb-3">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`color-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#color-${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
