import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { blogApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import BlogDialog from '../components/blogs/BlogDialog';
import { useBlogTable } from '../components/blogs/BlogTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: blogApi.list,
  });
  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [confirmState, setConfirmState] = useState({ open: false, target: null });

  const createMutation = useMutation({
    mutationFn: blogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showToast('مقاله ایجاد شد');
      setDialogOpen(false);
    },
    onError: () => showToast('ثبت مقاله ناموفق بود', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: blogApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showToast('مقاله ویرایش شد');
      setDialogOpen(false);
    },
    onError: () => showToast('ویرایش مقاله ناموفق بود', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: blogApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showToast('مقاله حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف مقاله ناموفق بود', 'error'),
  });

  const handleDeleteRequest = blog => {
    setConfirmState({ open: true, target: blog });
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
    if (!values.title || !values.title.trim()) {
      showToast('عنوان الزامی است', 'error');
      return;
    }
    if (!values.content || !values.content.trim()) {
      showToast('محتوا الزامی است', 'error');
      return;
    }

    let tags = [];
    if (values.tags && typeof values.tags === 'string') {
      tags = values.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (Array.isArray(values.tags)) {
      tags = values.tags.map(tag => String(tag).trim()).filter(Boolean);
    }

    const payload = {
      title: values.title.trim(),
      content: values.content.trim(),
      coverImage: values.coverImageFile ? '' : (values.coverImage?.trim() || ''),
      coverImageFile: values.coverImageFile || null,
      tags: tags,
      published: Boolean(values.published),
    };

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id || editingBlog._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedBlogs = [...blogs].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'title':
        aValue = a.title || '';
        bValue = b.title || '';
        break;
      case 'views':
        aValue = Number(a.views) || 0;
        bValue = Number(b.views) || 0;
        break;
      case 'published':
        aValue = a.published ? 1 : 0;
        bValue = b.published ? 1 : 0;
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
    { id: 'title', label: 'عنوان', sortable: true },
    { id: 'published', label: 'منتشر شده؟', sortable: true },
    { id: 'views', label: 'تعداد بازدید', sortable: true },
    { id: 'tags', label: 'برچسب‌ها', sortable: false },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useBlogTable({
    blogs: sortedBlogs,
    onEdit: blog => {
      setEditingBlog(blog);
      setDialogOpen(true);
    },
    onDelete: handleDeleteRequest,
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت بلاگ"
        description="انتشار نکات و آموزش‌های مرتبط با عسل"
        actionLabel="مقاله جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditingBlog(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedBlogs}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="مقاله‌ای یافت نشد"
      />

      <BlogDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        blog={editingBlog}
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
        title="حذف مقاله"
        description={`آیا از حذف "${confirmState.target?.title}" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={handleConfirmClose}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
