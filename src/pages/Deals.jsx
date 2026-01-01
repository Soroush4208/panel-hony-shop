import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { dealApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import DealDialog from '../components/deals/DealDialog';
import { useDealTable } from '../components/deals/DealTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function DealsPage() {
  const queryClient = useQueryClient();
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealApi.list,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: dealApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      showToast('آفر ثبت شد');
      setDialogOpen(false);
    },
    onError: err => showToast(err?.response?.data?.message || 'خطا در ثبت آفر', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: dealApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      showToast('آفر به‌روزرسانی شد');
      setDialogOpen(false);
    },
    onError: err => showToast(err?.response?.data?.message || 'خطا در ویرایش', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: dealApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      showToast('آفر حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف آفر ناموفق بود', 'error'),
  });

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const handleSubmit = values => {
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

  const sortedDeals = [...deals].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'productId':
        aValue = a.productId || '';
        bValue = b.productId || '';
        break;
      case 'discountPercent':
        aValue = Number(a.discountPercent) || 0;
        bValue = Number(b.discountPercent) || 0;
        break;
      case 'dealPrice':
        aValue = Number(a.dealPrice) || 0;
        bValue = Number(b.dealPrice) || 0;
        break;
      case 'expiresAt':
        aValue = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
        bValue = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
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
    { id: 'productId', label: 'محصول', sortable: true },
    { id: 'discountPercent', label: 'درصد تخفیف', sortable: true },
    { id: 'dealPrice', label: 'قیمت ویژه', sortable: true },
    { id: 'expiresAt', label: 'انقضا', sortable: true },
    { id: 'isActive', label: 'وضعیت', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useDealTable({
    deals: sortedDeals,
    onEdit: deal => {
      setEditing(deal);
      setDialogOpen(true);
    },
    onDelete: deal => setConfirmState({ open: true, target: deal }),
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت آفرها"
        description="ایجاد و مدیریت آفرهای ویژه محصولات"
        actionLabel="آفر جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedDeals}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="آفری ثبت نشده است"
      />

      <DealDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        deal={editing}
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
        title="حذف آفر"
        description="آیا از حذف آفر این محصول مطمئن هستید؟"
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
