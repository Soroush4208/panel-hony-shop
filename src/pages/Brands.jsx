import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { brandApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import BrandDialog from '../components/brands/BrandDialog';
import { useBrandTable } from '../components/brands/BrandTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: brandApi.list,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [confirmState, setConfirmState] = useState({
    open: false,
    target: null,
  });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: brandApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      showToast('برند ثبت شد');
      setDialogOpen(false);
    },
    onError: err =>
      showToast(err?.response?.data?.message || 'خطا در ثبت برند', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: brandApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      showToast('برند به‌روزرسانی شد');
      setDialogOpen(false);
    },
    onError: err =>
      showToast(err?.response?.data?.message || 'خطا در ویرایش', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: brandApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      showToast('برند حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف برند ناموفق بود', 'error'),
  });

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const handleSubmit = values => {
    if (!values.name || !values.logo) {
      showToast('نام و لوگو الزامی است', 'warning');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedBrands = [...brands].sort((a, b) => {
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
    { id: 'logo', label: 'لوگو', sortable: false },
    { id: 'order', label: 'ترتیب', sortable: true },
    { id: 'isActive', label: 'وضعیت', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useBrandTable({
    brands: sortedBrands,
    onEdit: brand => {
      setEditing(brand);
      setDialogOpen(true);
    },
    onDelete: brand => setConfirmState({ open: true, target: brand }),
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت برندها"
        description="لوگو و لینک برندها را تنظیم کنید"
        actionLabel="برند جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedBrands}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="برندی ثبت نشده است"
      />

      <BrandDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        brand={editing}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف برند"
        description={`آیا از حذف برند "${
          confirmState.target?.name || ''
        }" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
