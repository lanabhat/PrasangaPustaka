import React from 'react';
import { useTranslation } from 'react-i18next';
import BrowseGrid from '@/components/BrowseGrid/BrowseGrid';

const Publishers: React.FC = () => {
  const { t } = useTranslation();
  return <BrowseGrid model="publisher" filterParam="publisher" title={t('browse.publishers_title')} />;
};

export default Publishers;
