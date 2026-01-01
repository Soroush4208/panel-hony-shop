import { Card, CardContent, Typography, Box } from '@mui/material';
import StatBox from './StatBox';

export default function ContentStats({ products, users, blogs }) {
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
          آمار محتوا
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <StatBox
            label="محصولات به ازای هر کاربر"
            value={`${
              users.length > 0
                ? (products.length / users.length).toFixed(1)
                : 0
            }`}
            color="#3b82f6"
            icon="🛍️"
          />
          <StatBox
            label="نرخ انتشار مقالات"
            value={`${
              blogs.length > 0
                ? (
                    (blogs.filter(b => b.published).length / blogs.length) *
                    100
                  ).toFixed(0)
                : 0
            }%`}
            color="#a855f7"
            icon="📰"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

