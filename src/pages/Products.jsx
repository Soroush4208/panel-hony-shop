import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { productApi, categoryApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import ProductDialog from '../components/products/ProductDialog';
import { useProductTable } from '../components/products/ProductTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.list,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    target: null,
  });
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('محصول با موفقیت اضافه شد');
      setDialogOpen(false);
    },
    onError: error =>
      showToast(
        error?.response?.data?.message || 'خطا در ایجاد محصول',
        'error'
      ),
  });

  const updateMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('محصول ویرایش شد');
      setDialogOpen(false);
    },
    onError: error =>
      showToast(error?.response?.data?.message || 'خطا در ویرایش', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('محصول حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف محصول ناموفق بود', 'error'),
  });

  const handleDeleteRequest = product => {
    setConfirmState({ open: true, target: product });
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const handleDeleteDialogClose = () => {
    if (!deleteMutation.isPending) {
      setConfirmState({ open: false, target: null });
    }
  };

  const handleSubmit = values => {
    const payload = {
      ...values,
      category: values.category?.trim() || '',
      price: Number(values.price),
      originalPrice: values.originalPrice
        ? Number(values.originalPrice)
        : undefined,
      discount: Number(values.discount || 0),
      stock: Number(values.stock),
      images: values.images || [],
      tags: values.tags
        ? values.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
    };
    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct._id || editingProduct.id,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
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
      case 'price':
        aValue = Number(a.price) || 0;
        bValue = Number(b.price) || 0;
        break;
      case 'stock':
        aValue = Number(a.stock) || 0;
        bValue = Number(b.stock) || 0;
        break;
      case 'category': {
        const catA =
          categories.find(
            c => (c.id || c._id) === a.category || c.name === a.category
          )?.name ||
          a.category ||
          '';
        const catB =
          categories.find(
            c => (c.id || c._id) === b.category || c.name === b.category
          )?.name ||
          b.category ||
          '';
        aValue = catA;
        bValue = catB;
        break;
      }
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
    { id: 'price', label: 'قیمت', sortable: true },
    { id: 'stock', label: 'موجودی', sortable: true },
    { id: 'category', label: 'دسته‌بندی', sortable: true },
    { id: 'status', label: 'وضعیت', sortable: false },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useProductTable({
    products: sortedProducts,
    categories,
    onEdit: product => {
      setEditingProduct(product);
      setDialogOpen(true);
    },
    onDelete: handleDeleteRequest,
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت محصولات"
        description="افزودن، ویرایش و حذف محصولات فروشگاه"
        actionLabel="محصول جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditingProduct(null);
          setDialogOpen(true);
        }}
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

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        product={editingProduct}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف محصول"
        description={`آیا از حذف "${confirmState.target?.name}" مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteDialogClose}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
