import { Box, Typography } from '@mui/material';

export default function SummaryRow({ label, value, icon }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderRadius: 1,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,249,250,0.8) 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.02)',
          transform: 'translateX(4px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon && (
          <Typography
            sx={{
              fontSize: '1.3rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          >
            {icon}
          </Typography>
        )}
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ fontWeight: 500, fontSize: '0.9rem' }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        fontWeight={700}
        variant="h6"
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

