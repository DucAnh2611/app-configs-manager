export enum EWebhookTriggerType {
  CHANGE = 'CHANGE',
  REMOVE = 'REMOVE',
}

export enum EWebhookTriggerOn {
  APIKEY = 'APIKEY',
  CONFIG = 'CONFIG',
}

export enum EWebhookMethod {
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  GET = 'GET',
}

export enum EWebhookBodyType {
  JSON = 'JSON',
  FORM_DATA = 'formData',
}

export enum EWebhookHistoryStatus {
  SUCCESS = 'SUCCESS',
  IN_QUEUE = 'IN_QUEUE',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
}
