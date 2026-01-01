import { Box, Card } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { orderApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import { useOrderTable } from '../components/orders/OrderTable';
import { Snackbar, Alert, TablePagination } from '@mui/material';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { toast, showToast, handleClose } = useToast();
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.list(),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['order-statuses'],
    queryFn: orderApi.statuses,
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('وضعیت سفارش به‌روزرسانی شد');
    },
    onError: () => showToast('خطا در به‌روزرسانی وضعیت', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: orderApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('سفارش حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف سفارش ناموفق بود', 'error'),
  });

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteRequest = order => {
    setConfirmState({ open: true, target: order });
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate({
        id: confirmState.target.id || confirmState.target._id,
        restock: true,
      });
    }
  };

  const handleConfirmClose = () => {
    if (!deleteMutation.isPending) {
      setConfirmState({ open: false, target: null });
    }
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'id':
        aValue = (a.id || a._id || '').slice(-6);
        bValue = (b.id || b._id || '').slice(-6);
        break;
      case 'createdAt':
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;
      case 'userName':
        aValue = a.userId?.name || '';
        bValue = b.userId?.name || '';
        break;
      case 'phone':
        aValue = a.userId?.phone || '';
        bValue = b.userId?.phone || '';
        break;
      case 'email':
        aValue = a.userId?.email || '';
        bValue = b.userId?.email || '';
        break;
      case 'total':
        aValue = Number(a.total) || 0;
        bValue = Number(b.total) || 0;
        break;
      case 'itemsCount':
        aValue = a.items?.length || 0;
        bValue = b.items?.length || 0;
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
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

  const paginatedOrders =
    rowsPerPage > 0
      ? sortedOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sortedOrders;

  const columns = [
    { id: 'id', label: 'کد سفارش', sortable: true },
    { id: 'createdAt', label: 'تاریخ', sortable: true },
    { id: 'userName', label: 'کاربر', sortable: true },
    { id: 'phone', label: 'شماره', sortable: true },
    { id: 'email', label: 'ایمیل', sortable: true },
    { id: 'total', label: 'مبلغ', sortable: true },
    { id: 'itemsCount', label: 'تعداد اقلام', sortable: true },
    { id: 'status', label: 'وضعیت', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useOrderTable({
    orders: paginatedOrders,
    statuses,
    onStatusChange: handleStatusChange,
    onDelete: handleDeleteRequest,
  });

  return (
    <Box>
      <PageHeader
        title="سفارش‌های مشتریان"
        description="بررسی وضعیت سفارش‌ها و تغییر وضعیت ارسال"
      />

      <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={paginatedOrders}
          isLoading={isLoading}
          renderRow={renderRow}
          orderBy={orderBy}
          order={order}
          onRequestSort={handleRequestSort}
          emptyMessage="سفارشی یافت نشد"
        />
        <TablePagination
          component="div"
          count={sortedOrders.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={event => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="تعداد در صفحه"
          rowsPerPageOptions={[5, 10, 25, { label: 'همه', value: -1 }]}
        />
      </Card>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف سفارش"
        description="با حذف سفارش، موجودی اقلام به انبار بازگردانده می‌شود. آیا ادامه می‌دهید؟"
        confirmText="حذف سفارش"
        onConfirm={handleDeleteConfirm}
        onClose={handleConfirmClose}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
