import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import React from 'react';

import type { Transaction, TxFrame } from 'types/api/transaction';

import { Badge } from 'toolkit/chakra/badge';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tag } from 'toolkit/chakra/tag';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import RawDataSnippet from 'ui/shared/RawDataSnippet';
import FrameDecodedData from 'ui/tx/frames/FrameDecodedData';

// --- Mode colors/descriptions (consistent with existing frame components) ---

const MODE_COLORS: Record<string, 'blue' | 'green' | 'gray'> = {
  VERIFY: 'blue',
  SENDER: 'green',
  DEFAULT: 'gray',
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  VERIFY: 'Signature verification',
  SENDER: 'User operation',
  DEFAULT: 'Contract execution',
};

// --- Shared sub-components ---

const DetailRow = ({
  label,
  children,
  isLoading,
}: {
  label: string;
  children: React.ReactNode;
  isLoading?: boolean;
}) => (
  <>
    <GridItem>
      <Skeleton loading={ isLoading } fontWeight={ 500 } color="text.secondary" fontSize="sm">
        { label }
      </Skeleton>
    </GridItem>
    <GridItem display="flex" alignItems="center" minW={ 0 }>
      { children }
    </GridItem>
  </>
);

const GasBar = ({
  gasUsed,
  gasLimit,
  isLoading,
}: {
  gasUsed: string;
  gasLimit: string;
  isLoading?: boolean;
}) => {
  const used = Number(gasUsed);
  const limit = Number(gasLimit);
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <Flex alignItems="center" gap={ 3 } w="100%">
      <Box flex="1" maxW="200px" h="8px" borderRadius="full" bg={{ _light: 'blackAlpha.100', _dark: 'whiteAlpha.100' }}>
        <Box
          h="100%"
          borderRadius="full"
          bg={ pct > 90 ? 'red.400' : pct > 70 ? 'orange.400' : 'green.400' }
          w={ `${ pct }%` }
          transition="width 0.3s"
        />
      </Box>
      <Skeleton loading={ isLoading } fontSize="sm">
        { used.toLocaleString() } / { limit.toLocaleString() } ({ pct.toFixed(1) }%)
      </Skeleton>
    </Flex>
  );
};

// --- Frame Card ---

const FrameCard = ({ frame, isLoading }: { frame: TxFrame; isLoading?: boolean }) => {
  const dataBytes = frame.data ? Math.floor((frame.data.length - 2) / 2) : 0;

  return (
    <Box
      borderWidth="1px"
      borderColor={{ _light: 'blackAlpha.200', _dark: 'whiteAlpha.200' }}
      borderRadius="lg"
      p={ 5 }
    >
      { /* Header row: frame index, mode badge, status */ }
      <Flex alignItems="center" gap={ 3 } mb={ 4 } flexWrap="wrap">
        <Skeleton loading={ isLoading } fontWeight={ 600 } fontSize="md">
          Frame { frame.index }
        </Skeleton>
        <Skeleton loading={ isLoading } display="inline-block">
          <Tag colorPalette={ MODE_COLORS[frame.mode] || 'gray' }>{ frame.mode }</Tag>
        </Skeleton>
        <Skeleton loading={ isLoading } display="inline-block" color="text.secondary" fontSize="sm">
          { MODE_DESCRIPTIONS[frame.mode] || '' }
        </Skeleton>
        { frame.status && (
          <Skeleton loading={ isLoading } display="inline-block">
            <Tag colorPalette={ frame.status === 'ok' ? 'green' : 'red' } size="sm">
              { frame.status === 'ok' ? 'Success' : 'Error' }
            </Tag>
          </Skeleton>
        ) }
      </Flex>

      { /* Frame detail grid */ }
      <Grid
        gridTemplateColumns={{ base: 'minmax(0, 1fr)', lg: '120px minmax(0, 1fr)' }}
        gap={{ base: 1, lg: 4 }}
        mb={ 4 }
      >
        <DetailRow label="Target" isLoading={ isLoading }>
          { frame.to ? (
            <AddressEntity address={{ hash: frame.to }} isLoading={ isLoading }/>
          ) : (
            <Skeleton loading={ isLoading } display="inline-block">
              <Tag colorPalette="teal">CREATE</Tag>
            </Skeleton>
          ) }
        </DetailRow>

        <DetailRow label="Gas" isLoading={ isLoading }>
          { frame.gas_used ? (
            <GasBar gasUsed={ frame.gas_used } gasLimit={ frame.gas_limit } isLoading={ isLoading }/>
          ) : (
            <Skeleton loading={ isLoading } fontSize="sm">
              { Number(frame.gas_limit).toLocaleString() } (limit)
            </Skeleton>
          ) }
        </DetailRow>
      </Grid>

      { /* Decoded calldata */ }
      { frame.data && frame.data !== '0x' && (
        <Box mb={ 3 }>
          <FrameDecodedData data={ frame.data } isLoading={ isLoading }/>
        </Box>
      ) }

      { /* Raw hex data (collapsible) */ }
      { frame.data && frame.data !== '0x' && (
        <RawDataSnippet
          data={ frame.data }
          title={ `Raw data (${ dataBytes.toLocaleString() } bytes)` }
          textareaMaxHeight="120px"
          isLoading={ isLoading }
        />
      ) }
    </Box>
  );
};

// --- Main Component ---

interface Props {
  transaction: Transaction;
  isLoading?: boolean;
}

const FrameTransactionDetails = ({ transaction, isLoading }: Props) => {
  const frames = transaction.frame_details ?? [];

  return (
    <Box>
      { /* Header */ }
      <Flex alignItems="center" gap={ 3 } mb={ 6 } flexWrap="wrap">
        { transaction.status && (
          <Badge colorPalette={ transaction.status === 'ok' ? 'green' : 'red' } loading={ isLoading }>
            { transaction.status === 'ok' ? 'Success' : 'Failed' }
          </Badge>
        ) }
        <Skeleton loading={ isLoading } fontSize="sm" color="text.secondary">
          Frame Transaction (EIP-8141)
        </Skeleton>
      </Flex>

      { /* Core transaction fields */ }
      <Grid
        gridTemplateColumns={{ base: 'minmax(0, 1fr)', lg: '200px minmax(0, 1fr)' }}
        gap={{ base: 1, lg: 4 }}
        mb={ 8 }
      >
        <DetailRow label="Sender" isLoading={ isLoading }>
          <AddressEntity address={ transaction.from } isLoading={ isLoading }/>
        </DetailRow>

        { transaction.payer && (
          <DetailRow label="Gas Payer" isLoading={ isLoading }>
            <AddressEntity address={ transaction.payer } isLoading={ isLoading }/>
          </DetailRow>
        ) }

        <DetailRow label="Block" isLoading={ isLoading }>
          <Skeleton loading={ isLoading } fontSize="sm">
            { transaction.block_number !== null ? transaction.block_number.toLocaleString() : 'Pending' }
          </Skeleton>
        </DetailRow>

        { transaction.timestamp && (
          <DetailRow label="Timestamp" isLoading={ isLoading }>
            <Skeleton loading={ isLoading } fontSize="sm">
              { transaction.timestamp }
            </Skeleton>
          </DetailRow>
        ) }

        <DetailRow label="Nonce" isLoading={ isLoading }>
          <Skeleton loading={ isLoading } fontSize="sm">
            { transaction.nonce }
          </Skeleton>
        </DetailRow>

        <DetailRow label="Total Gas Used" isLoading={ isLoading }>
          <Skeleton loading={ isLoading } fontSize="sm">
            { transaction.gas_used ? Number(transaction.gas_used).toLocaleString() : '-' }
          </Skeleton>
        </DetailRow>

        <DetailRow label="Gas Limit" isLoading={ isLoading }>
          <Skeleton loading={ isLoading } fontSize="sm">
            { Number(transaction.gas_limit).toLocaleString() }
          </Skeleton>
        </DetailRow>

        <DetailRow label="Transaction Fee" isLoading={ isLoading }>
          <Skeleton loading={ isLoading } fontSize="sm">
            { transaction.fee.value }
          </Skeleton>
        </DetailRow>

        { transaction.gas_price && (
          <DetailRow label="Gas Price" isLoading={ isLoading }>
            <Skeleton loading={ isLoading } fontSize="sm">
              { transaction.gas_price }
            </Skeleton>
          </DetailRow>
        ) }

        { transaction.max_fee_per_gas && (
          <DetailRow label="Max Fee per Gas" isLoading={ isLoading }>
            <Skeleton loading={ isLoading } fontSize="sm">
              { transaction.max_fee_per_gas }
            </Skeleton>
          </DetailRow>
        ) }

        { transaction.max_priority_fee_per_gas && (
          <DetailRow label="Max Priority Fee" isLoading={ isLoading }>
            <Skeleton loading={ isLoading } fontSize="sm">
              { transaction.max_priority_fee_per_gas }
            </Skeleton>
          </DetailRow>
        ) }

        { transaction.base_fee_per_gas && (
          <DetailRow label="Base Fee" isLoading={ isLoading }>
            <Skeleton loading={ isLoading } fontSize="sm">
              { transaction.base_fee_per_gas }
            </Skeleton>
          </DetailRow>
        ) }
      </Grid>

      { /* Frames section */ }
      { frames.length > 0 && (
        <Box>
          <Skeleton loading={ isLoading } fontWeight={ 600 } fontSize="lg" mb={ 4 }>
            Execution Frames ({ frames.length })
          </Skeleton>
          <Flex direction="column" gap={ 4 }>
            { frames.map((frame) => (
              <FrameCard key={ frame.index } frame={ frame } isLoading={ isLoading }/>
            )) }
          </Flex>
        </Box>
      ) }
    </Box>
  );
};

export default React.memo(FrameTransactionDetails);
