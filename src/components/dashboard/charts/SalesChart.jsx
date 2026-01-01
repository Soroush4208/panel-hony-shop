import { Card, CardContent, Box, Typography } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPrice } from '../../../utils/format';
import dayjs from 'dayjs';

const chartDataFromOrders = (orders = []) => {
  const grouped = orders.reduce((acc, order) => {
    const month = dayjs(order.createdAt).locale('fa').format('YYYY/MM');
    if (!acc[month]) {
      acc[month] = { month, total: 0, count: 0 };
    }
    acc[month].total += order.total;
    acc[month].count += 1;
    return acc;
  }, {});
  return Object.values(grouped)
    .map(({ month, total, count }) => ({
      month,
      total: Math.round(total),
      count,
    }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));
};

export default function SalesChart({ orders }) {
  const chartData = chartDataFromOrders(orders);

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        width: '100%',
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            width: '100%',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: '#1a1a1a' }}
          >
            آمار فروش ماهانه
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#f59e0b',
                  boxShadow: '0 2px 4px rgba(245,158,11,0.3)',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                درآمد
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#3b82f6',
                  boxShadow: '0 2px 4px rgba(59,130,246,0.3)',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                تعداد سفارش
              </Typography>
            </Box>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              height={60}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={value => formatPrice(value)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '12px',
              }}
              formatter={(value, name) => {
                if (name === 'total')
                  return [formatPrice(value), 'درآمد'];
                if (name === 'count') return [value, 'تعداد سفارش'];
                return [value, name];
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="total"
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                fill: '#3b82f6',
                r: 5,
                strokeWidth: 2,
                stroke: '#fff',
              }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

