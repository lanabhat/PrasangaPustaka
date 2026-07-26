import React from 'react';
import { useTranslation } from 'react-i18next';
import BrowseGrid from '@/components/BrowseGrid/BrowseGrid';

const Kavis: React.FC = () => {
  const { t } = useTranslation();
  return <BrowseGrid model="kavi" filterParam="kavi" title={t('browse.kavis_title')} />;
};

export default Kavis;
