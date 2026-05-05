import brandJsonRaw from '../../../../brand.json';

export type BrandData = {
  brandCore: {
    name: string;
    tagline: string;
    onSentencePitch?: string;
    brandPromise?: string;
    emotionalOutcome?: string;
    memoryHook?: string;
    [key: string]: unknown;
  };
  voiceAndMessaging: {
    voice: string;
    headlineFormat?: string;
    onBrandPhrases?: string[];
    avoidPhrases?: string[];
    copyRules?: string[];
    [key: string]: unknown;
  };
  complianceGuardrails: {
    pesticideRule?: string;
    allowedLaunchWording?: string[];
    disallowedLaunchWording?: string[];
    requiresOntarioLicensing?: string[];
    [key: string]: unknown;
  };
  trustAndProof: {
    canClaimAtLaunch?: string[];
    cannotClaimYet?: string[];
    photoPolicy?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export const brand = brandJsonRaw as unknown as BrandData;

export const disallowedPhrases: ReadonlyArray<string> =
  brand.complianceGuardrails.disallowedLaunchWording ?? [];

export const allowedPhrases: ReadonlyArray<string> =
  brand.complianceGuardrails.allowedLaunchWording ?? [];

export const cannotClaimYet: ReadonlyArray<string> = brand.trustAndProof.cannotClaimYet ?? [];

export const onBrandPhrases: ReadonlyArray<string> = brand.voiceAndMessaging.onBrandPhrases ?? [];
