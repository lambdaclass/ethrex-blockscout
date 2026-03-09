import React from 'react';

import type { TxFrame } from 'types/api/transaction';

import { TableBody, TableColumnHeader, TableHeaderSticky, TableRoot, TableRow } from 'toolkit/chakra/table';

import TxFramesTableItem from './TxFramesTableItem';

interface Props {
  data: Array<TxFrame> | undefined;
  isLoading?: boolean;
}

const TxFramesTable = ({ data, isLoading }: Props) => {
  return (
    <TableRoot>
      <TableHeaderSticky>
        <TableRow>
          <TableColumnHeader width="60px" isNumeric>#</TableColumnHeader>
          <TableColumnHeader width="100px">Mode</TableColumnHeader>
          <TableColumnHeader width="40%">Target</TableColumnHeader>
          <TableColumnHeader width="120px" isNumeric>Gas limit</TableColumnHeader>
          <TableColumnHeader>Data</TableColumnHeader>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { data?.map((item, index) => (
          <TxFramesTableItem key={ index } { ...item } isLoading={ isLoading }/>
        )) }
      </TableBody>
    </TableRoot>
  );
};

export default TxFramesTable;
