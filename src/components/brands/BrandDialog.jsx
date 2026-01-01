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
import { API_BASE_URL } from '../../constants/api';

const emptyBrand = {
  name: '',
  logo: '',
  logoFile: null,
  logoFilePreview: '',
  link: '',
  order: 0,
  isActive: true,
};

export default function BrandDialog({ open, onClose, brand, onSubmit, loading }) {
  const [values, setValues] = useState(emptyBrand);

  useEffect(() => {
    if (brand) {
      setValues({
        name: brand.name || '',
        logo: brand.logo || '',
        logoFile: null,
        logoFilePreview: brand.logo
          ? brand.logo.startsWith('http')
            ? brand.logo
            : `${API_BASE_URL}${brand.logo}`
          : '',
        link: brand.link || '',
        order: brand.order ?? 0,
        isActive: brand.isActive ?? true,
      });
    } else {
      setValues(emptyBrand);
    }
  }, [brand, open]);

  useEffect(() => {
    if (!values.logoFilePreview) return;
    const previewUrl = values.logoFilePreview;
    if (previewUrl.startsWith('blob:')) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [values.logoFilePreview]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!values.name || !values.logo) {
      return;
    }
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{brand ? 'ویرایش برند' : 'برند جدید'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="نام برند"
            value={values.name}
            onChange={e => setValues(p => ({ ...p, name: e.target.value }))}
            required
            fullWidth
          />
          <Box>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              آپلود لوگو
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setValues(p => ({
                      ...p,
                      logoFile: file,
                      logoFilePreview: preview,
                      logo: '',
                    }));
                  }
                }}
              />
            </Button>
            {values.logoFilePreview && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={values.logoFilePreview}
                  alt="preview"
                  sx={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 2 }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => setValues(p => ({ ...p, logoFile: null, logoFilePreview: '' }))}
                  sx={{ mt: 1 }}
                >
                  حذف لوگو
                </Button>
              </Box>
            )}
            <TextField
              label="یا آدرس لوگو (URL)"
              value={values.logo}
              onChange={e => setValues(p => ({ ...p, logo: e.target.value, logoFile: null, logoFilePreview: '' }))}
              fullWidth
              helperText="در صورت آپلود لوگو نیازی به وارد کردن URL نیست"
            />
          </Box>
          <TextField
            label="لینک (اختیاری)"
            value={values.link}
            onChange={e => setValues(p => ({ ...p, link: e.target.value }))}
            fullWidth
          />
          <TextField
            label="ترتیب نمایش"
            type="number"
            value={values.order}
            onChange={e => setValues(p => ({ ...p, order: Number(e.target.value) }))}
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

