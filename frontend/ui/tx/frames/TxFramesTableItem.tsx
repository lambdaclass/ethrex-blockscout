import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import React from 'react';

import type { TxFrame } from 'types/api/transaction';

import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tag } from 'toolkit/chakra/tag';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import RawDataSnippet from 'ui/shared/RawDataSnippet';
import FrameDecodedData from './FrameDecodedData';

interface Props extends TxFrame {
  isLoading?: boolean;
}

const MODE_COLORS: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  VERIFY: 'purple',
  SENDER: 'blue',
  DEFAULT: 'green',
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  VERIFY: 'Validates the passkey signature via WebAuthn on-chain verification',
  SENDER: 'Executes the sender\'s intended operation (transfer, call, etc.)',
  DEFAULT: 'General-purpose frame for contract deployment or execution',
};

const RowLabel = ({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) => (
  <GridItem>
    <Skeleton fontWeight={ 500 } loading={ isLoading } display="inline-block" color="text.secondary" fontSize="sm">
      { children }
    </Skeleton>
  </GridItem>
);

const SCOPE_LABELS: Record<string, string> = {
  any: '',
  sender: 'scope: sender',
  payer: 'scope: payer',
  combined: 'scope: sender+payer',
};

const TxFramesTableItem = ({ index, mode, scope, atomic_batch: atomicBatch, to, gas_limit: gasLimit, data, isLoading }: Props) => {
  const dataBytes = data ? Math.floor((data.length - 2) / 2) : 0;
  const scopeLabel = SCOPE_LABELS[scope] || '';

  return (
    <Box
      py={ 6 }
      _notFirst={{
        borderTopWidth: '1px',
        borderTopColor: { _light: 'blackAlpha.200', _dark: 'whiteAlpha.200' },
      }}
      { ...(atomicBatch ? {
        borderLeftWidth: '3px',
        borderLeftColor: 'orange.400',
        pl: 4,
      } : {}) }
    >
      { /* Header: Frame number + Mode tag + scope + atomic batch + description */ }
      <Flex alignItems="center" gap={ 3 } mb={ 4 }>
        <Skeleton loading={ isLoading } fontWeight={ 600 } fontSize="md">
          Frame { index }
        </Skeleton>
        <Skeleton loading={ isLoading } display="inline-block">
          <Tag colorPalette={ MODE_COLORS[mode] || 'gray' }>{ mode }</Tag>
        </Skeleton>
        { scopeLabel && (
          <Skeleton loading={ isLoading } display="inline-block">
            <Tag colorPalette="cyan" size="sm">{ scopeLabel }</Tag>
          </Skeleton>
        ) }
        { atomicBatch && (
          <Skeleton loading={ isLoading } display="inline-block">
            <Tag colorPalette="orange" size="sm">atomic batch</Tag>
          </Skeleton>
        ) }
        <Skeleton loading={ isLoading } display="inline-block" color="text.secondary" fontSize="sm">
          { MODE_DESCRIPTIONS[mode] || '' }
        </Skeleton>
      </Flex>

      { /* Details grid */ }
      <Grid
        gridTemplateColumns={{ base: 'minmax(0, 1fr)', lg: '120px minmax(0, 1fr)' }}
        gap={{ base: 1, lg: 4 }}
        mb={ 4 }
      >
        <RowLabel isLoading={ isLoading }>Target</RowLabel>
        <GridItem display="flex" alignItems="center">
          { to ? (
            <AddressEntity address={{ hash: to }} isLoading={ isLoading }/>
          ) : (
            <Skeleton loading={ isLoading } display="inline-block">
              <Tag colorPalette="teal">CREATE</Tag>
            </Skeleton>
          ) }
        </GridItem>

        <RowLabel isLoading={ isLoading }>Gas limit</RowLabel>
        <GridItem>
          <Skeleton loading={ isLoading } display="inline-block" fontSize="sm">
            { Number(gasLimit).toLocaleString() }
          </Skeleton>
        </GridItem>
      </Grid>

      { /* Decoded data section */ }
      { data && data !== '0x' && (
        <Box mb={ 3 }>
          <FrameDecodedData data={ data } isLoading={ isLoading }/>
        </Box>
      ) }

      { /* Raw data section */ }
      <RawDataSnippet
        data={ data }
        title={ `Raw data (${ dataBytes.toLocaleString() } bytes)` }
        textareaMaxHeight="160px"
        isLoading={ isLoading }
      />
    </Box>
  );
};

export default React.memo(TxFramesTableItem);
