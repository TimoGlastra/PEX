import { InputDescriptor, PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';
import jp from 'jsonpath';
import { Status } from '../../ConstraintUtils';

import { VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { EvaluationHandler } from './evaluationHandler';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler | undefined;

  constructor(private _client: EvaluationClient) {}

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    this.nextHandler = handler;
    return handler;
  }

  public abstract getName(): string;

  public getNext(): EvaluationHandler | undefined {
    return this.nextHandler;
  }

  public hasNext(): boolean {
    return this.nextHandler != undefined;
  }

  public get client(): EvaluationClient {
    return this._client;
  }

  public abstract handle(d: PresentationDefinition, p: VerifiableCredential[]): void;

  public get verifiableCredential(): VerifiableCredential[] {
    return this._client.verifiableCredential;
  }

  public set verifiableCredential(verifiableCredential: Partial<VerifiableCredential>[]) {
    this._client.verifiableCredential = verifiableCredential;
  }

  public get presentationSubmission(): PresentationSubmission {
    return this._client.presentationSubmission;
  }

  public set presentationSubmission(presentationSubmission: PresentationSubmission) {
    this._client.presentationSubmission = presentationSubmission;
  }

  public getResults(): HandlerCheckResult[] {
    return this._client.results;
  }

  public updatePresentationSubmission(pd: PresentationDefinition) {
    this.presentationSubmission.descriptor_map.forEach((descriptor, index, descriptor_map) => {
        /**
         * TODO map the nested credential
         let vcPath = jp.stringify(e.payload.result.path)
         */
        const result = this.getResults().find(result => {
          const inputDescriptor: InputDescriptor = jp.query(pd, result.input_descriptor_path)[0];
          return result.verifiable_credential_path === descriptor.path && inputDescriptor?.id === descriptor.id
            && result.status !== Status.ERROR && result.evaluator === this.getName();
        });
        if (result) {
          descriptor_map[index] = descriptor;
        }
      }
    );
  }
}
