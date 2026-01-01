import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { categoryApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import CategoryDialog from '../components/categories/CategoryDialog';
import { useCategoryTable } from '../components/categories/CategoryTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });
  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
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

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'order':
        aValue = Number(a.order) || 0;
        bValue = Number(b.order) || 0;
        break;
      case 'isActive':
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string') {
      return order === 'asc'
        ? aValue.localeCompare(bValue, 'fa')
        : bValue.localeCompare(aValue, 'fa');
    } else {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const columns = [
    { id: 'name', label: 'نام', sortable: true },
    { id: 'order', label: 'ترتیب', sortable: true },
    { id: 'isActive', label: 'فعال؟', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useCategoryTable({
    categories: sortedCategories,
    onEdit: category => {
      setEditing(category);
      setDialogOpen(true);
    },
    onDelete: category => setConfirmState({ open: true, target: category }),
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت دسته‌بندی‌ها"
        description="تعریف و مدیریت دسته‌بندی محصولات"
        actionLabel="دسته‌بندی جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedCategories}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="دسته‌بندی‌ای یافت نشد"
      />

      <CategoryDialog
        key={`${editing?.id || editing?._id || 'new'}-${dialogOpen ? 'open' : 'closed'}`}
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
