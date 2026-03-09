import { Box } from '@chakra-ui/react';
import React from 'react';

import type { TxFrame } from 'types/api/transaction';

import TxFramesListItem from './TxFramesListItem';

interface Props {
  data: Array<TxFrame> | undefined;
  isLoading?: boolean;
}

const TxFramesList = ({ data, isLoading }: Props) => {
  return (
    <Box>
      { data?.map((item, index) => <TxFramesListItem key={ index } { ...item } isLoading={ isLoading }/>) }
    </Box>
  );
};

export default TxFramesList;
