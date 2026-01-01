import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
} from '@mui/material';

const emptyCategory = {
  name: '',
  order: 0,
  isActive: true,
};

export default function CategoryDialog({ open, onClose, category, onSubmit, loading }) {
  const [values, setValues] = useState(() => category || emptyCategory);

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {category ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            label="نام"
            name="name"
            value={values.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="ترتیب"
            name="order"
            type="number"
            value={values.order}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography>فعال</Typography>
            <Switch
              checked={values.isActive}
              name="isActive"
              onChange={handleChange}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}

