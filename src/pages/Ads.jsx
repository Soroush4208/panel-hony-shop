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
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Add, Delete, Edit } from "@mui/icons-material";
import { adsApi } from "../api/services";
import useToast from "../hooks/useToast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const emptyAd = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  imageFile: null,
  imageFilePreview: "",
  ctaLabel: "مشاهده",
  ctaLink: "/",
  placement: "hero",
  priority: 1,
  active: true
};

const placementOptions = [
  { value: "hero", label: "بنر صفحه اصلی" },
  { value: "carousel", label: "اسلایدر تبلیغات" },
  { value: "sidebar", label: "ستون کناری" },
  { value: "footer", label: "فوتر سایت" }
];

export default function AdsPage() {
  const queryClient = useQueryClient();
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: () => adsApi.list()
  });
  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const createMutation = useMutation({
    mutationFn: adsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      showToast("تبلیغ جدید ذخیره شد");
      setDialogOpen(false);
    },
    onError: () => showToast("ایجاد تبلیغ با خطا مواجه شد", "error")
  });

  const updateMutation = useMutation({
    mutationFn: adsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      showToast("تبلیغ ویرایش شد");
      setDialogOpen(false);
    },
    onError: () => showToast("ویرایش تبلیغ ناموفق بود", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: adsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      showToast("تبلیغ حذف شد");
    },
    onError: () => showToast("حذف تبلیغ ناموفق بود", "error")
  });

  const handleSubmit = (values) => {
    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id || editingAd._id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <Typography variant="h5" fontWeight={700}>
              مدیریت تبلیغات
            </Typography>
            <Typography color="text.secondary">
              افزودن بنرهای تبلیغاتی برای صفحه اصلی و سایر بخش‌ها
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingAd(null);
              setDialogOpen(true);
            }}
          >
            تبلیغ جدید
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
                <TableCell>مکان نمایش</TableCell>
                <TableCell>CTA</TableCell>
                <TableCell>اولویت</TableCell>
                <TableCell>فعال</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id || ad._id} hover>
                  <TableCell>{ad.title}</TableCell>
                  <TableCell>
                    {placementOptions.find((opt) => opt.value === ad.placement)?.label || ad.placement}
                  </TableCell>
                  <TableCell>{ad.ctaLabel}</TableCell>
                  <TableCell>{ad.priority}</TableCell>
                  <TableCell>{ad.active ? "بله" : "خیر"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingAd(ad);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => deleteMutation.mutate(ad.id || ad._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AdDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        ad={editingAd}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function AdDialog({ open, onClose, ad, onSubmit, loading }) {
  const [values, setValues] = useState(emptyAd);

  useEffect(() => {
    if (ad) {
      setValues({
        ...emptyAd,
        ...ad,
        imageFile: null,
        imageFilePreview: ""
      });
    } else {
      setValues(emptyAd);
    }
  }, [ad, open]);

  useEffect(() => {
    if (!values.imageFilePreview) {
      return undefined;
    }
    const previewUrl = values.imageFilePreview;
    return () => URL.revokeObjectURL(previewUrl);
  }, [values.imageFilePreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (event) => {
    setValues((prev) => ({ ...prev, active: event.target.checked }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setValues((prev) => ({
      ...prev,
      imageFile: file,
      imageFilePreview: preview
    }));
  };

  const currentPreview = () => {
    if (values.imageFilePreview) return values.imageFilePreview;
    if (values.image?.startsWith("http")) return values.image;
    if (values.image) return `${API_BASE}${values.image}`;
    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{ad ? "ویرایش تبلیغ" : "تبلیغ جدید"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="عنوان"
                name="title"
                value={values.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="زیرعنوان"
                name="subtitle"
                value={values.subtitle}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="توضیحات"
                name="description"
                value={values.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="آدرس تصویر (URL) (در صورت عدم آپلود)"
                name="image"
                value={values.image}
                onChange={handleChange}
                fullWidth
                helperText="در صورت آپلود تصویر نیازی به وارد کردن لینک نیست"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                آپلود تصویر
                <input hidden type="file" accept="image/*" onChange={handleFileChange} />
              </Button>
              {currentPreview() && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    پیش‌نمایش
                  </Typography>
                  <Box
                    component="img"
                    src={currentPreview()}
                    alt="preview"
                    sx={{ mt: 1, width: 200, height: 120, objectFit: "cover", borderRadius: 2 }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="محل نمایش"
                name="placement"
                value={values.placement}
                onChange={handleChange}
                fullWidth
              >
                {placementOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="برچسب CTA"
                name="ctaLabel"
                value={values.ctaLabel}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="لینک CTA"
                name="ctaLink"
                value={values.ctaLink}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="اولویت نمایش"
                name="priority"
                type="number"
                value={values.priority}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="تاریخ شروع (اختیاری)"
                name="startAt"
                type="date"
                value={values.startAt ? values.startAt.slice(0, 10) : ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="تاریخ پایان (اختیاری)"
                name="endAt"
                type="date"
                value={values.endAt ? values.endAt.slice(0, 10) : ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">فعال</Typography>
              <Switch checked={values.active} onChange={handleToggle} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}

