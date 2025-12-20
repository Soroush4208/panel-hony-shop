import {
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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Stack,
  Chip,
  MenuItem
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { productApi, categoryApi } from "../api/services";
import { formatPrice } from "../utils/format";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyProduct = {
  name: "",
  price: "",
  description: "",
  shortDescription: "",
  unit: "کیلو",
  stock: 0,
  images: [],
  tags: "",
  originalPrice: "",
  discount: 0,
  brand: "",
  category: "",
  weight: "",
  dimensions: "",
  countryOfOrigin: "",
  features: [], // array of strings
  specifications: {}, // object key-value
  isAvailable: true,
  isFeatured: false
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("محصول با موفقیت اضافه شد");
      setDialogOpen(false);
    },
    onError: (error) => showToast(error?.response?.data?.message || "خطا در ایجاد محصول", "error")
  });

  const updateMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("محصول ویرایش شد");
      setDialogOpen(false);
    },
    onError: (error) => showToast(error?.response?.data?.message || "خطا در ویرایش", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("محصول حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف محصول ناموفق بود", "error")
  });

  const handleDeleteRequest = (product) => {
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

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      category: values.category?.trim() || "",
      price: Number(values.price),
      originalPrice: values.originalPrice ? Number(values.originalPrice) : undefined,
      discount: Number(values.discount || 0),
      stock: Number(values.stock),
      images: values.images || [],
      tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      // features is already an array
      // specifications is already an object
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id || editingProduct.id, ...payload });
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
              مدیریت محصولات
            </Typography>
            <Typography color="text.secondary">
              افزودن، ویرایش و حذف محصولات فروشگاه
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
          >
            محصول جدید
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
                <TableCell>نام</TableCell>
                <TableCell>قیمت</TableCell>
                <TableCell>موجودی</TableCell>
                <TableCell>دسته‌بندی</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const catLabel =
                  categories.find(
                    (c) =>
                      (c.id || c._id) === product.category || c.name === product.category
                  )?.name ||
                  product.category ||
                  "-";
                return (
                <TableRow key={product.id || product._id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stock} {product.unit}</TableCell>
                    <TableCell>{catLabel}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.stock > 0 ? "موجود" : "ناموجود"}
                      color={product.stock > 0 ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingProduct(product);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteRequest(product)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

function ProductDialog({ open, onClose, onSubmit, product, loading }) {
  const [values, setValues] = useState(emptyProduct);
  const [tabIndex, setTabIndex] = useState(0);
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list
  });

  // Helper states for dynamic lists
  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  useEffect(() => {
    const resolveCategoryValue = () => {
      if (!product?.category) return "";
      const match = categories.find(
        (c) =>
          (c.id || c._id) === product.category ||
          c.name === product.category
      );
      return match?.name || product.category;
    };

    if (product) {
      setValues({
        ...emptyProduct,
        ...product,
        category: resolveCategoryValue(),
        tags: product.tags?.join(", ") || "",
        features: product.features || [],
        specifications: product.specifications || {},
        price: product.price ?? "",
        originalPrice: product.originalPrice ?? "",
        discount: product.discount ?? 0,
        stock: product.stock ?? 0,
      });
    } else {
      setValues(emptyProduct);
    }
    setTabIndex(0);
  }, [product, open, categories]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const base64Files = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setValues((prev) => ({
      ...prev,
      images: [...prev.images, ...base64Files]
    }));
    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setValues(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setValues(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setValues(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const handleRemoveSpec = (key) => {
    setValues(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? "ویرایش محصول" : "محصول جدید"}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
            <Tab label="اطلاعات اصلی" />
            <Tab label="توضیحات و تصاویر" />
            <Tab label="ویژگی‌ها و مشخصات" />
          </Tabs>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, height: "400px", overflowY: "auto" }}>
          {tabIndex === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="نام محصول" name="name" value={values.name} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="برند" name="brand" value={values.brand} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="دسته‌بندی"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  fullWidth
                  SelectProps={{ native: false }}
                >
                  <MenuItem value="">بدون دسته‌بندی</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id || cat._id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="واحد (مثلاً کیلو)" name="unit" value={values.unit} onChange={handleChange} fullWidth />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField label="قیمت فروش (ریال)" name="price" type="number" value={values.price} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="قیمت اصلی (قبل تخفیف)" name="originalPrice" type="number" value={values.originalPrice} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="درصد تخفیف" name="discount" type="number" value={values.discount} onChange={handleChange} fullWidth />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="موجودی انبار" name="stock" type="number" value={values.stock} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="برچسب‌ها (با کاما)" name="tags" value={values.tags} onChange={handleChange} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={<Checkbox checked={values.isAvailable} onChange={handleChange} name="isAvailable" />}
                    label="موجود در سایت"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={values.isFeatured} onChange={handleChange} name="isFeatured" />}
                    label="محصول ویژه"
                  />
                </Stack>
              </Grid>
            </Grid>
          )}

          {tabIndex === 1 && (
            <Grid container spacing={2}>
               <Grid item xs={12}>
                <TextField label="توضیح کوتاه" name="shortDescription" value={values.shortDescription} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="توضیحات کامل" name="description" value={values.description} onChange={handleChange} fullWidth multiline rows={4} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography fontWeight={600} mb={1}>تصاویر محصول</Typography>
                <Button variant="outlined" component="label" startIcon={<Add />}>
                  آپلود تصویر
                  <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
                </Button>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  {values.images.map((image, index) => (
                    <Box key={index} sx={{ width: 80, height: 80, position: "relative", border: "1px solid #ddd", borderRadius: 2, overflow: "hidden" }}>
                      <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <IconButton size="small" color="error" onClick={() => handleRemoveImage(index)} sx={{ position: "absolute", top: 0, right: 0, bgcolor: "rgba(255,255,255,0.8)" }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}

          {tabIndex === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="وزن" name="weight" value={values.weight} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="ابعاد" name="dimensions" value={values.dimensions} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="کشور سازنده" name="countryOfOrigin" value={values.countryOfOrigin} onChange={handleChange} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>ویژگی‌های محصول (لیست)</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField 
                    size="small" 
                    fullWidth 
                    value={newFeature} 
                    onChange={(e) => setNewFeature(e.target.value)} 
                    placeholder="مثلاً: بدون مواد نگهدارنده" 
                  />
                  <Button variant="contained" onClick={handleAddFeature}>افزودن</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {values.features.map((feature, idx) => (
                    <Chip key={idx} label={feature} onDelete={() => handleRemoveFeature(idx)} />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>مشخصات فنی (جدول)</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField 
                    size="small" 
                    label="عنوان" 
                    value={newSpecKey} 
                    onChange={(e) => setNewSpecKey(e.target.value)} 
                  />
                  <TextField 
                    size="small" 
                    fullWidth 
                    label="مقدار" 
                    value={newSpecValue} 
                    onChange={(e) => setNewSpecValue(e.target.value)} 
                  />
                  <Button variant="contained" onClick={handleAddSpec}>افزودن</Button>
                </Box>
                <Stack spacing={1}>
                  {Object.entries(values.specifications).map(([key, val]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', p: 1, borderRadius: 1, border: '1px solid #eee' }}>
                      <Typography variant="body2"><strong>{key}:</strong> {val}</Typography>
                      <IconButton size="small" color="error" onClick={() => handleRemoveSpec(key)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {product ? "ویرایش محصول" : "ایجاد محصول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}