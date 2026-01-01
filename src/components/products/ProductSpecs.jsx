import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useState } from 'react';

export default function ProductSpecs({ values, setValues }) {
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setValues(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = index => {
    setValues(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setValues(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim(),
        },
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpec = key => {
    setValues(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* ردیف اول: سه ستون */}
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="وزن"
            name="weight"
            value={values.weight}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="ابعاد"
            name="dimensions"
            value={values.dimensions}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="کشور سازنده"
            name="countryOfOrigin"
            value={values.countryOfOrigin}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </Box>

      {/* ردیف دوم: ویژگی‌های محصول */}
      <Box sx={{ width: '100%' }}>
        <Typography variant="subtitle2" gutterBottom>
          ویژگی‌های محصول (لیست)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={newFeature}
            onChange={e => setNewFeature(e.target.value)}
            placeholder="مثلاً: بدون مواد نگهدارنده"
          />
          <Button variant="contained" onClick={handleAddFeature}>
            افزودن
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {values.features.map((feature, idx) => (
            <Chip
              key={idx}
              label={feature}
              onDelete={() => handleRemoveFeature(idx)}
            />
          ))}
        </Box>
      </Box>

      {/* ردیف سوم: مشخصات فنی */}
      <Box sx={{ width: '100%' }}>
        <Typography variant="subtitle2" gutterBottom>
          مشخصات فنی (جدول)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            label="عنوان"
            value={newSpecKey}
            onChange={e => setNewSpecKey(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="مقدار"
            value={newSpecValue}
            onChange={e => setNewSpecValue(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={handleAddSpec}>
            افزودن
          </Button>
        </Box>
        <Stack spacing={1}>
          {Object.entries(values.specifications).map(([key, val]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1,
                border: '1px solid #eee',
              }}
            >
              <Typography variant="body2">
                <strong>{key}:</strong> {val}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveSpec(key)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

