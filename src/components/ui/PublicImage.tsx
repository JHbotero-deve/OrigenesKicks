"use client";

import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "loader" | "unoptimized"> & {
  src: string;
};

export function PublicImage(props: Props) {
  return (
    <Image
      {...props}
      alt={props.alt ?? ""}
      loader={({ src }) => src}
      unoptimized
    />
  );
}
