import { TableCell, TextField, Select, MenuItem, Button } from '@mui/material';

const operations = [
  { value: 'set', label: 'تنظیم مقدار دقیق' },
  { value: 'increase', label: 'افزایش' },
  { value: 'decrease', label: 'کاهش' },
];

export function useInventoryTable({ products, formState, onChange, onSubmit, loading }) {
  const renderRow = product => {
    const state = formState[product.id] || { operation: 'set', quantity: '' };
    return (
      <>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.stock}</TableCell>
        <TableCell>
          <TextField
            size="small"
            type="number"
            value={state.quantity}
            onChange={event =>
              onChange(product.id, 'quantity', event.target.value)
            }
          />
        </TableCell>
        <TableCell>
          <Select
            size="small"
            value={state.operation}
            onChange={event =>
              onChange(product.id, 'operation', event.target.value)
            }
          >
            {operations.map(op => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            onClick={() => onSubmit(product.id)}
            disabled={loading}
          >
            ثبت
          </Button>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

