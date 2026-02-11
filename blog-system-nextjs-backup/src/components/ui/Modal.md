# Modal Component Documentation

## Overview

A reusable, accessible modal/dialog component with animations, backdrop handling, and responsive design. Built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ **Reusable**: Single component for all modal needs
- ✅ **Accessible**: Keyboard navigation (ESC to close), focus management
- ✅ **Animated**: Smooth fade-in and zoom-in transitions
- ✅ **Responsive**: Mobile-friendly with multiple size options
- ✅ **Flexible**: Customizable backdrop behavior and close options
- ✅ **Body Scroll Lock**: Prevents background scrolling when modal is open
- ✅ **Composable**: Includes ModalBody and ModalFooter helper components

## Installation

The modal component is located at `src/components/ui/Modal.tsx` and can be imported as:

```typescript
import { Modal, ModalBody, ModalFooter } from '@/components/ui'
```

## Basic Usage

```tsx
'use client'

import { useState } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui'

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
      >
        <ModalBody>
          <p>Modal content goes here</p>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={() => setIsOpen(false)}>Confirm</button>
        </ModalFooter>
      </Modal>
    </>
  )
}
```

## Props

### Modal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `() => void` | required | Callback when modal should close |
| `title` | `string` | `undefined` | Modal title displayed in header |
| `children` | `ReactNode` | required | Modal content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal width |
| `showCloseButton` | `boolean` | `true` | Show X button in header |
| `closeOnBackdropClick` | `boolean` | `true` | Close when clicking outside modal |
| `closeOnEscape` | `boolean` | `true` | Close when pressing ESC key |
| `className` | `string` | `undefined` | Additional CSS classes for modal container |

### Size Options

- `sm`: max-w-sm (384px)
- `md`: max-w-md (448px)
- `lg`: max-w-lg (512px)
- `xl`: max-w-xl (576px)
- `full`: max-w-full with 16px margin

## Examples

### Basic Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Basic Modal"
>
  <ModalBody>
    <p>This is a basic modal with default settings.</p>
  </ModalBody>
</Modal>
```

### Form Modal

```tsx
<Modal
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  title="Create Category"
  size="md"
>
  <ModalBody>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          placeholder="Enter description"
        />
      </div>
    </div>
  </ModalBody>
  <ModalFooter>
    <button
      onClick={() => setIsFormOpen(false)}
      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
    >
      Cancel
    </button>
    <button
      onClick={handleSubmit}
      className="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-lg"
    >
      Create
    </button>
  </ModalFooter>
</Modal>
```

### Confirmation Dialog

```tsx
<Modal
  isOpen={isConfirmOpen}
  onClose={() => setIsConfirmOpen(false)}
  title="Confirm Delete"
  size="sm"
  closeOnBackdropClick={false}
  closeOnEscape={false}
>
  <ModalBody>
    <p className="text-gray-600">
      Are you sure you want to delete this item? This action cannot be undone.
    </p>
  </ModalBody>
  <ModalFooter>
    <button
      onClick={() => setIsConfirmOpen(false)}
      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
    >
      Cancel
    </button>
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      Delete
    </button>
  </ModalFooter>
</Modal>
```

### Large Content Modal

```tsx
<Modal
  isOpen={isLargeOpen}
  onClose={() => setIsLargeOpen(false)}
  title="Large Content"
  size="xl"
>
  <ModalBody>
    <div className="space-y-4">
      {/* Long content that will scroll */}
      {items.map(item => (
        <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      ))}
    </div>
  </ModalBody>
  <ModalFooter>
    <button
      onClick={() => setIsLargeOpen(false)}
      className="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-lg"
    >
      Close
    </button>
  </ModalFooter>
</Modal>
```

### Modal Without Header

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  showCloseButton={false}
>
  <ModalBody>
    <p>Modal without header or close button</p>
  </ModalBody>
  <ModalFooter>
    <button onClick={() => setIsOpen(false)}>Close</button>
  </ModalFooter>
</Modal>
```

## Helper Components

### ModalBody

Provides consistent spacing for modal content.

```tsx
<ModalBody className="custom-class">
  <p>Content with consistent spacing</p>
</ModalBody>
```

### ModalFooter

Provides consistent button layout in modal footer.

```tsx
<ModalFooter className="custom-class">
  <button>Cancel</button>
  <button>Confirm</button>
</ModalFooter>
```

## Styling

The modal uses Tailwind CSS classes and can be customized:

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  className="custom-modal-class"
>
  {/* content */}
</Modal>
```

### Custom Animations

Animations are defined in `tailwind.config.ts`:

```typescript
keyframes: {
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'zoom-in': {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
}
```

## Accessibility

- **Keyboard Navigation**: Press ESC to close (configurable)
- **Focus Management**: Modal traps focus when open
- **ARIA Labels**: Close button has proper aria-label
- **Body Scroll Lock**: Prevents background scrolling

## Mobile Responsiveness

- Automatically adjusts to screen size
- Adds padding on mobile devices
- Max height of 90vh with scrollable content
- Touch-friendly close button

## Best Practices

1. **Always provide onClose**: Even if closeOnBackdropClick is false
2. **Use ModalBody and ModalFooter**: For consistent spacing
3. **Keep content focused**: Don't overload modals with too much content
4. **Provide clear actions**: Use descriptive button labels
5. **Handle loading states**: Show loading indicators during async operations
6. **Validate before closing**: Prevent accidental data loss

## Common Patterns

### Loading State

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Processing">
  <ModalBody>
    {isLoading ? (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    ) : (
      <p>Content loaded</p>
    )}
  </ModalBody>
</Modal>
```

### Error Handling

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Error">
  <ModalBody>
    {error && (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    )}
  </ModalBody>
  <ModalFooter>
    <button onClick={() => setIsOpen(false)}>Close</button>
  </ModalFooter>
</Modal>
```

## Testing

See `src/components/ui/ModalExample.tsx` for comprehensive examples and testing scenarios.

To test the modal:

1. Navigate to `/dashboard/demo` in your browser
2. Click different buttons to test various modal configurations
3. Test keyboard navigation (ESC key)
4. Test backdrop clicks
5. Test on mobile devices

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Dependencies

- React 18+
- Tailwind CSS 3+
- lucide-react (for icons)
- clsx + tailwind-merge (for className utilities)
