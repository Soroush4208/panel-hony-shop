import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, Edit, Send } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { userApi } from "../api/services";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyUser = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  role: "customer"
};

const messageDefaults = {
  title: "",
  message: "",
  type: "custom",
  actionLink: ""
};

const notificationTypes = [
  { value: "custom", label: "دلخواه" },
  { value: "order", label: "پیگیری سفارش" },
  { value: "promo", label: "پیام تبلیغاتی" },
  { value: "system", label: "سیستمی" }
];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
  });

  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const [messageDialog, setMessageDialog] = useState({ open: false, user: null });
  const [messageValues, setMessageValues] = useState(messageDefaults);

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("کاربر جدید ایجاد شد");
      setDialogOpen(false);
    },
    onError: (error) => showToast(error?.response?.data?.message || "خطای ساخت کاربر", "error")
  });

  const updateMutation = useMutation({
    mutationFn: userApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("کاربر به‌روزرسانی شد");
      setDialogOpen(false);
    },
    onError: (error) => showToast(error?.response?.data?.message || "خطا در ویرایش کاربر", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("کاربر حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف کاربر ناموفق بود", "error")
  });

  const notifyMutation = useMutation({
    mutationFn: userApi.sendNotification,
    onSuccess: () => {
      showToast("پیام برای کاربر ارسال شد");
      setMessageDialog({ open: false, user: null });
      setMessageValues(messageDefaults);
    },
    onError: (error) =>
      showToast(error?.response?.data?.message || "ارسال پیام ناموفق بود", "error")
  });

  const handleDeleteRequest = (user) => {
    setConfirmState({ open: true, target: user });
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const handleConfirmClose = () => {
    if (!deleteMutation.isPending) {
      setConfirmState({ open: false, target: null });
    }
  };

  const handleSubmit = (values) => {
    const payload = { ...values };
    if (!payload.password) {
      delete payload.password;
    }
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id || editingUser._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              مدیریت کاربران
            </Typography>
            <Typography color="text.secondary">
              مدیریت نقش‌ها و اطلاعات مشتریان و مدیران
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
          >
            کاربر جدید
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام</TableCell>
                <TableCell>ایمیل</TableCell>
                <TableCell>نقش</TableCell>
                <TableCell>شماره</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id || user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingUser(user);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => {
                        setMessageDialog({ open: true, user });
                        setMessageValues(messageDefaults);
                      }}
                    >
                      <Send />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteRequest(user)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <UserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={editingUser}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <MessageDialog
        open={messageDialog.open}
        user={messageDialog.user}
        values={messageValues}
        loading={notifyMutation.isPending}
        onChange={(event) => {
          const { name, value } = event.target;
          setMessageValues((prev) => ({ ...prev, [name]: value }));
        }}
        onClose={() => {
          if (!notifyMutation.isPending) {
            setMessageDialog({ open: false, user: null });
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!messageDialog.user) return;
          notifyMutation.mutate({
            id: messageDialog.user.id || messageDialog.user._id,
            ...messageValues
          });
        }}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف کاربر"
        description={`آیا از حذف "${confirmState.target?.name}" مطمئن هستید؟`}
        confirmText="حذف کاربر"
        onConfirm={handleDeleteConfirm}
        onClose={handleConfirmClose}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

function UserDialog({ open, onClose, user, onSubmit, loading }) {
  const [values, setValues] = useState(user || emptyUser);

  useEffect(() => {
    if (user) {
      setValues({ ...user, password: "" });
    } else {
      setValues(emptyUser);
    }
  }, [user, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? "ویرایش کاربر" : "کاربر جدید"}</DialogTitle>
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
            helperText={user ? "در صورت خالی گذاشتن، بدون تغییر می‌ماند" : ""}
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

function MessageDialog({ open, onClose, user, values, onChange, onSubmit, loading }) {
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
            {notificationTypes.map((option) => (
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

