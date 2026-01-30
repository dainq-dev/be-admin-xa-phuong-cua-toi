import { useState, useEffect } from 'react';
import { AnalyticsController } from '@/domains/analytics/controllers/analytics.controller';

const analyticsController = new AnalyticsController();

export default function TrangChu() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await analyticsController.getDashboard();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div className="p-8">Đang tải...</div>;

  const stats = [
    { label: 'Tin tức', count: data?.counts?.news || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Thủ tục', count: data?.counts?.documents || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Phản ánh mới', count: data?.counts?.pendingFeedback || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Người dùng', count: data?.counts?.users || 0, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        <p className="text-[var(--color-text-secondary)]">
          Chào mừng trở lại! Dưới đây là tóm tắt hoạt động của phường xã.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]`}
          >
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">{stat.label}</h3>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg border border-[var(--color-border)]">
          <h3 className="font-semibold mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {data?.recentActivities?.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <span className="font-medium">{activity.user?.name || 'Ai đó'}</span>
                  <span className="text-[var(--color-text-secondary)]"> đã thực hiện: </span>
                  <span>{activity.eventType} {activity.entityType}</span>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(activity.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
            {(!data?.recentActivities || data.recentActivities.length === 0) && (
              <p className="text-center text-[var(--color-text-secondary)] py-4">Chưa có hoạt động nào.</p>
            )}
          </div>
        </div>

        <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg border border-[var(--color-border)]">
          <h3 className="font-semibold mb-4">Tin tức thịnh hành</h3>
          <div className="space-y-4">
            {data?.popularNews?.map((news: any) => (
              <div key={news.id} className="flex justify-between items-center text-sm">
                <span className="font-medium truncate mr-4">{news.title}</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">{news.viewCount} lượt xem</span>
              </div>
            ))}
            {(!data?.popularNews || data.popularNews.length === 0) && (
              <p className="text-center text-[var(--color-text-secondary)] py-4">Chưa có tin tức nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
