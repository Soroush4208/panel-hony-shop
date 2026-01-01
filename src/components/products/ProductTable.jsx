import { TableCell, IconButton, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { formatPrice } from '../../utils/format';

export function useProductTable({ products, categories, onEdit, onDelete }) {
  const getCategoryLabel = product => {
    const catLabel =
      categories.find(
        c =>
          (c.id || c._id) === product.category || c.name === product.category
      )?.name ||
      product.category ||
      '-';
    return catLabel;
  };

  const renderRow = product => {
    const catLabel = getCategoryLabel(product);
    return (
      <>
        <TableCell>{product.name}</TableCell>
        <TableCell>{formatPrice(product.price)}</TableCell>
        <TableCell>
          {product.stock} {product.unit}
        </TableCell>
        <TableCell>{catLabel}</TableCell>
        <TableCell>
          <Chip
            label={product.stock > 0 ? 'موجود' : 'ناموجود'}
            color={product.stock > 0 ? 'success' : 'error'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(product)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(product)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

