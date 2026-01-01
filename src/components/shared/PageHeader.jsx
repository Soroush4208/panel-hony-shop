import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function PageHeader({ title, description, actionLabel, onAction, actionIcon }) {
  return (
    <Card sx={{ borderRadius: 4, mb: 3 }}>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {description && (
            <Typography color="text.secondary">{description}</Typography>
          )}
        </Box>
        {actionLabel && (
          <Button
            variant="contained"
            startIcon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

