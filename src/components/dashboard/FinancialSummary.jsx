import { Card, CardContent, Box, Typography } from '@mui/material';
import { formatPrice } from '../../utils/format';
import SummaryRow from './SummaryRow';

export default function FinancialSummary({ orders, products, blogs, users }) {
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        height: '100%',
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={2}
          fontWeight={700}
          sx={{ color: '#1a1a1a' }}
        >
          خلاصه مالی
        </Typography>
        <Box
          sx={{
            mb: 3,
            p: 3,
            background:
              'linear-gradient(135deg, #f59e0b15 0%, #f59e0b08 100%)',
            borderRadius: 1,
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            mb={1}
            sx={{ fontWeight: 500 }}
          >
            مجموع درآمد
          </Typography>
          <Typography
            variant="h4"
            sx={{ color: '#f59e0b' }}
            fontWeight={700}
          >
            {formatPrice(totalRevenue)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SummaryRow
            label="محصولات فعال"
            value={`${products.length}`}
            icon="📦"
          />
          <SummaryRow
            label="سفارش‌های معلق"
            value={orders.filter(o => o.status === 'pending').length}
            icon="⏳"
          />
          <SummaryRow
            label="مقالات منتشرشده"
            value={blogs.filter(b => b.published).length}
            icon="📝"
          />
          <SummaryRow
            label="کاربران ادمین"
            value={users.filter(u => u.role === 'admin').length}
            icon="👤"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

