import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import React from 'react';
import { decodeAbiParameters, formatEther, formatUnits } from 'viem';
import type { AbiParameter } from 'viem';

import { Badge } from 'toolkit/chakra/badge';
import { Skeleton } from 'toolkit/chakra/skeleton';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import TruncatedValue from 'ui/shared/TruncatedValue';

interface KnownFunction {
  name: string;
  signature: string;
  params: readonly AbiParameter[];
  formatParam?: Record<string, (value: unknown) => string>;
}

const KNOWN_SELECTORS: Record<string, KnownFunction> = {
  '0xa9059cbb': {
    name: 'transfer',
    signature: 'transfer(address to, uint256 amount)',
    params: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    formatParam: {
      amount: (v) => `${ formatUnits(v as bigint, 18) } tokens`,
    },
  },
  '0xb61d27f6': {
    name: 'execute',
    signature: 'execute(address to, uint256 value, bytes data)',
    params: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    formatParam: {
      value: (v) => {
        const val = v as bigint;
        return val === BigInt(0) ? '0' : `${ formatEther(val) } ETH`;
      },
    },
  },
  '0x182ffd20': {
    name: 'verify',
    signature: 'verify((uint256 r, uint256 s) sig, (bytes authenticatorData, string clientDataJSON, uint16 challengeIndex, uint16 typeIndex, bool userVerificationRequired) metadata)',
    params: [
      {
        name: 'sig',
        type: 'tuple',
        components: [
          { name: 'r', type: 'uint256' },
          { name: 's', type: 'uint256' },
        ],
      },
      {
        name: 'metadata',
        type: 'tuple',
        components: [
          { name: 'authenticatorData', type: 'bytes' },
          { name: 'clientDataJSON', type: 'string' },
          { name: 'challengeIndex', type: 'uint16' },
          { name: 'typeIndex', type: 'uint16' },
          { name: 'userVerificationRequired', type: 'bool' },
        ],
      },
    ],
  },
  '0x5a27d2e0': {
    name: 'verifyAndPay',
    signature: 'verifyAndPay((uint256 r, uint256 s) sig, (bytes authenticatorData, string clientDataJSON, uint16 challengeIndex, uint16 typeIndex, bool userVerificationRequired) metadata)',
    params: [
      {
        name: 'sig',
        type: 'tuple',
        components: [
          { name: 'r', type: 'uint256' },
          { name: 's', type: 'uint256' },
        ],
      },
      {
        name: 'metadata',
        type: 'tuple',
        components: [
          { name: 'authenticatorData', type: 'bytes' },
          { name: 'clientDataJSON', type: 'string' },
          { name: 'challengeIndex', type: 'uint16' },
          { name: 'typeIndex', type: 'uint16' },
          { name: 'userVerificationRequired', type: 'bool' },
        ],
      },
    ],
  },
  '0xfc735e99': {
    name: 'verify',
    signature: 'verify() — GasSponsor: checks sender token balance and approves gas payment',
    params: [],
  },
  '0x095ea7b3': {
    name: 'approve',
    signature: 'approve(address spender, uint256 amount)',
    params: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    formatParam: {
      amount: (v) => `${ formatUnits(v as bigint, 18) } tokens`,
    },
  },
  '0x23b872dd': {
    name: 'transferFrom',
    signature: 'transferFrom(address from, address to, uint256 amount)',
    params: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    formatParam: {
      amount: (v) => `${ formatUnits(v as bigint, 18) } tokens`,
    },
  },
};

interface DecodedParam {
  name: string;
  type: string;
  value: string;
  formattedValue?: string;
}

function flattenTupleParams(
  params: readonly AbiParameter[],
  values: readonly unknown[],
  formatParam?: Record<string, (value: unknown) => string>,
): Array<DecodedParam> {
  const result: Array<DecodedParam> = [];

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const value = values[i];

    if (param.type === 'tuple' && 'components' in param && param.components) {
      // Flatten tuple: show each component as "parent.child"
      const tupleValue = value as Record<string, unknown>;
      for (const comp of param.components) {
        const compValue = tupleValue[comp.name || ''];
        const fullName = `${ param.name }.${ comp.name }`;
        result.push({
          name: fullName,
          type: comp.type,
          value: formatValue(comp.type, compValue),
        });
      }
    } else {
      const formatted = formatParam?.[param.name || '']?.(value);
      result.push({
        name: param.name || `param_${ i }`,
        type: param.type,
        value: formatValue(param.type, value),
        formattedValue: formatted,
      });
    }
  }

  return result;
}

function formatValue(type: string, value: unknown): string {
  if (value === undefined || value === null) return '';

  if (type === 'address') {
    return String(value);
  }

  if (type === 'uint256' || type === 'uint16' || type === 'int256') {
    return String(value);
  }

  if (type === 'bool') {
    return String(value);
  }

  if (type === 'bytes' || type === 'string') {
    const str = String(value);
    return str;
  }

  return String(value);
}

interface DecodeResult {
  selector: string;
  func: KnownFunction;
  params: Array<DecodedParam>;
  innerDecode?: DecodeResult;
}

function tryDecode(data: string): DecodeResult | null {
  if (!data || data === '0x' || data.length < 10) return null;

  const selector = data.slice(0, 10).toLowerCase();
  const func = KNOWN_SELECTORS[selector];
  if (!func) return null;

  try {
    const paramsHex = `0x${ data.slice(10) }` as `0x${string}`;
    const decoded = decodeAbiParameters(func.params, paramsHex);
    const params = flattenTupleParams(func.params, decoded as unknown as readonly unknown[], func.formatParam);

    // Try to recursively decode the 'data' param in execute()
    let innerDecode: DecodeResult | undefined;
    if (func.name === 'execute') {
      const dataParam = params.find(p => p.name === 'data');
      if (dataParam?.value && dataParam.value !== '0x') {
        innerDecode = tryDecode(dataParam.value) ?? undefined;
      }
    }

    return { selector, func, params, innerDecode };
  } catch {
    return null;
  }
}

// --- UI Components ---

const HeaderItem = ({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) => (
  <Skeleton
    fontWeight={ 600 }
    pb={ 1 }
    display="inline-block"
    width="fit-content"
    loading={ isLoading }
  >
    { children }
  </Skeleton>
);

const ParamRow = ({ param, isLoading }: { param: DecodedParam; isLoading?: boolean }) => {
  const content = (() => {
    if (param.type === 'address') {
      return (
        <AddressEntity
          address={{ hash: param.value }}
          isLoading={ isLoading }
        />
      );
    }

    if (param.formattedValue) {
      return (
        <Flex alignItems="flex-start" justifyContent="space-between" whiteSpace="normal" wordBreak="break-all" gap={ 2 }>
          <Box>
            <TruncatedValue value={ param.formattedValue } isLoading={ isLoading }/>
            <Box color="text.secondary" fontSize="xs">
              <TruncatedValue value={ param.value } isLoading={ isLoading }/>
            </Box>
          </Box>
          <CopyToClipboard text={ param.value } isLoading={ isLoading }/>
        </Flex>
      );
    }

    return (
      <Flex alignItems="flex-start" justifyContent="space-between" whiteSpace="normal" wordBreak="break-all">
        <TruncatedValue value={ param.value } isLoading={ isLoading }/>
        <CopyToClipboard text={ param.value } isLoading={ isLoading }/>
      </Flex>
    );
  })();

  return (
    <>
      <TruncatedValue value={ param.name } isLoading={ isLoading }/>
      <TruncatedValue value={ param.type } isLoading={ isLoading }/>
      <Skeleton loading={ isLoading } display="inline-block">{ content }</Skeleton>
    </>
  );
};

const DecodedSection = ({ result, isLoading, label }: { result: DecodeResult; isLoading?: boolean; label?: string }) => (
  <Box
    bgColor={{ _light: 'blackAlpha.50', _dark: 'whiteAlpha.50' }}
    borderRadius="md"
    p={ 4 }
    w="100%"
  >
    { /* Header: Method ID + Call */ }
    <Flex gap={ 3 } alignItems="center" mb={ 3 } flexWrap="wrap">
      { label && (
        <Skeleton loading={ isLoading } color="text.secondary" fontSize="xs" fontWeight={ 600 }>
          { label }
        </Skeleton>
      ) }
      <Flex gap={ 2 } alignItems="center">
        <Skeleton loading={ isLoading } fontSize="sm" fontWeight={ 600 }>
          Method id
        </Skeleton>
        <Badge loading={ isLoading }>{ result.selector }</Badge>
      </Flex>
    </Flex>
    <Box mb={ 3 }>
      <Skeleton loading={ isLoading } fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-all">
        { result.func.signature }
      </Skeleton>
    </Box>

    { /* Parameters table */ }
    { result.params.length > 0 && (
      <Grid
        gridTemplateColumns={{ base: '50px 60px minmax(0, 1fr)', lg: '120px 80px minmax(0, 1fr)' }}
        textStyle="sm"
        columnGap={ 5 }
        rowGap={ 3 }
      >
        <HeaderItem isLoading={ isLoading }>Name</HeaderItem>
        <HeaderItem isLoading={ isLoading }>Type</HeaderItem>
        <HeaderItem isLoading={ isLoading }>Data</HeaderItem>
        { result.params.map((param) => (
          <ParamRow key={ param.name } param={ param } isLoading={ isLoading }/>
        )) }
      </Grid>
    ) }

    { /* Recursive inner decode for execute() data param */ }
    { result.innerDecode && (
      <Box mt={ 4 } pl={ 4 } borderLeftWidth="2px" borderLeftColor={{ _light: 'blackAlpha.200', _dark: 'whiteAlpha.200' }}>
        <DecodedSection result={ result.innerDecode } isLoading={ isLoading } label="Inner call"/>
      </Box>
    ) }
  </Box>
);

// --- Main Component ---

interface Props {
  data: string;
  isLoading?: boolean;
}

const FrameDecodedData = ({ data, isLoading }: Props) => {
  const decoded = React.useMemo(() => tryDecode(data), [ data ]);

  if (!decoded) return null;

  return <DecodedSection result={ decoded } isLoading={ isLoading }/>;
};

export default React.memo(FrameDecodedData);
