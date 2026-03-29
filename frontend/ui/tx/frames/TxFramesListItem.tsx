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
  VERIFY: 'Signature verification',
  SENDER: 'User operation',
  DEFAULT: 'Contract execution',
};

const SCOPE_LABELS: Record<string, string> = {
  any: '',
  sender: 'scope: sender',
  payer: 'scope: payer',
  combined: 'scope: sender+payer',
};

const TxFramesListItem = ({ index, mode, scope, atomic_batch: atomicBatch, to, gas_limit: gasLimit, data, isLoading }: Props) => {
  const dataBytes = data ? Math.floor((data.length - 2) / 2) : 0;
  const scopeLabel = SCOPE_LABELS[scope] || '';

  return (
    <Box
      py={ 4 }
      _notFirst={{
        borderTopWidth: '1px',
        borderTopColor: { _light: 'blackAlpha.200', _dark: 'whiteAlpha.200' },
      }}
      { ...(atomicBatch ? { borderLeftWidth: '3px', borderLeftColor: 'orange.400', pl: 3 } : {}) }
    >
      <Flex alignItems="center" gap={ 2 } mb={ 3 } flexWrap="wrap">
        <Skeleton loading={ isLoading } fontWeight={ 600 } fontSize="sm">
          Frame { index }
        </Skeleton>
        <Skeleton loading={ isLoading } display="inline-block">
          <Tag colorPalette={ MODE_COLORS[mode] || 'gray' } size="sm">{ mode }</Tag>
        </Skeleton>
        { scopeLabel && (
          <Skeleton loading={ isLoading } display="inline-block">
            <Tag colorPalette="cyan" size="sm">{ scopeLabel }</Tag>
          </Skeleton>
        ) }
        { atomicBatch && (
          <Skeleton loading={ isLoading } display="inline-block">
            <Tag colorPalette="orange" size="sm">atomic</Tag>
          </Skeleton>
        ) }
        <Skeleton loading={ isLoading } display="inline-block" color="text.secondary" fontSize="xs">
          { MODE_DESCRIPTIONS[mode] || '' }
        </Skeleton>
      </Flex>

      <Grid gridTemplateColumns="80px minmax(0, 1fr)" gap={ 1 } mb={ 3 }>
        <GridItem>
          <Skeleton loading={ isLoading } fontWeight={ 500 } fontSize="sm" color="text.secondary">Target</Skeleton>
        </GridItem>
        <GridItem>
          { to ? (
            <AddressEntity address={{ hash: to }} isLoading={ isLoading } noIcon truncation="dynamic" fontSize="sm"/>
          ) : (
            <Skeleton loading={ isLoading } display="inline-block">
              <Tag colorPalette="teal" size="sm">CREATE</Tag>
            </Skeleton>
          ) }
        </GridItem>

        <GridItem>
          <Skeleton loading={ isLoading } fontWeight={ 500 } fontSize="sm" color="text.secondary">Gas limit</Skeleton>
        </GridItem>
        <GridItem>
          <Skeleton loading={ isLoading } display="inline-block" fontSize="sm">
            { Number(gasLimit).toLocaleString() }
          </Skeleton>
        </GridItem>
      </Grid>

      { data && data !== '0x' && (
        <Box mb={ 3 }>
          <FrameDecodedData data={ data } isLoading={ isLoading }/>
        </Box>
      ) }

      <RawDataSnippet
        data={ data }
        title={ `Raw data (${ dataBytes.toLocaleString() } bytes)` }
        textareaMaxHeight="120px"
        isLoading={ isLoading }
      />
    </Box>
  );
};

export default TxFramesListItem;
