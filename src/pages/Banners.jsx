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
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
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
import { bannerApi } from "../api/services";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

const placements = [
  { value: "hero", label: "بنر اصلی" },
  { value: "promo", label: "بنر تبلیغاتی" },
  { value: "grid", label: "بنر شبکه‌ای/کوچک" },
  { value: "mini", label: "بنر مینی" }
];

const emptyBanner = {
  title: "",
  subtitle: "",
  image: "",
  imageFile: null,
  imageFilePreview: "",
  link: "",
  placement: "hero",
  order: 0,
  isActive: true
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function BannersPage() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.list
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(emptyBanner);
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: bannerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      showToast("بنر ثبت شد");
      setDialogOpen(false);
    },
    onError: (err) => showToast(err?.response?.data?.message || "خطا در ثبت بنر", "error")
  });

  const updateMutation = useMutation({
    mutationFn: bannerApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      showToast("بنر به‌روزرسانی شد");
      setDialogOpen(false);
    },
    onError: (err) => showToast(err?.response?.data?.message || "خطا در ویرایش", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: bannerApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      showToast("بنر حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف بنر ناموفق بود", "error")
  });

  useEffect(() => {
    if (editing) {
      setValues({
        title: editing.title || "",
        subtitle: editing.subtitle || "",
        image: editing.image || "",
        imageFile: null,
        imageFilePreview: editing.image ? (editing.image.startsWith("http") ? editing.image : `${API_BASE}${editing.image}`) : "",
        link: editing.link || "",
        placement: editing.placement || "hero",
        order: editing.order ?? 0,
        isActive: editing.isActive ?? true
      });
    } else {
      setValues(emptyBanner);
    }
  }, [editing, dialogOpen]);

  useEffect(() => {
    if (!values.imageFilePreview) return;
    const previewUrl = values.imageFilePreview;
    if (previewUrl.startsWith("blob:")) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [values.imageFilePreview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              مدیریت بنرها
            </Typography>
            <Typography color="text.secondary">بنرهای هدر، پرومو و شبکه‌ای</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            بنر جدید
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
                <TableCell>جایگاه</TableCell>
                <TableCell>ترتیب</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">بنری ثبت نشده است</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id || banner._id} hover>
                    <TableCell>{banner.title || "بدون عنوان"}</TableCell>
                    <TableCell>
                      {placements.find((p) => p.value === banner.placement)?.label || banner.placement}
                    </TableCell>
                    <TableCell>{banner.order ?? 0}</TableCell>
                    <TableCell>{banner.isActive ? "فعال" : "غیرفعال"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditing(banner);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => setConfirmState({ open: true, target: banner })}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "ویرایش بنر" : "بنر جدید"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="عنوان"
              name="title"
              value={values.title}
              onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="زیرعنوان"
              name="subtitle"
              value={values.subtitle}
              onChange={(e) => setValues((p) => ({ ...p, subtitle: e.target.value }))}
              fullWidth
            />
            <Box>
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                آپلود تصویر
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
                        imageFile: file,
                        imageFilePreview: preview,
                        image: ""
                      }));
                    }
                  }}
                />
              </Button>
              {values.imageFilePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={values.imageFilePreview}
                    alt="preview"
                    sx={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 2 }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setValues((p) => ({ ...p, imageFile: null, imageFilePreview: "" }))}
                    sx={{ mt: 1 }}
                  >
                    حذف تصویر
                  </Button>
                </Box>
              )}
              <TextField
                label="یا آدرس تصویر (URL)"
                name="image"
                value={values.image}
                onChange={(e) => setValues((p) => ({ ...p, image: e.target.value, imageFile: null, imageFilePreview: "" }))}
                fullWidth
                helperText="در صورت آپلود تصویر نیازی به وارد کردن URL نیست"
              />
            </Box>
            <TextField
              label="لینک"
              name="link"
              value={values.link}
              onChange={(e) => setValues((p) => ({ ...p, link: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>موقعیت</InputLabel>
              <Select
                value={values.placement}
                onChange={(e) => setValues((p) => ({ ...p, placement: e.target.value }))}
                label="موقعیت"
              >
                {placements.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="ترتیب"
              type="number"
              value={values.order}
              onChange={(e) => setValues((p) => ({ ...p, order: Number(e.target.value) }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>وضعیت</InputLabel>
              <Select
                value={values.isActive ? "active" : "inactive"}
                onChange={(e) => setValues((p) => ({ ...p, isActive: e.target.value === "active" }))}
                label="وضعیت"
              >
                <MenuItem value="active">فعال</MenuItem>
                <MenuItem value="inactive">غیرفعال</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>لغو</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف بنر"
        description={`آیا از حذف بنر "${confirmState.target?.title || ""}" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

