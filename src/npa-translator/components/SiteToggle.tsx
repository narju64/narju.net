
import { usePhoneticContext } from '../context/PhoneticContext';

interface SiteToggleProps {
  className?: string;
}

export function SiteToggle({ className = '' }: SiteToggleProps) {
  const { isNPAMode, toggleNPAMode } = usePhoneticContext();

  return (
    <button
      className={`site-toggle ${className}`}
      onClick={toggleNPAMode}
      title={isNPAMode ? 'Switch to English' : 'Switch to nPA'}
      style={{
        background: isNPAMode ? 'var(--color-titles)' : 'var(--color-borders)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '0.5rem 1rem',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        fontFamily: isNPAMode ? 'nPA, Courier New, monospace' : 'inherit'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isNPAMode ? 'var(--color-titles)' : 'var(--color-borders)';
      }}
    >
      {isNPAMode ? 'nPA' : 'nPA'}
    </button>
  );
} 