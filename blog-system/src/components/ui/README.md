# UI Components

This directory contains reusable UI components for the Supabase Blog System.

## Components

### Modal
A flexible, accessible modal/dialog component with animations and responsive design.

**Location**: `Modal.tsx`

**Features**:
- Multiple size options (sm, md, lg, xl, full)
- Backdrop click handling
- ESC key to close
- Smooth animations
- Mobile responsive
- Body scroll lock
- Composable with ModalBody and ModalFooter

**Usage**:
```tsx
import { Modal, ModalBody, ModalFooter } from '@/components/ui'

<Modal isOpen={isOpen} onClose={onClose} title="My Modal">
  <ModalBody>
    <p>Content</p>
  </ModalBody>
  <ModalFooter>
    <button>Action</button>
  </ModalFooter>
</Modal>
```

**Documentation**: See [Modal.md](./Modal.md) for detailed documentation.

**Examples**: See [ModalExample.tsx](./ModalExample.tsx) for usage examples.

**Demo**: Visit `/dashboard/demo` to see the modal in action.

## Planned Components

The following components are planned for implementation:

- **ConfirmationDialog**: Specialized modal for confirmations
- **Toast**: Notification system
- **LoadingSpinner**: Loading indicators
- **EmptyState**: Empty state displays

## Design System

All components follow the design system established in the project:

- **Colors**: Uses gradient from `#FF4D94` (pink) to `#7C4DFF` (purple)
- **Typography**: Tailwind's default font stack
- **Spacing**: Consistent padding and margins
- **Animations**: Smooth transitions using Tailwind animations
- **Accessibility**: ARIA labels, keyboard navigation, focus management

## Contributing

When adding new components:

1. Create the component file in this directory
2. Export it from `index.ts`
3. Add documentation in a `.md` file
4. Create example usage in an `Example.tsx` file
5. Update this README
6. Ensure TypeScript types are properly defined
7. Follow existing patterns for styling and structure
