import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { userApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import UserDialog from '../components/users/UserDialog';
import MessageDialog from '../components/users/MessageDialog';
import { useUserTable } from '../components/users/UserTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

const messageDefaults = {
  title: '',
  message: '',
  type: 'custom',
  actionLink: '',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.list,
  });

  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const [messageDialog, setMessageDialog] = useState({ open: false, user: null });
  const [messageValues, setMessageValues] = useState(messageDefaults);

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('کاربر جدید ایجاد شد');
      setDialogOpen(false);
    },
    onError: error =>
      showToast(error?.response?.data?.message || 'خطای ساخت کاربر', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: userApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('کاربر به‌روزرسانی شد');
      setDialogOpen(false);
    },
    onError: error =>
      showToast(error?.response?.data?.message || 'خطا در ویرایش کاربر', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('کاربر حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف کاربر ناموفق بود', 'error'),
  });

  const notifyMutation = useMutation({
    mutationFn: userApi.sendNotification,
    onSuccess: () => {
      showToast('پیام برای کاربر ارسال شد');
      setMessageDialog({ open: false, user: null });
      setMessageValues(messageDefaults);
    },
    onError: error =>
      showToast(error?.response?.data?.message || 'ارسال پیام ناموفق بود', 'error'),
  });

  const handleDeleteRequest = user => {
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

  const handleSubmit = values => {
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

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      case 'role':
        aValue = a.role || '';
        bValue = b.role || '';
        break;
      case 'phone':
        aValue = a.phone || '';
        bValue = b.phone || '';
        break;
      default:
        return 0;
    }

    return order === 'asc'
      ? aValue.localeCompare(bValue, 'fa')
      : bValue.localeCompare(aValue, 'fa');
  });

  const columns = [
    { id: 'name', label: 'نام', sortable: true },
    { id: 'email', label: 'ایمیل', sortable: true },
    { id: 'role', label: 'نقش', sortable: true },
    { id: 'phone', label: 'شماره', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useUserTable({
    users: sortedUsers,
    onEdit: user => {
      setEditingUser(user);
      setDialogOpen(true);
    },
    onDelete: handleDeleteRequest,
    onSendMessage: user => {
      setMessageDialog({ open: true, user });
      setMessageValues(messageDefaults);
    },
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت کاربران"
        description="مدیریت نقش‌ها و اطلاعات مشتریان و مدیران"
        actionLabel="کاربر جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditingUser(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedUsers}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="کاربری یافت نشد"
      />

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
        onChange={event => {
          const { name, value } = event.target;
          setMessageValues(prev => ({ ...prev, [name]: value }));
        }}
        onClose={() => {
          if (!notifyMutation.isPending) {
            setMessageDialog({ open: false, user: null });
          }
        }}
        onSubmit={event => {
          event.preventDefault();
          if (!messageDialog.user) return;
          notifyMutation.mutate({
            id: messageDialog.user.id || messageDialog.user._id,
            ...messageValues,
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
