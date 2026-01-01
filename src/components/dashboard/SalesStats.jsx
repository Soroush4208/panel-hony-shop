import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatPrice } from '../../utils/format';
import StatBox from './StatBox';

export default function SalesStats({ orders, users }) {
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
          mb={3}
          fontWeight={700}
          sx={{ color: '#1a1a1a' }}
        >
          آمار فروش
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <StatBox
            label="میانگین ارزش سفارش"
            value={
              orders.length > 0
                ? formatPrice(totalRevenue / orders.length)
                : formatPrice(0)
            }
            color="#f59e0b"
            icon="💰"
          />
          <StatBox
            label="نرخ تبدیل"
            value={`${
              orders.length > 0 && users.length > 0
                ? ((orders.length / users.length) * 100).toFixed(1)
                : 0
            }%`}
            color="#22c55e"
            icon="📈"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

