'use client';

import { useLanguage } from '@/src/contexts/LanguageContext';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

interface TranslatedHeadingProps {
  as?: HeadingLevel;
  i18nKey: string;
  fallback?: string;
  className?: string;
}

export default function TranslatedHeading({
  as: Component = 'h2',
  i18nKey,
  fallback,
  className,
}: TranslatedHeadingProps) {
  const { t } = useLanguage();
  const content = t(i18nKey) || fallback || i18nKey;
  return <Component className={className}>{content}</Component>;
}
