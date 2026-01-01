import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../api/services';
import ProductBasicInfo from './ProductBasicInfo';
import ProductDescription from './ProductDescription';
import ProductSpecs from './ProductSpecs';

const emptyProduct = {
  name: '',
  price: '',
  description: '',
  shortDescription: '',
  unit: 'کیلو',
  stock: 0,
  images: [],
  tags: '',
  originalPrice: '',
  discount: 0,
  brand: '',
  category: '',
  weight: '',
  dimensions: '',
  countryOfOrigin: '',
  features: [],
  specifications: {},
  isAvailable: true,
  isFeatured: false,
};

export default function ProductDialog({
  open,
  onClose,
  onSubmit,
  product,
  loading,
}) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });

  const initialValues = useMemo(() => {
    if (!product) return emptyProduct;

    const resolveCategoryValue = () => {
      if (!product?.category) return '';
      const match = categories.find(
        c => (c.id || c._id) === product.category || c.name === product.category
      );
      return match?.name || product.category;
    };

    return {
      ...emptyProduct,
      ...product,
      category: resolveCategoryValue(),
      tags: product.tags?.join(', ') || '',
      features: product.features || [],
      specifications: product.specifications || {},
      price: product.price ?? '',
      originalPrice: product.originalPrice ?? '',
      discount: product.discount ?? 0,
      stock: product.stock ?? 0,
    };
  }, [product, categories]);

  const [values, setValues] = useState(() => initialValues);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(values);
  };

  const handleClose = () => {
    if (!loading) {
      setTabIndex(0);
      onClose();
    }
  };

  // Use key to reset component state when dialog opens/closes or product changes
  const dialogKey = useMemo(() => {
    const productId = product?.id || product?._id;
    return productId
      ? `product-${productId}-${open ? 'open' : 'closed'}`
      : `new-product-${open ? 'open' : 'closed'}`;
  }, [product, open]);

  return (
    <Dialog
      key={dialogKey}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {product ? 'ویرایش محصول' : 'محصول جدید'}
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
            <Tab label="اطلاعات اصلی" />
            <Tab label="توضیحات و تصاویر" />
            <Tab label="ویژگی‌ها و مشخصات" />
          </Tabs>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {tabIndex === 0 && (
            <ProductBasicInfo
              values={values}
              setValues={setValues}
              categories={categories}
            />
          )}
          {tabIndex === 1 && (
            <ProductDescription values={values} setValues={setValues} />
          )}
          {tabIndex === 2 && (
            <ProductSpecs values={values} setValues={setValues} />
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}
      >
        <Button onClick={handleClose} disabled={loading}>
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          type="submit"
        >
          {loading
            ? 'در حال ذخیره...'
            : product
            ? 'ویرایش محصول'
            : 'ایجاد محصول'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
