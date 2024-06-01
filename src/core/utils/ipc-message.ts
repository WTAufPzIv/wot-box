import { IipcMessage } from '../const/type';

export function createSuccessIpcMessage(payload: any): IipcMessage {
    return {
      status: 1,
      payload,
      message: '',
    }
}
  
export function createFailIpcMessage(message: string): IipcMessage {
    return {
        status: 0,
        payload: null,
        message,
    }
}