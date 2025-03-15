import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalProvider, useModal } from '@/components/modal/provider';
import { ReactNode } from 'react';

// Mock the Modal component
vi.mock('@/components/modal/index', () => ({
  default: ({ children, showModal, setShowModal }: { 
    children: ReactNode; 
    showModal: boolean; 
    setShowModal: (show: boolean) => void 
  }) => (
    <div 
      data-testid="modal" 
      data-show={showModal.toString()}
      aria-hidden={!showModal}
    >
      {showModal && (
        <>
          <button 
            data-testid="close-button" 
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
          <div data-testid="modal-content">{children}</div>
        </>
      )}
    </div>
  )
}));

// Test component that uses the modal context
function TestComponent() {
  const modal = useModal();
  
  if (!modal) {
    return <div data-testid="no-context">No Modal Context</div>;
  }
  
  return (
    <div>
      <button 
        data-testid="show-button" 
        onClick={() => modal.show(<div data-testid="modal-children">Modal Content</div>)}
      >
        Show Modal
      </button>
      <button 
        data-testid="hide-button" 
        onClick={() => modal.hide()}
      >
        Hide Modal
      </button>
    </div>
  );
}

describe('ModalProvider Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <ModalProvider>
        <div data-testid="child-component">Child Component</div>
      </ModalProvider>
    );
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('provides modal context to children', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );
    
    expect(screen.getByTestId('show-button')).toBeInTheDocument();
    expect(screen.getByTestId('hide-button')).toBeInTheDocument();
  });

  it('returns null when used outside of ModalProvider', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('no-context')).toBeInTheDocument();
  });
}); 