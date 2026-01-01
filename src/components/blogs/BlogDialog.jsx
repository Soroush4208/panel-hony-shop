import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
} from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const emptyBlog = {
  title: '',
  content: '',
  coverImage: '',
  coverImageFile: null,
  coverImageFilePreview: '',
  tags: '',
  published: false,
};

export default function BlogDialog({ open, onClose, blog, onSubmit, loading }) {
  const [values, setValues] = useState(blog || emptyBlog);

  const editor = useEditor({
    extensions: [StarterKit],
    content: values.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      setValues(prev => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    if (blog) {
      setValues({
        ...blog,
        tags: blog.tags?.join(', ') || '',
        coverImageFile: null,
        coverImageFilePreview: '',
      });
    } else {
      setValues(emptyBlog);
    }
  }, [blog, open]);

  // Update editor content when values.content changes externally
  useEffect(() => {
    if (editor && values.content !== editor.getHTML()) {
      editor.commands.setContent(values.content || '');
    }
  }, [values.content, editor]);

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(values);
  };

  if (!editor) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{blog ? 'ویرایش مقاله' : 'مقاله جدید'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="عنوان"
            name="title"
            value={values.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!values.title?.trim()}
            helperText={!values.title?.trim() ? 'عنوان الزامی است' : ''}
          />
          <Box>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              آپلود تصویر شاخص
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setValues(p => ({
                      ...p,
                      coverImageFile: file,
                      coverImageFilePreview: preview,
                      coverImage: '',
                    }));
                  }
                }}
              />
            </Button>
            {values.coverImageFilePreview && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={values.coverImageFilePreview}
                  alt="preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    setValues(p => ({
                      ...p,
                      coverImageFile: null,
                      coverImageFilePreview: '',
                    }))
                  }
                  sx={{ mt: 1 }}
                >
                  حذف تصویر
                </Button>
              </Box>
            )}
            {values.coverImage && !values.coverImageFilePreview && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={values.coverImage}
                  alt="current"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
              </Box>
            )}
            <TextField
              label="یا آدرس تصویر (URL)"
              name="coverImage"
              value={values.coverImage}
              onChange={e =>
                setValues(p => ({
                  ...p,
                  coverImage: e.target.value,
                  coverImageFile: null,
                  coverImageFilePreview: '',
                }))
              }
              fullWidth
              margin="normal"
              placeholder="https://example.com/image.jpg"
              helperText="در صورت آپلود تصویر نیازی به وارد کردن URL نیست"
            />
          </Box>
          <TextField
            label="برچسب‌ها"
            name="tags"
            value={values.tags}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="برچسب۱، برچسب۲، برچسب۳"
            helperText="برچسب‌ها را با کاما از هم جدا کنید (اختیاری)"
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              محتوا {!values.content?.trim() && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: !values.content?.trim() ? 'error.main' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                width: '100%',
                '& .tiptap': {
                  minHeight: '300px',
                  padding: 2,
                  '& p.is-editor-empty:first-child::before': {
                    content: 'attr(data-placeholder)',
                    float: 'right',
                    color: '#adb5bd',
                    pointerEvents: 'none',
                    height: 0,
                  },
                  '& p': {
                    margin: '0.5em 0',
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    margin: '0.5em 0',
                    fontWeight: 600,
                  },
                  '& ul, & ol': {
                    paddingRight: '1.5em',
                    margin: '0.5em 0',
                  },
                  '& strong': {
                    fontWeight: 700,
                  },
                  '& em': {
                    fontStyle: 'italic',
                  },
                  '& code': {
                    backgroundColor: '#f4f4f4',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                  },
                  '& pre': {
                    backgroundColor: '#f4f4f4',
                    padding: '1em',
                    borderRadius: '4px',
                    overflow: 'auto',
                  },
                  '& blockquote': {
                    borderRight: '4px solid #ddd',
                    paddingRight: '1em',
                    margin: '1em 0',
                    fontStyle: 'italic',
                  },
                },
              }}
            >
              <Box
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  p: 1,
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  size="small"
                  variant={editor.isActive('bold') ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  <strong>B</strong>
                </Button>
                <Button
                  size="small"
                  variant={editor.isActive('italic') ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  <em>I</em>
                </Button>
                <Button
                  size="small"
                  variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  H1
                </Button>
                <Button
                  size="small"
                  variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  H2
                </Button>
                <Button
                  size="small"
                  variant={editor.isActive('bulletList') ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  •
                </Button>
                <Button
                  size="small"
                  variant={editor.isActive('orderedList') ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  1.
                </Button>
                <Button
                  size="small"
                  variant={editor.isActive('blockquote') ? 'contained' : 'text'}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  "
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  ↶
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  ↷
                </Button>
              </Box>
              <EditorContent
                editor={editor}
                data-placeholder="محتوا مقاله را اینجا بنویسید..."
              />
            </Box>
            {!values.content?.trim() && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                محتوا الزامی است
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
            <Typography>نمایش در بلاگ</Typography>
            <Switch
              checked={values.published}
              name="published"
              onChange={handleChange}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}

