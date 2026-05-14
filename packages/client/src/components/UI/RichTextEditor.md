# RichTextEditor Component

A rich text editor component based on TipTap with MUI-like styling and basic formatting features.

## Features

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Text Alignment**: Left, center, right, justify
- **Lists**: Bullet lists and numbered lists
- **Headings**: H1, H2, H3 levels
- **MUI-like Design**: Consistent with your design system
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error States**: Visual feedback for validation errors
- **Disabled State**: Can be disabled when needed

## Dependencies

The component requires the following TipTap packages:

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-underline`
- `@tiptap/extension-text-align`

## Usage

```tsx
import RichTextEditor from "@/components/UI/RichTextEditor";

const MyComponent = () => {
  const [content, setContent] = useState("");

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      label="Description"
      placeholder="Enter your description..."
      helperText="This field supports rich text formatting"
    />
  );
};
```

## Props

| Prop          | Type                      | Default              | Description                      |
| ------------- | ------------------------- | -------------------- | -------------------------------- |
| `value`       | `string`                  | -                    | HTML content of the editor       |
| `onChange`    | `(value: string) => void` | -                    | Callback when content changes    |
| `placeholder` | `string`                  | `"Start writing..."` | Placeholder text when empty      |
| `disabled`    | `boolean`                 | `false`              | Whether the editor is disabled   |
| `error`       | `boolean`                 | `false`              | Whether to show error state      |
| `helperText`  | `string`                  | -                    | Helper text below the editor     |
| `label`       | `string`                  | -                    | Label displayed above the editor |

## Styling

The component uses CSS custom properties from your design system:

- `--color-light-gray`: Default border color
- `--color-gray`: Hover border color
- `--color-orange`: Focus and selected button colors
- `--color-dark-green`: Text and button text colors
- `--color-very-light-gray`: Toolbar and code block backgrounds
- `--color-text-gray`: Placeholder and helper text colors
- `--error-background-color`: Error state colors

## Keyboard Shortcuts

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + Shift + S**: Strikethrough
- **Ctrl/Cmd + Shift + L**: Bullet list
- **Ctrl/Cmd + Shift + O**: Numbered list

## Examples

### Basic Usage

```tsx
<RichTextEditor value={description} onChange={setDescription} />
```

### With Label and Helper Text

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  label="Project Description"
  placeholder="Describe your project..."
  helperText="Use the toolbar above to format your text"
/>
```

### Error State

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  label="Required Field"
  error={true}
  helperText="This field is required"
/>
```

### Disabled State

```tsx
<RichTextEditor
  value={readOnlyContent}
  onChange={() => {}}
  label="Read-only Content"
  disabled={true}
/>
```

## Implementation Details

The component is built using:

- **TipTap**: For the rich text editing functionality
- **Material-UI**: For the toolbar buttons and layout components
- **Emotion**: For styled components and custom styling
- **React Hooks**: For state management and side effects
- **TypeScript**: For type safety

## Accessibility

- Proper ARIA labels for all toolbar buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Tooltips for all buttons
