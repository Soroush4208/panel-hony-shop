import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
} from '@mui/material';

const emptyUser = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: 'customer',
};

export default function UserDialog({ open, onClose, user, onSubmit, loading }) {
  const [values, setValues] = useState(user || emptyUser);

  useEffect(() => {
    if (user) {
      setValues({ ...user, password: '' });
    } else {
      setValues(emptyUser);
    }
  }, [user, open]);

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'ویرایش کاربر' : 'کاربر جدید'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="نام"
            name="name"
            value={values.name}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="ایمیل"
            name="email"
            value={values.email}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="رمز عبور"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            margin="dense"
            helperText={user ? 'در صورت خالی گذاشتن، بدون تغییر می‌ماند' : ''}
          />
          <TextField
            fullWidth
            label="شماره تماس"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="آدرس"
            name="address"
            value={values.address}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            select
            fullWidth
            label="نقش"
            name="role"
            value={values.role}
            onChange={handleChange}
            margin="dense"
          >
            <MenuItem value="customer">مشتری</MenuItem>
            <MenuItem value="editor">ویرایشگر محتوا</MenuItem>
            <MenuItem value="admin">ادمین</MenuItem>
          </TextField>
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

