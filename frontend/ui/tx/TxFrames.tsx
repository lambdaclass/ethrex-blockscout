import { Box } from '@chakra-ui/react';
import React from 'react';

import DataListDisplay from 'ui/shared/DataListDisplay';
import TxPendingAlert from 'ui/tx/TxPendingAlert';
import TxSocketAlert from 'ui/tx/TxSocketAlert';

import TxFramesList from './frames/TxFramesList';
import TxFramesTable from './frames/TxFramesTable';
import type { TxQuery } from './useTxQuery';

interface Props {
  txQuery: TxQuery;
}

const TxFrames = ({ txQuery }: Props) => {

  if (!txQuery.isPlaceholderData && !txQuery.isError && !txQuery.data?.status) {
    return txQuery.socketStatus ? <TxSocketAlert status={ txQuery.socketStatus }/> : <TxPendingAlert/>;
  }

  const content = (
    <>
      <Box hideFrom="lg">
        <TxFramesList data={ txQuery.data?.frame_details ?? undefined } isLoading={ txQuery.isPlaceholderData }/>
      </Box>
      <Box hideBelow="lg">
        <TxFramesTable data={ txQuery.data?.frame_details ?? undefined } isLoading={ txQuery.isPlaceholderData }/>
      </Box>
    </>
  );

  return (
    <DataListDisplay
      isError={ txQuery.isError }
      itemsNum={ txQuery.data?.frame_details?.length }
      emptyText="There are no frames for this transaction."
    >
      { content }
    </DataListDisplay>
  );
};

export default TxFrames;
