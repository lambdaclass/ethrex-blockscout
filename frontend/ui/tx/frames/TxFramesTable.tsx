import { Box } from '@chakra-ui/react';
import React from 'react';

import type { TxFrame } from 'types/api/transaction';

import TxFramesTableItem from './TxFramesTableItem';

interface Props {
  data: Array<TxFrame> | undefined;
  isLoading?: boolean;
}

const TxFramesTable = ({ data, isLoading }: Props) => {
  return (
    <Box>
      { data?.map((item, index) => (
        <TxFramesTableItem key={ index } { ...item } isLoading={ isLoading }/>
      )) }
    </Box>
  );
};

export default TxFramesTable;
