import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { inventoryApi } from '../api/services';
import useToast from '../hooks/useToast';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import { useInventoryTable } from '../components/inventory/InventoryTable';
import { Snackbar, Alert } from '@mui/material';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.list,
  });

  const { toast, showToast, handleClose } = useToast();
  const [formState, setFormState] = useState({});
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  const adjustMutation = useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('موجودی به‌روزرسانی شد');
    },
    onError: () => showToast('خطا در به‌روزرسانی موجودی', 'error'),
  });

  const handleChange = (productId, field, value) => {
    setFormState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = productId => {
    const payload = formState[productId];
    if (!payload?.quantity) {
      showToast('لطفاً مقدار را وارد کنید', 'warning');
      return;
    }
    adjustMutation.mutate({
      productId,
      quantity: Number(payload.quantity),
      operation: payload.operation || 'set',
    });
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'stock':
        aValue = Number(a.stock) || 0;
        bValue = Number(b.stock) || 0;
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
    { id: 'name', label: 'نام محصول', sortable: true },
    { id: 'stock', label: 'موجودی فعلی', sortable: true },
    { id: 'quantity', label: 'مقدار جدید', sortable: false },
    { id: 'operation', label: 'نوع عملیات', sortable: false },
    { id: 'action', label: 'اقدام', sortable: false },
  ];

  const { renderRow } = useInventoryTable({
    products: sortedProducts,
    formState,
    onChange: handleChange,
    onSubmit: handleSubmit,
    loading: adjustMutation.isPending,
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت موجودی"
        description="کنترل لحظه‌ای موجودی و تنظیم انبار محصولات"
      />

      <DataTable
        columns={columns}
        data={sortedProducts}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="محصولی یافت نشد"
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
