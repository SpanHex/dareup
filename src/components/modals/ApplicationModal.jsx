import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const ApplicationModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="application-modal"
      data-modal="application"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target.id === 'application-modal') onClose();
      }}
    >
      <div
        data-modal-panel
        className="mx-4 w-full max-w-[750px] border border-white/20 bg-black/95 p-[64px] md:p-10"
      >
        <button
          type="button"
          data-modal-close="application"
          className="ml-auto block border border-white/40 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/85 transition-colors hover:bg-white hover:text-black"
          aria-label="Close modal"
          onClick={onClose}
        >
          Close
        </button>
        <div className="mt-4">
          <div className="mx-auto max-w-3xl text-white">
            <h2 className="text-center text-[36px] uppercase tracking-[-0.05em] md:text-[48px]">
              Join DAREDOWN
            </h2>
            <p className="text-center text-white/70 mt-4 text-[18px]">
              16 spots available, £0.50 entry, £50 prize
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/register"
                className="border border-white/40 px-8 py-3 text-sm uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
                onClick={onClose}
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
