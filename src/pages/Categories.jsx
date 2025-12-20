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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyCategory = {
  name: '',
  order: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });
  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    target: null,
  });

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('دسته‌بندی ایجاد شد');
      setDialogOpen(false);
    },
    onError: () => showToast('ثبت دسته‌بندی ناموفق بود', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: categoryApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('دسته‌بندی ویرایش شد');
      setDialogOpen(false);
    },
    onError: () => showToast('ویرایش دسته‌بندی ناموفق بود', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('دسته‌بندی حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف دسته‌بندی ناموفق بود', 'error'),
  });

  const handleSubmit = values => {
    if (!values.name || !values.name.trim()) {
      showToast('نام دسته‌بندی الزامی است', 'error');
      return;
    }
    const payload = {
      name: values.name.trim(),
      order: Number(values.order) || 0,
      isActive: Boolean(values.isActive),
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  return (
    <Box>
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
              مدیریت دسته‌بندی‌ها
            </Typography>
            <Typography color="text.secondary">
              تعریف و مدیریت دسته‌بندی محصولات
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            دسته‌بندی جدید
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
                <TableCell>ترتیب</TableCell>
                <TableCell>فعال؟</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id || cat._id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.order ?? 0}</TableCell>
                  <TableCell>{cat.isActive ? 'بله' : 'خیر'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditing(cat);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() =>
                        setConfirmState({ open: true, target: cat })
                      }
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CategoryDialog
        key={`${editing?.id || editing?._id || 'new'}-${
          dialogOpen ? 'open' : 'closed'
        }`}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        category={editing}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={confirmState.open}
        title="حذف دسته‌بندی"
        description={`آیا از حذف "${confirmState.target?.name}" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={toast.severity || 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function CategoryDialog({ open, onClose, category, onSubmit, loading }) {
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
