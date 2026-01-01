import { Box, TextField, MenuItem, Stack, FormControlLabel, Checkbox } from '@mui/material';

export default function ProductBasicInfo({ values, setValues, categories }) {
  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* ردیف اول: سه ستون */}
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="نام محصول"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="برند"
            name="brand"
            value={values.brand}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            select
            label="دسته‌بندی"
            name="category"
            value={values.category}
            onChange={handleChange}
            fullWidth
            SelectProps={{ native: false }}
          >
            <MenuItem value="">بدون دسته‌بندی</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id || cat._id} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* ردیف دوم: سه ستون */}
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="واحد (مثلاً کیلو)"
            name="unit"
            value={values.unit}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="قیمت فروش (ریال)"
            name="price"
            type="number"
            value={values.price}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="قیمت اصلی (قبل تخفیف)"
            name="originalPrice"
            type="number"
            value={values.originalPrice}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </Box>

      {/* ردیف سوم: سه ستون */}
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="درصد تخفیف"
            name="discount"
            type="number"
            value={values.discount}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="موجودی انبار"
            name="stock"
            type="number"
            value={values.stock}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="برچسب‌ها (با کاما)"
            name="tags"
            value={values.tags}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </Box>

      {/* ردیف چهارم: چک‌باکس‌ها */}
      <Box sx={{ width: '100%' }}>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={values.isAvailable}
                onChange={handleChange}
                name="isAvailable"
              />
            }
            label="موجود در سایت"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={values.isFeatured}
                onChange={handleChange}
                name="isFeatured"
              />
            }
            label="محصول ویژه"
          />
        </Stack>
      </Box>
    </Box>
  );
}

