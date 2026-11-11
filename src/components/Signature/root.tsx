import { forwardRef } from "react";

import { SignatureSurface } from "./surface";
import type { SignatureHandle, SignatureProps } from "./types";
import { useSignatureModel } from "./use-signature";

export const SignatureRoot = forwardRef<SignatureHandle, SignatureProps>(
  (props, ref) => <SignatureSurface {...useSignatureModel(props, ref)} />
);
SignatureRoot.displayName = "Signature";
