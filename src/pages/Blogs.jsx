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
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { blogApi } from "../api/services";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyBlog = {
  title: "",
  content: "",
  coverImage: "",
  coverImageFile: null,
  coverImageFilePreview: "",
  tags: "",
  published: false
};

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: blogApi.list
  });
  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, target: null });

  const createMutation = useMutation({
    mutationFn: blogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      showToast("مقاله ایجاد شد");
      setDialogOpen(false);
    },
    onError: () => showToast("ثبت مقاله ناموفق بود", "error")
  });

  const updateMutation = useMutation({
    mutationFn: blogApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      showToast("مقاله ویرایش شد");
      setDialogOpen(false);
    },
    onError: () => showToast("ویرایش مقاله ناموفق بود", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: blogApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      showToast("مقاله حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف مقاله ناموفق بود", "error")
  });

  const handleDeleteRequest = (blog) => {
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

  const handleSubmit = (values) => {
    // Validate required fields
    if (!values.title || !values.title.trim()) {
      showToast("عنوان الزامی است", "error");
      return;
    }
    if (!values.content || !values.content.trim()) {
      showToast("محتوا الزامی است", "error");
      return;
    }

    // Normalize tags
    let tags = [];
    if (values.tags && typeof values.tags === 'string') {
      tags = values.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    } else if (Array.isArray(values.tags)) {
      tags = values.tags.map((tag) => String(tag).trim()).filter(Boolean);
    }

    const payload = {
      title: values.title.trim(),
      content: values.content.trim(),
      coverImage: values.coverImageFile ? '' : (values.coverImage?.trim() || ''),
      coverImageFile: values.coverImageFile || null,
      tags: tags,
      published: Boolean(values.published)
    };

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id || editingBlog._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              مدیریت بلاگ
            </Typography>
            <Typography color="text.secondary">
              انتشار نکات و آموزش‌های مرتبط با عسل
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingBlog(null);
              setDialogOpen(true);
            }}
          >
            مقاله جدید
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
                <TableCell>عنوان</TableCell>
                <TableCell>منتشر شده؟</TableCell>
                <TableCell>تعداد بازدید</TableCell>
                <TableCell>برچسب‌ها</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id || blog._id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.published ? "بله" : "خیر"}</TableCell>
                  <TableCell>{Intl.NumberFormat("fa-IR").format(blog.views || 0)}</TableCell>
                  <TableCell>{blog.tags?.join("، ")}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingBlog({
                          ...blog,
                          tags: blog.tags?.join(", ")
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteRequest(blog)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

function BlogDialog({ open, onClose, blog, onSubmit, loading }) {
  const [values, setValues] = useState(blog || emptyBlog);

  useEffect(() => {
    if (blog) {
      setValues({
        ...blog,
        tags: blog.tags?.join(", ") || "",
        coverImageFile: null,
        coverImageFilePreview: ""
      });
    } else {
      setValues(emptyBlog);
    }
  }, [blog, open]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{blog ? "ویرایش مقاله" : "مقاله جدید"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="عنوان"
            name="title"
            value={values.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!values.title?.trim()}
            helperText={!values.title?.trim() ? "عنوان الزامی است" : ""}
          />
          <Box>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              آپلود تصویر شاخص
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setValues((p) => ({
                      ...p,
                      coverImageFile: file,
                      coverImageFilePreview: preview,
                      coverImage: ""
                    }));
                  }
                }}
              />
            </Button>
            {values.coverImageFilePreview && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={values.coverImageFilePreview}
                  alt="preview"
                  sx={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 2 }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => setValues((p) => ({ ...p, coverImageFile: null, coverImageFilePreview: "" }))}
                  sx={{ mt: 1 }}
                >
                  حذف تصویر
                </Button>
              </Box>
            )}
            {values.coverImage && !values.coverImageFilePreview && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={values.coverImage}
                  alt="current"
                  sx={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 2 }}
                />
              </Box>
            )}
            <TextField
              label="یا آدرس تصویر (URL)"
              name="coverImage"
              value={values.coverImage}
              onChange={(e) => setValues((p) => ({ ...p, coverImage: e.target.value, coverImageFile: null, coverImageFilePreview: "" }))}
              fullWidth
              margin="normal"
              placeholder="https://example.com/image.jpg"
              helperText="در صورت آپلود تصویر نیازی به وارد کردن URL نیست"
            />
          </Box>
          <TextField
            label="برچسب‌ها"
            name="tags"
            value={values.tags}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="برچسب۱، برچسب۲، برچسب۳"
            helperText="برچسب‌ها را با کاما از هم جدا کنید (اختیاری)"
          />
          <TextField
            label="محتوا"
            name="content"
            value={values.content}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            minRows={5}
            required
            error={!values.content?.trim()}
            helperText={!values.content?.trim() ? "محتوا الزامی است" : ""}
          />
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
            <Typography>نمایش در بلاگ</Typography>
            <Switch
              checked={values.published}
              name="published"
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

