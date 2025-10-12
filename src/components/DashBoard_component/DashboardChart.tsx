import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function DashboardStats() {
  const [showApplications, setShowApplications] = React.useState(true);
  const [showShortlisted, setShowShortlisted] = React.useState(true);

  // Data for Total Employees pie chart
  const ApplicationData = [
    { name: 'Rejected', value: 75, color: '#3b82f6' },
    { name: 'Accepted', value: 25, color: '#10b981' }
  ];

  // Data for Total Projects bar chart
  const projectData = [
    { month: 'Jan', upcoming: 25, progress: 20, complete: 15 },
    { month: 'Feb', upcoming: 30, progress: 25, complete: 18 },
    { month: 'Mar', upcoming: 28, progress: 28, complete: 20 },
    { month: 'Apr', upcoming: 32, progress: 30, complete: 22 },
    { month: 'May', upcoming: 35, progress: 32, complete: 25 },
    { month: 'Jun', upcoming: 38, progress: 35, complete: 28 },
    { month: 'Jul', upcoming: 40, progress: 38, complete: 30 },
    { month: 'Aug', upcoming: 42, progress: 40, complete: 32 },
    { month: 'Sep', upcoming: 45, progress: 42, complete: 35 },
    { month: 'Oct', upcoming: 48, progress: 45, complete: 38 },
    { month: 'Nov', upcoming: 50, progress: 48, complete: 40 },
    { month: 'Dec', upcoming: 55, progress: 50, complete: 42 }
  ];

  // Data for Top Active Jobs area chart

const jobsData = [
    { month: 'Jan', applications: 30, shortlisted: 10 },
    { month: 'Feb', applications: 20, shortlisted: 15 },
    { month: 'Mar', applications: 75, shortlisted: 25 },
    { month: 'Apr', applications: 45, shortlisted: 35 },
    { month: 'May', applications: 95, shortlisted: 48 },
    { month: 'Jun', applications: 85, shortlisted: 75 },
    { month: 'Jul', applications: 68, shortlisted: 50 },
    { month: 'Aug', applications: 72, shortlisted: 55 },
    { month: 'Sep', applications: 82, shortlisted: 60 },
    { month: 'Oct', applications: 90, shortlisted: 66 },
    { month: 'Nov', applications: 60, shortlisted: 40 },
    { month: 'Dec', applications: 100, shortlisted: 80 }
];
  // Data for bottom cards
  const bottomCards = [
    { label: 'Applications', value: '132.0k', percentage: 60, color: '#3b82f6' },
    { label: 'Shortlisted', value: '10.9k', percentage: 50, color: '#10b981' },
    { label: 'On Hold', value: '03.1k', percentage: 34, color: '#8b5cf6' }
  ];

  // Job titles data
  const jobTitles = [
    { title: 'Project Manager', count: 325 },
    { title: 'Sales Manager', count: 154 },
    { title: 'Machine Instrument', count: 412 },
    { title: 'Operation Manager', count: 412 }
  ];

  return (
    <div className="p-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Employees Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-600">Total Employees</h3>
            <span className="text-2xl font-bold text-gray-900">590</span>
          </div>
          
          <div className="flex justify-center items-center mb-6 relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={ApplicationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {ApplicationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {ApplicationData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                         <span className="text-sm text-gray-700">{entry.name}</span>
                        <span className="font-semibold text-gray-900">{entry.value}%</span>
                      </div>
                    ))}
            </div>
          </div>

          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-700">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Female</span>
            </div>
          </div>
        </div>

        {/* Total Projects Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm text-gray-600">Total Projects</h3>
            <span className="text-2xl font-bold text-gray-900">87</span>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Ongoing</span>
              <span className="text-sm text-blue-600 font-medium">24 Projects</span>
              <span className="ml-auto text-xs text-gray-400">10/4/2025</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={projectData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Bar dataKey="complete" stackId="a" fill="#d1d5db" radius={[0, 0, 0, 0]} barSize={12} />
              <Bar dataKey="progress" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={12} />
              <Bar dataKey="upcoming" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Upcoming</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <span className="text-xs text-gray-600">Complete</span>
            </div>
          </div>
        </div>

        {/* Top Active Jobs Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm text-gray-600">Top Active Jobs</h3>
            <span className="text-xs text-blue-600 font-medium">Last month</span>
          </div>

          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showApplications}
                  onChange={(e) => setShowApplications(e.target.checked)}
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${showApplications ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${showApplications ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </div>
              <span className="text-xs text-gray-600">Applications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showShortlisted}
                  onChange={(e) => setShowShortlisted(e.target.checked)}
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${showShortlisted ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${showShortlisted ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </div>
              <span className="text-xs text-gray-600">Shortlisted</span>
            </label>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={jobsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorShortlisted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              {showApplications && (
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorApplications)" 
                />
              )}
              {showShortlisted && (
                <Area 
                  type="monotone" 
                  dataKey="shortlisted" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#colorShortlisted)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>

          {/* Job Titles Section - Inside Active Jobs Card */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm text-gray-600 font-medium">Job title</h3>
              <h3 className="text-sm text-gray-600 font-medium">Applications</h3>
            </div>
            
            <div className="space-y-3">
              {jobTitles.map((job, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{job.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{job.count}</span>
                    <TrendingUp size={16} className="text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bottom Progress Cards */}
        {bottomCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">{card.label}</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">{card.value}</span>
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90" width="80" height="80">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#f0f0f0"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke={card.color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 30 * card.percentage / 100} ${2 * Math.PI * 30}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-semibold" style={{ color: card.color }}>
                    {card.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}