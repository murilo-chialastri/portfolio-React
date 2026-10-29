import { Button as PrimitiveButton } from '@base-ui/react/button'
import { cn } from '../../lib/cn'

export default function Button({ className, variant = 'default', ...props }) {
  return (
    <PrimitiveButton
      className={cn(
        'button',
        variant === 'primary' && 'button-primary',
        variant === 'icon' && 'button-icon',
        className,
      )}
      {...props}
    />
  )
}
