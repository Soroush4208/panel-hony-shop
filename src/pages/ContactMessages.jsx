import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { Delete, Visibility, CheckCircle, Archive } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { contactApi } from "../api/services";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

const statusOptions = [
  { value: "", label: "همه" },
  { value: "new", label: "جدید" },
  { value: "read", label: "خوانده شده" },
  { value: "replied", label: "پاسخ داده شده" },
  { value: "archived", label: "آرشیو شده" }
];

const statusColors = {
  new: "error",
  read: "warning",
  replied: "success",
  archived: "default"
};

export default function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialog, setViewDialog] = useState({ open: false, message: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, message: null, status: "read" });
  const [replyMessage, setReplyMessage] = useState("");
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contactMessages", statusFilter, searchQuery],
    queryFn: () => contactApi.list({ status: statusFilter || undefined, search: searchQuery || undefined })
  });

  const updateStatusMutation = useMutation({
    mutationFn: contactApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
      showToast("وضعیت پیام به‌روزرسانی شد");
      setStatusDialog({ open: false, message: null, status: "read" });
      setReplyMessage("");
    },
    onError: (error) => showToast(error?.response?.data?.message || "خطا در به‌روزرسانی وضعیت", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: contactApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
      showToast("پیام حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف پیام ناموفق بود", "error")
  });

  const handleView = (message) => {
    setViewDialog({ open: true, message });
    // Mark as read if it's new
    if (message.status === "new") {
      updateStatusMutation.mutate({ id: message.id, status: "read" });
    }
  };

  const handleStatusChange = (message, newStatus) => {
    if (newStatus === "replied") {
      setStatusDialog({ open: true, message, status: newStatus });
    } else {
      updateStatusMutation.mutate({ id: message.id, status: newStatus });
    }
  };

  const handleStatusSubmit = () => {
    if (statusDialog.status === "replied" && !replyMessage.trim()) {
      showToast("لطفاً پیام پاسخ را وارد کنید", "warning");
      return;
    }
    updateStatusMutation.mutate({
      id: statusDialog.message.id,
      status: statusDialog.status,
      replyMessage: replyMessage.trim()
    });
  };

  const handleDeleteRequest = (message) => {
    setConfirmState({ open: true, target: message });
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              مدیریت پیام‌های تماس
            </Typography>
            <Typography color="text.secondary">
              مشاهده و مدیریت پیام‌های دریافتی از فرم تماس با ما
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
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
                <TableCell>ایمیل</TableCell>
                <TableCell>موضوع</TableCell>
                <TableCell>تاریخ</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">پیامی یافت نشد</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message.id || message._id} hover>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject || "-"}</TableCell>
                    <TableCell>{formatDate(message.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find((s) => s.value === message.status)?.label || message.status}
                        color={statusColors[message.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" size="small" onClick={() => handleView(message)}>
                        <Visibility />
                      </IconButton>
                      {message.status !== "replied" && (
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleStatusChange(message, "replied")}
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      {message.status !== "archived" && (
                        <IconButton
                          color="default"
                          size="small"
                          onClick={() => handleStatusChange(message, "archived")}
                        >
                          <Archive />
                        </IconButton>
                      )}
                      <IconButton color="error" size="small" onClick={() => handleDeleteRequest(message)}>
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

      {/* View Message Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, message: null })} maxWidth="md" fullWidth>
        <DialogTitle>جزئیات پیام</DialogTitle>
        <DialogContent>
          {viewDialog.message && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">نام</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{viewDialog.message.name}</Typography>

              <Typography variant="subtitle2" color="text.secondary">ایمیل</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <a href={`mailto:${viewDialog.message.email}`}>{viewDialog.message.email}</a>
              </Typography>

              {viewDialog.message.phone && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">شماره تماس</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <a href={`tel:${viewDialog.message.phone}`}>{viewDialog.message.phone}</a>
                  </Typography>
                </>
              )}

              {viewDialog.message.subject && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">موضوع</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{viewDialog.message.subject}</Typography>
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary">متن پیام</Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
                {viewDialog.message.message}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">تاریخ ارسال</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{formatDate(viewDialog.message.createdAt)}</Typography>

              {viewDialog.message.repliedAt && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">تاریخ پاسخ</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{formatDate(viewDialog.message.repliedAt)}</Typography>

                  {viewDialog.message.replyMessage && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">پاسخ شما</Typography>
                      <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap", bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
                        {viewDialog.message.replyMessage}
                      </Typography>
                    </>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, message: null })}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Reply/Status Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, message: null, status: "read" })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {statusDialog.status === "replied" ? "پاسخ به پیام" : "تغییر وضعیت"}
        </DialogTitle>
        <DialogContent>
          {statusDialog.status === "replied" ? (
            <TextField
              fullWidth
              multiline
              rows={6}
              label="پیام پاسخ"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="پیام پاسخ خود را اینجا بنویسید..."
            />
          ) : (
            <Typography sx={{ mt: 2 }}>
              آیا می‌خواهید وضعیت این پیام را به "{statusOptions.find((s) => s.value === statusDialog.status)?.label}" تغییر دهید؟
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStatusDialog({ open: false, message: null, status: "read" });
            setReplyMessage("");
          }}>
            لغو
          </Button>
          <Button onClick={handleStatusSubmit} variant="contained" disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? "در حال پردازش..." : "تأیید"}
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
        title="حذف پیام"
        description={`آیا از حذف پیام "${confirmState.target?.name}" مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

