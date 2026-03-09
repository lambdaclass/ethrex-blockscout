import React from 'react';

import type { TxFrame } from 'types/api/transaction';

import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tag } from 'toolkit/chakra/tag';
import { TableRow, TableCell } from 'toolkit/chakra/table';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';

interface Props extends TxFrame {
  isLoading?: boolean;
}

const MODE_COLORS: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  VERIFY: 'purple',
  SENDER: 'blue',
  DEFAULT: 'green',
};

const TxFramesTableItem = ({ index, mode, to, gas_limit: gasLimit, data, isLoading }: Props) => {
  return (
    <TableRow alignItems="top">
      <TableCell isNumeric verticalAlign="middle">
        <Skeleton loading={ isLoading } display="inline-block">
          { index }
        </Skeleton>
      </TableCell>
      <TableCell verticalAlign="middle">
        <Skeleton loading={ isLoading } display="inline-block">
          <Tag colorPalette={ MODE_COLORS[mode] || 'gray' }>{ mode }</Tag>
        </Skeleton>
      </TableCell>
      <TableCell verticalAlign="middle">
        { to ? (
          <AddressEntity address={{ hash: to }} isLoading={ isLoading } noIcon/>
        ) : (
          <Skeleton loading={ isLoading } display="inline-block">CREATE</Skeleton>
        ) }
      </TableCell>
      <TableCell isNumeric verticalAlign="middle">
        <Skeleton loading={ isLoading } display="inline-block">
          { Number(gasLimit).toLocaleString() }
        </Skeleton>
      </TableCell>
      <TableCell verticalAlign="middle" maxW="300px">
        <Skeleton loading={ isLoading } display="inline-block" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
          <HashStringShortenDynamic hash={ data }/>
        </Skeleton>
      </TableCell>
    </TableRow>
  );
};

export default React.memo(TxFramesTableItem);
