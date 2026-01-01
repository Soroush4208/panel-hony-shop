import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { reviewsApi } from '../api/services';
import useToast from '../hooks/useToast';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import ReviewFilters from '../components/reviews/ReviewFilters';
import { useReviewTable } from '../components/reviews/ReviewTable';
import { Snackbar, Alert } from '@mui/material';

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'pending', productId: '' });
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const { toast, showToast, handleClose } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => reviewsApi.list(filters),
  });

  const updateMutation = useMutation({
    mutationFn: reviewsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      showToast('وضعیت نظر به‌روزرسانی شد');
    },
    onError: () => showToast('خطا در به‌روزرسانی وضعیت', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      showToast('نظر حذف شد');
    },
    onError: () => showToast('حذف نظر ناموفق بود', 'error'),
  });

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
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
      case 'productId':
        aValue = a.productId || '';
        bValue = b.productId || '';
        break;
      case 'rating':
        aValue = Number(a.rating) || 0;
        bValue = Number(b.rating) || 0;
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

  const columns = [
    { id: 'name', label: 'نام', sortable: true },
    { id: 'email', label: 'ایمیل', sortable: true },
    { id: 'productId', label: 'محصول', sortable: true },
    { id: 'rating', label: 'امتیاز', sortable: true },
    { id: 'comment', label: 'متن نظر', sortable: false },
    { id: 'status', label: 'وضعیت', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useReviewTable({
    reviews: sortedReviews,
    onApprove: reviewId => updateMutation.mutate({ id: reviewId, status: 'approved' }),
    onReject: reviewId => updateMutation.mutate({ id: reviewId, status: 'rejected' }),
    onDelete: reviewId => deleteMutation.mutate(reviewId),
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت نظرات مشتریان"
        description="بررسی و تأیید نظرات مشتریان"
      />

      <ReviewFilters filters={filters} onFilterChange={handleFilterChange} />

      <DataTable
        columns={columns}
        data={sortedReviews}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="نظری یافت نشد"
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
