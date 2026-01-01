import { Card, CardContent, Box, TextField, MenuItem } from '@mui/material';

export default function ReviewFilters({ filters, onFilterChange }) {
  return (
    <Card sx={{ borderRadius: 4, mb: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            select
            label="وضعیت"
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="pending">در انتظار تأیید</MenuItem>
            <MenuItem value="approved">تأیید شده</MenuItem>
            <MenuItem value="rejected">رد شده</MenuItem>
          </TextField>
          <TextField
            label="شناسه محصول"
            name="productId"
            value={filters.productId}
            onChange={onFilterChange}
            size="small"
            sx={{ minWidth: 240 }}
            placeholder="Product ID"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

