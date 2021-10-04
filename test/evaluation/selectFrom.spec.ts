import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClientWrapper } from '../../lib/evaluation/evaluationClientWrapper';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const did = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('selectFrom tests', () => {
  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[0]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
        'errors': [],
        'matches': [
          {
            'count': 3,
            'from': ['A'],
            'matches': ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
            'name': 'Submission of educational transcripts',
            'rule': 'all'
          }
        ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
      }
    );
  });

  it('Evaluate submission requirements min 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[1]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 2,
          'from': ['B'],
          'matches': [
            '$.verifiableCredential[1]',
            '$.verifiableCredential[2]'
          ],
          'name': 'Eligibility to Work Proof',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements either all from group A or 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[2]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 1,
          'from_nested': [
            {
              'count': 3,
              'from': ['A'],
              'matches': [
                '$.verifiableCredential[0]',
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'all'
            },
            {
              'count': 2,
              'from': ['B'],
              'matches': [
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'pick'
            }
          ],
          'matches': [],
          'name':
            'Confirm banking relationship or employment and residence proofs',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements max 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[3]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 2,
          'from': ['B'],
          'matches': [
            '$.verifiableCredential[1]',
            '$.verifiableCredential[2]'
          ],
          'name': 'Eligibility to Work Proof',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements all from group A and 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[8]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 1,
          'from_nested': [
            {
              'count': 3,
              'from': ['A'],
              'matches': [
                '$.verifiableCredential[0]',
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'all'
            },
            {
              'count': 2,
              'from': ['B'],
              'matches': [
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'pick'
            }
          ],
          'matches': [],
          'name': 'Confirm banking relationship or employment and residence proofs',
          'rule': 'all'
        }
      ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements min 1: (all from group A or 2 from group B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[9]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 1,
          'from_nested': [
            {
              'count': 3,
              'from': ['A'],
              'matches': [
                '$.verifiableCredential[0]',
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'all'
            },
            {
              'count': 2,
              'from': ['B'],
              'matches': [
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'pick'
            }
          ],
          'matches': [],
          'name': 'Confirm banking relationship or employment and residence proofs',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements max 2: (all from group A and 2 from group B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[10]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 1,
          'from_nested': [
            {
              'count': 3,
              'from': ['A'],
              'matches': [
                '$.verifiableCredential[0]',
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'all'
            },
            {
              'count': 2,
              'from': ['B'],
              'matches': [
                '$.verifiableCredential[1]',
                '$.verifiableCredential[2]'
              ],
              'name': undefined,
              'rule': 'pick'
            }
          ],
          'matches': [],
          'name': 'Confirm banking relationship or employment and residence proofs',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements min 3 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[4]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 2,
          'from': ['B'],
          'matches': [
            '$.verifiableCredential[1]',
            '$.verifiableCredential[2]'
          ],
          'name': 'Eligibility to Work Proof',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements max 1 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[5]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 2,
          'from': ['B'],
          'matches': [
            '$.verifiableCredential[1]',
            '$.verifiableCredential[2]'
          ],
          'name': 'Eligibility to Work Proof',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements exactly 1 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[6]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 2,
          'from': ['B'],
          'matches': [
            '$.verifiableCredential[1]',
            '$.verifiableCredential[2]'
          ],
          'name': 'Eligibility to Work Proof',
          'rule': 'pick'
        }
      ],
      "verifiableCredentials": [
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements all from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[7]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          'count': 2,
          'from': ['B'],
          'matches': [
            '$.verifiableCredential[1]',
            '$.verifiableCredential[2]'
          ],
          'name': 'Submission of educational transcripts',
          'rule': 'all'
        }
      ],
      "verifiableCredentials": [
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements min 3: (all from group A or 2 from group B + unexistent)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[11]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          "count": 1,
          "from_nested": [
            {
              "count": 3,
              "from": [
                "A"
              ],
              "matches": [
                "$.verifiableCredential[0]",
                "$.verifiableCredential[1]",
                "$.verifiableCredential[2]"
              ],
              "rule": "all"
            },
            {
              "count": 2,
              "from": [
                "B"
              ],
              "matches": [
                "$.verifiableCredential[1]",
                "$.verifiableCredential[2]"
              ],
              "rule": "pick"
            }
          ],
          "matches": [],
          "name": "Confirm banking relationship or employment and residence proofs",
          "rule": "pick"
        }
      ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate submission requirements max 1: (all from group A and 2 from group B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[12]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(evaluationClientWrapper.selectFrom(pdSchema, vpSimple.verifiableCredential, did)).toEqual({
      'errors': [],
      'matches': [
        {
          "count": 1,
          "from_nested": [
            {
              "count": 3,
              "from": [
                "A"
              ],
              "matches": [
                "$.verifiableCredential[0]",
                "$.verifiableCredential[1]",
                "$.verifiableCredential[2]"
              ],
              "rule": "all"
            },
            {
              "count": 2,
              "from": [
                "B"
              ],
              "matches": [
                "$.verifiableCredential[1]",
                "$.verifiableCredential[2]"
              ],
              "rule": "pick"
            }
          ],
          "matches": [],
          "name": "Confirm banking relationship or employment and residence proofs",
          "rule": "pick"
        }
      ],
      "verifiableCredentials": [
        {
          "comment": "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
          "vc": {
            "@context": "https://eu.com/claims/DriversLicense",
            "credentialSubject": {
              "accounts": [
                {
                  "id": "1234567890",
                  "route": "DE-9876543210"
                },
                {
                  "id": "2457913570",
                  "route": "DE-0753197542"
                }
              ],
              "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
            },
            "id": "https://eu.com/claims/DriversLicense",
            "issuanceDate": "2010-01-01T19:73:24Z",
            "issuer": "did:example:123",
            "type": [
              "EUDriversLicense"
            ]
          }
        },
        {
          "@context": "https://business-standards.org/schemas/employment-history.json",
          "credentialSubject": {
            "active": true,
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          "id": "https://business-standards.org/schemas/employment-history.json",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "VerifiableCredential",
            "GenericEmploymentCredential"
          ]
        },
        {
          "@context": "https://www.w3.org/2018/credentials/v1",
          "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "license": {
              "dob": "07/13/80",
              "number": "34DGE352"
            }
          },
          "id": "https://eu.com/claims/DriversLicense",
          "issuanceDate": "2010-01-01T19:73:24Z",
          "issuer": "did:foo:123",
          "proof": {
            "created": "2017-06-18T21:19:10Z",
            "jws": "...",
            "proofPurpose": "assertionMethod",
            "type": "RsaSignature2018",
            "verificationMethod": "https://example.edu/issuers/keys/1"
          },
          "type": [
            "EUDriversLicense"
          ]
        }
      ],
      'warnings': []
    });
  });

  it('Evaluate case without presentation submission', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-PermanentResidentCard.json').presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const result = evaluationClientWrapper.selectFrom(pdSchema, [vc], 'FAsYneKJhWBP2n5E21ZzdY');
    expect(result.errors.length).toEqual(0);
    expect(result.matches[0].name).toEqual("EU Driver's License");
    expect(result.matches[0].count).toEqual(1);
  });

  it('Evaluate driver license name result', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd_driver_license_name.json').presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vc-driverLicense.json');
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const result = evaluationClientWrapper.selectFrom(pdSchema, [vc], 'FAsYneKJhWBP2n5E21ZzdY');
    expect(result.errors.length).toEqual(0);
    expect(result.matches[0].name).toEqual(pdSchema.submission_requirements[0].name);
  });
});
