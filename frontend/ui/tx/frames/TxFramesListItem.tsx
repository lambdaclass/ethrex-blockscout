import { HStack } from '@chakra-ui/react';
import React from 'react';

import type { TxFrame } from 'types/api/transaction';

import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tag } from 'toolkit/chakra/tag';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';

interface Props extends TxFrame {
  isLoading?: boolean;
}

const MODE_COLORS: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  VERIFY: 'purple',
  SENDER: 'blue',
  DEFAULT: 'green',
};

const TxFramesListItem = ({ index, mode, to, gas_limit: gasLimit, data, isLoading }: Props) => {
  return (
    <ListItemMobile rowGap={ 3 } fontSize="sm">
      <HStack gap={ 3 } w="100%">
        <Skeleton loading={ isLoading } fontWeight={ 500 }>Frame { index }</Skeleton>
        <Tag colorPalette={ MODE_COLORS[mode] || 'gray' }>{ mode }</Tag>
      </HStack>
      <HStack gap={ 3 } w="100%">
        <Skeleton loading={ isLoading } fontWeight={ 500 }>Target</Skeleton>
        { to ? (
          <AddressEntity address={{ hash: to }} isLoading={ isLoading } noIcon/>
        ) : (
          <Skeleton loading={ isLoading } color="text.secondary">CREATE</Skeleton>
        ) }
      </HStack>
      <HStack gap={ 3 }>
        <Skeleton loading={ isLoading } fontWeight={ 500 }>Gas limit</Skeleton>
        <Skeleton loading={ isLoading } color="text.secondary">{ Number(gasLimit).toLocaleString() }</Skeleton>
      </HStack>
      <HStack gap={ 3 }>
        <Skeleton loading={ isLoading } fontWeight={ 500 }>Data</Skeleton>
        <Skeleton loading={ isLoading } color="text.secondary" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" maxW="200px">
          { data }
        </Skeleton>
      </HStack>
    </ListItemMobile>
  );
};

export default TxFramesListItem;
