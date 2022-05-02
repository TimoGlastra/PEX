import {PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2} from '@sphereon/pex-models';
import jwt_decode from 'jwt-decode';

import {JsonPathUtils} from '../utils';
import {ObjectUtils} from "../utils/ObjectUtils";

import {
  InternalCredential,
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  VerifiableDataExchangeType,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation
} from './Internal.types';
import {
  IPresentation,
  IPresentationDefinition,
  IVerifiableCredential,
  IVerifiablePresentation
} from './SSI.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): InternalPresentationDefinitionV1 {
    const pd: PdV1 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p) as PdV1;
    return new InternalPresentationDefinitionV1(
      pd.id,
      pd.input_descriptors,
      pd.format,
      pd.name,
      pd.purpose,
      pd.submission_requirements
    );
  }

  public static createInternalPresentationDefinitionV2FromModelEntity(p: PdV2): InternalPresentationDefinitionV2 {
    const pd: PdV2 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p);
    return new InternalPresentationDefinitionV2(
      pd.id,
      pd.input_descriptors,
      pd.format,
      pd.frame,
      pd.name,
      pd.purpose,
      pd.submission_requirements
    );
  }

  static createCopyAndModifyPresentationDefinition(p: IPresentationDefinition): IPresentationDefinition {
    const pd: IPresentationDefinition = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(pd, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(pd, '_enum', 'enum');
    JsonPathUtils.changeSpecialPathsRecursively(pd);
    return pd;
  }

  /*static mapExternalVerifiableCredentialsToInternal(
    externalCredentials: IVerifiableCredential[]
  ): InternalVerifiableCredential[] {
    const internalVCs: InternalVerifiableCredential[] = [];
    for (const externalCredential of externalCredentials) {
      internalVCs.push(this.mapExternalVerifiableCredentialToInternal(externalCredential));
    }
    return internalVCs;
  }

  private static mapExternalVerifiableCredentialToInternal(externalCredential: IVerifiableCredential) {
    if (externalCredential.vc && externalCredential.iss) {
      const vc: InternalVerifiableCredential = new InternalVerifiableCredentialJwt();
      const result = Object.assign(vc, externalCredential);
      return SSITypesBuilder.setJWTAdditionalFields(result);
    } else if (externalCredential.credentialSubject && externalCredential.id) {
      const vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
      return Object.assign(vc, externalCredential);
    }
    throw 'VerifiableCredential structure is incorrect.';
  }

  private static setJWTAdditionalFields(result: InternalVerifiableCredentialJwt & IJwtCredential & IHasProof) {
    if (result.exp) {
      const expDate = result.getBaseCredential().credentialSubject?.expirationDate;
      const jwtExp = parseInt(result.exp.toString());
      // fix seconds to millisecs for the date
      const expAsDateStr =
        jwtExp < 9999999999
          ? new Date(jwtExp * 1000).toISOString().replace(/\.000Z/, 'Z')
          : new Date(jwtExp).toISOString();
      if (expDate && expDate !== expAsDateStr) {
        throw new Error(`Inconsistent expiration dates between JWT claim (${expAsDateStr}) and VC value (${expDate})`);
      }
      result.getBaseCredential().credentialSubject.expirationDate = expAsDateStr;
    }

    if (result.nbf) {
      const issuanceDate = result.getBaseCredential().issuanceDate;
      const jwtNbf = parseInt(result.nbf.toString());
      // fix seconds to millisecs for the date
      const nbfAsDateStr =
        jwtNbf < 9999999999
          ? new Date(jwtNbf * 1000).toISOString().replace(/\.000Z/, 'Z')
          : new Date(jwtNbf).toISOString();
      if (issuanceDate && issuanceDate !== nbfAsDateStr) {
        throw new Error(
          `Inconsistent issuance dates between JWT claim (${nbfAsDateStr}) and VC value (${issuanceDate})`
        );
      }
      result.getBaseCredential().issuanceDate = nbfAsDateStr;
    }

    if (result.iss) {
      const issuer = result.getBaseCredential().issuer;
      if (issuer) {
        if (typeof issuer === 'string') {
          if (issuer !== result.iss) {
            throw new Error(`Inconsistent issuers between JWT claim (${result.iss}) and VC value (${issuer})`);
          }
        } else {
          if (issuer.id !== result.iss) {
            throw new Error(`Inconsistent issuers between JWT claim (${result.iss}) and VC value (${issuer.id})`);
          }
        }
      }
      result.getBaseCredential().issuer = result.iss;
    }

    if (result.sub) {
      const csId = result.getBaseCredential().credentialSubject?.id;
      if (csId && csId !== result.sub) {
        throw new Error(`Inconsistent credential subject ids between JWT claim (${result.sub}) and VC value (${csId})`);
      }
      result.getBaseCredential().credentialSubject.id = result.sub;
    }
    if (result.jti) {
      const id = result.getBaseCredential().id;
      if (id && id !== result.jti) {
        throw new Error(`Inconsistent credential ids between JWT claim (${result.jti}) and VC value (${id})`);
      }
      result.getBaseCredential().id = result.jti;
    }
    return result;
  }*/

  static mapExternalVerifiablePresentationToWrappedVP(presentationCopy: IPresentation): WrappedVerifiablePresentation {
    const isjwtEncoded: boolean = ObjectUtils.isString(presentationCopy);
    const type: VerifiableDataExchangeType = isjwtEncoded ? VerifiableDataExchangeType.JWT_ENCODED : VerifiableDataExchangeType.JSONLD
    const vp = isjwtEncoded ? this.decodeJwtVerifiablePresentation(presentationCopy as unknown as string) : presentationCopy;
    return {
      type: type,
      original: isjwtEncoded ? jwt_decode(presentationCopy as unknown as string) : presentationCopy,
      decoded: vp,
      vcs: this.mapExternalVerifiableCredentialsToWrappedVc(vp.verifiableCredential)
    };
  }

  private static decodeJwtVerifiablePresentation(jwtvp: string): IPresentation {
    const externalPresentationJwt: {
      vp: unknown,
      exp: string,
      iss: string,
      nbf: string,
      sub: string,
      jti: string
    } = jwt_decode(jwtvp as unknown as string);
    return {
      ...externalPresentationJwt,
      expirationDate: externalPresentationJwt.exp,
      holder: externalPresentationJwt.iss,
      issuanceDate: externalPresentationJwt.nbf,
      id: externalPresentationJwt.jti
    } as unknown as IPresentation;
  }

  static mapExternalVerifiableCredentialsToWrappedVc(verifiableCredentials: IVerifiableCredential[]): WrappedVerifiableCredential[] {
    const wrappedVcs: WrappedVerifiableCredential[] = [];
    for (let i = 0; i < verifiableCredentials.length; i++) {
      wrappedVcs.push(this.mapExternalVerifiableCredentialToWrappedVc(verifiableCredentials[i]));
    }
    return wrappedVcs;
  }

  private static mapExternalVerifiableCredentialToWrappedVc(verifiableCredential: IVerifiableCredential): WrappedVerifiableCredential {
    if (ObjectUtils.isString(verifiableCredential)) {
      const externalCredentialJwt: {
        vc: unknown,
        exp: string,
        iss: string,
        nbf: string,
        sub: string,
        jti: string
      } = jwt_decode(verifiableCredential as unknown as string)
      return {
        original: verifiableCredential,
        decoded: jwt_decode(verifiableCredential as unknown as string),
        type: VerifiableDataExchangeType.JWT_ENCODED,
        internalCredential: {
          ...externalCredentialJwt,
          expirationDate: externalCredentialJwt.exp,
          issuer: externalCredentialJwt.iss,
          issuanceDate: externalCredentialJwt.nbf,
          id: externalCredentialJwt.jti
        } as unknown as InternalCredential
      }
    }
    else if (verifiableCredential["vc"]) {
      return {
        original: verifiableCredential,
        decoded: verifiableCredential,
        type: VerifiableDataExchangeType.JWT_DECODED,
        internalCredential: {
          ...verifiableCredential,
          expirationDate: verifiableCredential.exp,
          issuer: verifiableCredential.iss,
          issuanceDate: verifiableCredential.nbf,
          id: verifiableCredential.jti
        } as unknown as InternalCredential
      }
    } else {
      return {
        original: verifiableCredential,
        decoded: verifiableCredential,
        type: VerifiableDataExchangeType.JSONLD,
        internalCredential: verifiableCredential as InternalCredential
      }
    }
  }
}
