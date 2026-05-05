import { getIcon } from '@lawnguy/brand/icons';

type Props = {
  name: string | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}: Props) {
  const Component = getIcon(name);
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    />
  );
}
