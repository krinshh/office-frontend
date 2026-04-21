import React from 'react';
import { Link as NextLink } from '@/navigation';
import { ComponentProps } from 'react';

type NextLinkProps = ComponentProps<typeof NextLink>;

interface LinkProps extends NextLinkProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const Link: React.FC<LinkProps> = ({
  children,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  // Extract text content from children for accessibility check
  const getTextContent = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return children.toString();
    if (React.isValidElement(children)) {
      return getTextContent((children.props as any).children);
    }
    if (Array.isArray(children)) {
      return children.map(getTextContent).join(' ');
    }
    return '';
  };

  const textContent = getTextContent(children).trim();

  // Warn if text content is too generic (development only)
  if (process.env.NODE_ENV === 'development') {
    const genericTexts = ['click here', 'read more', 'here', 'link', 'more', 'learn more'];
    if (genericTexts.some(generic => textContent.toLowerCase().includes(generic))) {
      console.warn(`Link text "${textContent}" may not be descriptive enough. Consider using more specific text for better accessibility.`);
    }
  }

  return (
    <NextLink
      className={className}
      aria-label={ariaLabel || (textContent ? undefined : 'Link')}
      prefetch={false}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default Link;