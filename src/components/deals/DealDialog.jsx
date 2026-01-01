import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import JalaliDatePicker from '../JalaliDatePicker';

const emptyDeal = {
  productId: '',
  title: '',
  discountPercent: 0,
  dealPrice: '',
  expiresAt: '',
  isActive: true,
};

export default function DealDialog({ open, onClose, deal, onSubmit, loading }) {
  const [values, setValues] = useState(emptyDeal);

  useEffect(() => {
    if (deal) {
      setValues({
        productId: deal.productId || '',
        title: deal.title || '',
        discountPercent: deal.discountPercent || 0,
        dealPrice: deal.dealPrice ?? '',
        expiresAt: deal.expiresAt ? deal.expiresAt.split('T')[0] : '',
        isActive: deal.isActive ?? true,
      });
    } else {
      setValues(emptyDeal);
    }
  }, [deal, open]);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{deal ? 'ویرایش آفر' : 'آفر جدید'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="شناسه محصول (ObjectId)"
            value={values.productId}
            onChange={e => setValues(p => ({ ...p, productId: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="عنوان آفر (اختیاری)"
            value={values.title}
            onChange={e => setValues(p => ({ ...p, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="درصد تخفیف"
            type="number"
            value={values.discountPercent}
            onChange={e => setValues(p => ({ ...p, discountPercent: Number(e.target.value) }))}
            fullWidth
          />
          <TextField
            label="قیمت ویژه (اختیاری)"
            type="number"
            value={values.dealPrice}
            onChange={e => setValues(p => ({ ...p, dealPrice: e.target.value }))}
            fullWidth
          />
          <JalaliDatePicker
            label="تاریخ انقضا"
            value={values.expiresAt}
            onChange={e => setValues(p => ({ ...p, expiresAt: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>وضعیت</InputLabel>
            <Select
              value={values.isActive ? 'active' : 'inactive'}
              onChange={e => setValues(p => ({ ...p, isActive: e.target.value === 'active' }))}
              label="وضعیت"
            >
              <MenuItem value="active">فعال</MenuItem>
              <MenuItem value="inactive">غیرفعال</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

