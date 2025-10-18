export enum EWebhookTriggerType {
  CHANGE = 'CHANGE',
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