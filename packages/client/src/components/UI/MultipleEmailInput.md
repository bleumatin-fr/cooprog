# MultipleEmailInput Component

A React component for inputting multiple email addresses with validation and chip-style display, inspired by react-multi-email.

## Features

- **Multiple Email Input**: Add multiple email addresses in a single input field
- **Email Validation**: Built-in email format validation
- **Chip Display**: Each email is displayed as a removable chip
- **Keyboard Support**:
  - Press Enter, comma, or space to add emails
  - Press Backspace to remove the last email when input is empty
- **Paste Support**: Paste multiple emails separated by comma, semicolon, or space
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Handling**: Visual feedback for invalid emails
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import MultipleEmailInput from "@/components/UI/MultipleEmailInput";

const MyComponent = () => {
  const [emails, setEmails] = useState<string[]>([]);

  return (
    <MultipleEmailInput
      label="Email Addresses"
      value={emails}
      onChange={setEmails}
      placeholder="Enter email addresses..."
      helperText="Add multiple email addresses"
    />
  );
};
```

## Props

| Prop          | Type                         | Default                      | Description                     |
| ------------- | ---------------------------- | ---------------------------- | ------------------------------- |
| `id`          | `string`                     | -                            | Unique identifier for the input |
| `name`        | `string`                     | -                            | Name attribute for the input    |
| `label`       | `string`                     | -                            | Label displayed above the input |
| `value`       | `string[]`                   | -                            | Array of email addresses        |
| `onChange`    | `(emails: string[]) => void` | -                            | Callback when emails change     |
| `error`       | `boolean`                    | `false`                      | Whether to show error state     |
| `helperText`  | `string`                     | -                            | Helper text below the input     |
| `placeholder` | `string`                     | `"Enter email addresses..."` | Placeholder text                |
| `disabled`    | `boolean`                    | `false`                      | Whether the input is disabled   |
| `required`    | `boolean`                    | `false`                      | Whether the field is required   |

## Styling

The component uses CSS custom properties from your design system:

- `--color-light-blue`: Chip background color
- `--color-dark-green`: Chip text color
- `--color-very-light-green`: Chip border color
- `--color-orange`: Focus and hover colors
- `--color-gray`: Secondary text colors
- `--error-background-color`: Error state colors

## Keyboard Shortcuts

- **Enter**: Add current email
- **Comma (,)** or **Space**: Add current email
- **Backspace**: Remove last email (when input is empty)
- **Tab**: Navigate to next form element

## Examples

### Basic Usage

```tsx
<MultipleEmailInput
  label="Team Members"
  value={teamEmails}
  onChange={setTeamEmails}
/>
```

### With Error State

```tsx
<MultipleEmailInput
  label="Invite Emails"
  value={inviteEmails}
  onChange={setInviteEmails}
  error={hasError}
  helperText="Please enter valid email addresses"
/>
```

### Disabled State

```tsx
<MultipleEmailInput
  label="Read-only Emails"
  value={readOnlyEmails}
  onChange={() => {}}
  disabled={true}
/>
```

## Implementation Details

The component is built using:

- **Material-UI**: For base components (Chip, FormControl, etc.)
- **Emotion**: For styled components and custom styling
- **React Hooks**: For state management and side effects
- **TypeScript**: For type safety

## Accessibility

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Error announcements

## Browser Support

- Modern browsers with ES6+ support
- IE11+ (with polyfills)
- Mobile browsers

