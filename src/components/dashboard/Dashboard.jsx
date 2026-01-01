import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { formatPrice } from '../../utils/format';
import StatCard from '../StatCard';
import { blogApi, orderApi, productApi, userApi } from '../../api/services';
import { TrendingUp, Storefront, People, Article } from '@mui/icons-material';
import SalesChart from './charts/SalesChart';
import ContentDistributionChart from './charts/ContentDistributionChart';
import FinancialSummary from './FinancialSummary';
import SalesStats from './SalesStats';
import ContentStats from './ContentStats';

const queriesConfig = [
  { key: 'products', fn: productApi.list },
  { key: 'orders', fn: () => orderApi.list() },
  { key: 'users', fn: userApi.list },
  { key: 'blogs', fn: blogApi.list },
];

export default function Dashboard() {
  const results = useQueries({
    queries: queriesConfig.map(config => ({
      queryKey: [config.key],
      queryFn: config.fn,
    })),
  });

  const loading = results.some(result => result.isLoading);
  const [products, orders, users, blogs] = results.map(
    result => result.data || []
  );

  return (
    <Box sx={{ marginLeft: 0, width: 1 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* ردیف کارت‌های آماری */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%',
        }}
      >
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="تعداد محصولات"
            value={`${products.length} کالا`}
            icon={Storefront}
            color="#f59e0b"
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="مجموع سفارش‌ها"
            value={`${orders.length} سفارش`}
            icon={TrendingUp}
            color="#22c55e"
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="کاربران ثبت‌شده"
            value={`${users.length} نفر`}
            icon={People}
            color="#3b82f6"
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="مقالات بلاگ"
            value={`${blogs.length} مقاله`}
            icon={Article}
            color="#a855f7"
          />
        </Box>
      </Box>

      {/* ردیف اول: نمودار فروش ماهانه و توزیع محتوا */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%',
          mt: 1,
        }}
      >
        <Box
          sx={{
            flex: '1 1 calc(50% - 12px)',
            minWidth: { xs: '100%', md: 'calc(50% - 12px)' },
          }}
        >
          <SalesChart orders={orders} />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(50% - 12px)',
            minWidth: { xs: '100%', md: 'calc(50% - 12px)' },
          }}
        >
          <ContentDistributionChart
            products={products}
            orders={orders}
            users={users}
            blogs={blogs}
          />
        </Box>
      </Box>

      {/* ردیف دوم: خلاصه مالی، آمار فروش و آمار محتوا */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%',
          mt: 1,
        }}
      >
        <Box
          sx={{
            flex: '1 1 calc(33.333% - 16px)',
            minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
          }}
        >
          <FinancialSummary
            orders={orders}
            products={products}
            blogs={blogs}
            users={users}
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(33.333% - 16px)',
            minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
          }}
        >
          <SalesStats orders={orders} users={users} />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(33.333% - 16px)',
            minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
          }}
        >
          <ContentStats products={products} users={users} blogs={blogs} />
        </Box>
      </Box>
    </Box>
  );
}

