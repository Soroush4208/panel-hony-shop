import { Card, CardContent, Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const pieData = (products, orders, users, blogs) => [
  { name: 'محصولات', value: products.length, color: '#f59e0b' },
  { name: 'سفارش‌ها', value: orders.length, color: '#22c55e' },
  { name: 'کاربران', value: users.length, color: '#3b82f6' },
  { name: 'مقالات', value: blogs.length, color: '#a855f7' },
];

export default function ContentDistributionChart({
  products,
  orders,
  users,
  blogs,
}) {
  const data = pieData(products, orders, users, blogs);

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
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={3}
          fontWeight={700}
          sx={{ color: '#1a1a1a' }}
        >
          توزیع محتوا
        </Typography>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data.filter(item => item.value > 0)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '10px',
              }}
              formatter={(value, name) => [`${value} مورد`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mt: 2,
            justifyContent: 'center',
          }}
        >
          {data.map((item, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: item.color,
                }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {item.name}: {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

