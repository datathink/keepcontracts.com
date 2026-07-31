import LogoDark from '@documenso/assets/branding/logo-dark.svg';
import LogoLight from '@documenso/assets/branding/logo-light.svg';
import { cn } from '@documenso/ui/lib/utils';
import type { HTMLAttributes } from 'react';

export type LogoProps = HTMLAttributes<HTMLImageElement>;

export const BrandingLogo = ({ className, ...props }: LogoProps) => {
  return (
    <>
      <img src={LogoLight} alt="KeepContracts" className={cn(className, 'dark:hidden')} {...props} />
      <img src={LogoDark} alt="KeepContracts" className={cn(className, 'hidden dark:block')} {...props} />
    </>
  );
};
