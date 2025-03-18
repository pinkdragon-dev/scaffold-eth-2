import { useTargetNetwork } from "./useTargetNetwork";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

// Size maps moved from the component
export const textSizeMap = {
  "3xs": "text-[10px]",
  "2xs": "text-[11px]",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
} as const;

export const blockieSizeMap = {
  "3xs": 4,
  "2xs": 5,
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
  "4xl": 17,
  "5xl": 19,
  "6xl": 21,
  "7xl": 23,
} as const;

export const copyIconSizeMap = {
  "3xs": "h-2.5 w-2.5",
  "2xs": "h-3 w-3",
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  base: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
  xl: "h-[22px] w-[22px]",
  "2xl": "h-6 w-6",
  "3xl": "h-[26px] w-[26px]",
  "4xl": "h-7 w-7",
} as const;

type SizeMap = typeof textSizeMap | typeof blockieSizeMap;

export const getNextSize = <T extends SizeMap>(sizeMap: T, currentSize: keyof T, step = 1): keyof T => {
  const sizes = Object.keys(sizeMap) as Array<keyof T>;
  const currentIndex = sizes.indexOf(currentSize);
  const nextIndex = Math.min(currentIndex + step, sizes.length - 1);
  return sizes[nextIndex];
};

export const getPrevSize = <T extends SizeMap>(sizeMap: T, currentSize: keyof T, step = 1): keyof T => {
  const sizes = Object.keys(sizeMap) as Array<keyof T>;
  const currentIndex = sizes.indexOf(currentSize);
  const prevIndex = Math.max(currentIndex - step, 0);
  return sizes[prevIndex];
};

export type AddressSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";

interface UseAddressOptions {
  address?: AddressType;
  format?: "short" | "long";
  size?: AddressSize;
  onlyEnsOrAddress?: boolean;
}

interface UseAddressResult {
  checkSumAddress?: AddressType;
  ens?: string | null;
  ensAvatar?: string | null;
  isEnsNameLoading: boolean;
  displayAddress: string | undefined;
  displayEnsOrAddress: string | undefined;
  showSkeleton: boolean;
  addressSize: keyof typeof textSizeMap;
  ensSize: keyof typeof textSizeMap;
  blockieSize: keyof typeof blockieSizeMap;
  blockExplorerAddressLink: string;
  isValidAddress: boolean;
}

export const useAddress = ({
  address,
  format,
  size = "base",
  onlyEnsOrAddress = false,
}: UseAddressOptions): UseAddressResult => {
  const checkSumAddress = address ? getAddress(address) : undefined;
  const { targetNetwork } = useTargetNetwork();

  const { data: ens, isLoading: isEnsNameLoading } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ens ? normalize(ens) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ens),
      gcTime: 30_000,
    },
  });

  const shortAddress = checkSumAddress ? `${checkSumAddress.slice(0, 6)}...${checkSumAddress.slice(-4)}` : undefined;
  const displayAddress = format === "long" ? checkSumAddress : shortAddress;
  const displayEnsOrAddress = ens || displayAddress;

  const showSkeleton = Boolean(!checkSumAddress || (!onlyEnsOrAddress && (ens || isEnsNameLoading)));

  const addressSize = showSkeleton && !onlyEnsOrAddress ? getPrevSize(textSizeMap, size, 2) : size;
  const ensSize = getNextSize(textSizeMap, addressSize);
  const blockieSize = showSkeleton && !onlyEnsOrAddress ? getNextSize(blockieSizeMap, addressSize, 4) : addressSize;

  const isValidAddress = checkSumAddress ? isAddress(checkSumAddress) : false;
  const blockExplorerAddressLink = checkSumAddress ? getBlockExplorerAddressLink(targetNetwork, checkSumAddress) : "";

  return {
    checkSumAddress,
    ens, // yes
    ensAvatar, // yes
    isEnsNameLoading, // yes
    displayAddress, // no
    displayEnsOrAddress,
    showSkeleton, // no
    addressSize, // no
    ensSize, // no
    blockieSize, // no // instead we should return the blo(address as `0x${string}`) (the image url)
    blockExplorerAddressLink, // yes
    isValidAddress, // maybe
  };
};
