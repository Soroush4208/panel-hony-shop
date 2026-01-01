import { TableCell, IconButton } from '@mui/material';
import { Delete, CheckCircle, Cancel } from '@mui/icons-material';

export function useReviewTable({ reviews, onApprove, onReject, onDelete }) {
  const renderRow = review => {
    return (
      <>
        <TableCell>{review.name}</TableCell>
        <TableCell>{review.email}</TableCell>
        <TableCell>{review.productId}</TableCell>
        <TableCell>{review.rating}/5</TableCell>
        <TableCell>{review.comment}</TableCell>
        <TableCell>{review.status}</TableCell>
        <TableCell align="right">
          <IconButton
            color="success"
            onClick={() => onApprove(review.id || review._id)}
          >
            <CheckCircle />
          </IconButton>
          <IconButton
            color="warning"
            onClick={() => onReject(review.id || review._id)}
          >
            <Cancel />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(review.id || review._id)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

