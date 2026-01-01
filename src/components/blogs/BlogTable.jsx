import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export function useBlogTable({ blogs, onEdit, onDelete }) {
  const renderRow = blog => {
    return (
      <>
        <TableCell>{blog.title}</TableCell>
        <TableCell>{blog.published ? 'بله' : 'خیر'}</TableCell>
        <TableCell>
          {Intl.NumberFormat('fa-IR').format(blog.views || 0)}
        </TableCell>
        <TableCell>{blog.tags?.join('، ')}</TableCell>
        <TableCell align="right">
          <IconButton
            color="primary"
            onClick={() => {
              onEdit({
                ...blog,
                tags: blog.tags?.join(', '),
              });
            }}
          >
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(blog)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

