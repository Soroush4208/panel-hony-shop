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

const notificationTypes = [
  { value: 'custom', label: 'دلخواه' },
  { value: 'order', label: 'پیگیری سفارش' },
  { value: 'promo', label: 'پیام تبلیغاتی' },
  { value: 'system', label: 'سیستمی' },
];

export default function MessageDialog({
  open,
  onClose,
  user,
  values,
  onChange,
  onSubmit,
  loading,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ارسال پیام به {user?.name}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="عنوان"
            name="title"
            value={values.title}
            onChange={onChange}
            margin="dense"
            required
          />
          <TextField
            fullWidth
            label="متن پیام"
            name="message"
            value={values.message}
            onChange={onChange}
            margin="dense"
            required
            multiline
            minRows={3}
          />
          <TextField
            select
            fullWidth
            label="نوع پیام"
            name="type"
            value={values.type}
            onChange={onChange}
            margin="dense"
          >
            {notificationTypes.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="لینک اقدام (اختیاری)"
            name="actionLink"
            value={values.actionLink}
            onChange={onChange}
            margin="dense"
            placeholder="/profile/orders"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          لغو
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          ارسال
        </Button>
      </DialogActions>
    </Dialog>
  );
}

