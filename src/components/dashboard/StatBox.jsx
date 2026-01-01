import { Box, Typography } from '@mui/material';

export default function StatBox({ label, value, color, icon }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
        },
        '&:hover': {
          background: `linear-gradient(135deg, ${color}20 0%, ${color}12 100%)`,
          transform: 'translateY(-6px)',
          boxShadow: `0 8px 24px ${color}50`,
          borderColor: `${color}50`,
        },
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon && (
          <Typography
            sx={{
              fontSize: '1.8rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          >
            {icon}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.875rem', fontWeight: 500 }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          color,
          textShadow: `0 2px 4px ${color}30`,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

