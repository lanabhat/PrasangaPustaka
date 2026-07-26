import React from 'react';
import { useTranslation } from 'react-i18next';
import BrowseGrid from '@/components/BrowseGrid/BrowseGrid';

const Prasangas: React.FC = () => {
  const { t } = useTranslation();
  return <BrowseGrid model="prasanga" filterParam="prasanga" title={t('browse.prasangas_title')} />;
};

export default Prasangas;
