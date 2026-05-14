import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  variant?: 'primary' | 'ghost' | 'danger' | 'gold';
  children: ReactNode;
};

export function GameButton({ icon, variant = 'primary', children, className = '', ...props }: Props) {
  return (
    <button className={`game-button game-button--${variant} ${className}`} {...props}>
      {icon ? <img src={icon} alt="" /> : null}
      <span>{children}</span>
    </button>
  );
}
