/**
 * Unit tests for Modal component
 * 
 * Note: These tests are designed to be run with a testing framework like Jest + React Testing Library
 * Install dependencies: npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Modal, ModalBody, ModalFooter } from './Modal'

describe('Modal Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = 'unset'
  })

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
    })

    it('should render without title', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('should show close button by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      const closeButton = screen.getByLabelText('关闭')
      expect(closeButton).toBeInTheDocument()
    })

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
          showCloseButton={false}
        >
          <div>Content</div>
        </Modal>
      )

      expect(screen.queryByLabelText('关闭')).not.toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      const closeButton = screen.getByLabelText('关闭')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Backdrop Click', () => {
    it('should call onClose when backdrop is clicked by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      // Click on the backdrop (the outer div)
      const backdrop = screen.getByText('Test Modal').closest('.fixed')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should not call onClose when backdrop is clicked if closeOnBackdropClick is false', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
          closeOnBackdropClick={false}
        >
          <div>Content</div>
        </Modal>
      )

      const backdrop = screen.getByText('Test Modal').closest('.fixed')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).not.toHaveBeenCalled()
      }
    })

    it('should not call onClose when modal content is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      const content = screen.getByText('Content')
      fireEvent.click(content)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should call onClose when ESC key is pressed by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when ESC is pressed if closeOnEscape is false', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
          closeOnEscape={false}
        >
          <div>Content</div>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should not call onClose for other keys', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal is open', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('hidden')

      rerender(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Size Variants', () => {
    it('should apply correct size class for sm', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="sm">
          <div>Content</div>
        </Modal>
      )

      const modal = screen.getByText('Test Modal').closest('.max-w-sm')
      expect(modal).toBeInTheDocument()
    })

    it('should apply correct size class for md (default)', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      )

      const modal = screen.getByText('Test Modal').closest('.max-w-md')
      expect(modal).toBeInTheDocument()
    })

    it('should apply correct size class for lg', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="lg">
          <div>Content</div>
        </Modal>
      )

      const modal = screen.getByText('Test Modal').closest('.max-w-lg')
      expect(modal).toBeInTheDocument()
    })

    it('should apply correct size class for xl', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="xl">
          <div>Content</div>
        </Modal>
      )

      const modal = screen.getByText('Test Modal').closest('.max-w-xl')
      expect(modal).toBeInTheDocument()
    })

    it('should apply correct size class for full', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="full">
          <div>Content</div>
        </Modal>
      )

      const modal = screen.getByText('Test Modal').closest('.max-w-full')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
          className="custom-class"
        >
          <div>Content</div>
        </Modal>
      )

      const modal = screen.getByText('Test Modal').closest('.custom-class')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('ModalBody Component', () => {
    it('should render children', () => {
      render(
        <ModalBody>
          <div>Body Content</div>
        </ModalBody>
      )

      expect(screen.getByText('Body Content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <ModalBody className="custom-body">
          <div>Body Content</div>
        </ModalBody>
      )

      const body = screen.getByText('Body Content').parentElement
      expect(body).toHaveClass('custom-body')
    })
  })

  describe('ModalFooter Component', () => {
    it('should render children', () => {
      render(
        <ModalFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </ModalFooter>
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <ModalFooter className="custom-footer">
          <button>Action</button>
        </ModalFooter>
      )

      const footer = screen.getByText('Action').parentElement
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Integration Tests', () => {
    it('should work with ModalBody and ModalFooter', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Complete Modal">
          <ModalBody>
            <p>Body content</p>
          </ModalBody>
          <ModalFooter>
            <button onClick={mockOnClose}>Close</button>
          </ModalFooter>
        </Modal>
      )

      expect(screen.getByText('Complete Modal')).toBeInTheDocument()
      expect(screen.getByText('Body content')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Close'))
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })
})
