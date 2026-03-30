import sendData from './SendData';

export interface UserOption {
  key: string;
  value: string | boolean | number;
  updatedAt: string;
}

export interface UserOptions {
  pushNotifications: boolean;
  locationPrecision: 'high' | 'low';
  darkMode: boolean;
  language: 'fr' | 'en';
  sosContactsEnabled: boolean;
  [x: string]: boolean | 'high' | 'low' | 'fr' | 'en' | undefined;
}

export async function getUserOptions(token: string): Promise<UserOptions> {
  const url = '/api/user/options';
  return sendData(url, {}, `Authorization: Bearer ${token}`);
}

export async function updateOption(key: string, value: any, token: string): Promise<UserOption> {
  const url = `/api/user/options/${key}`;
  const payload = { value };
  return sendData(url, payload, `method: PUT, Authorization: Bearer ${token}`);
}

export async function updateMultipleOptions(options: Partial<UserOptions>, token: string): Promise<UserOptions> {
  const url = '/api/user/options/batch';
  return sendData(url, options, `method: PUT, Authorization: Bearer ${token}`);
}

const OptionService = {
  getUserOptions,
  updateOption,
  updateMultipleOptions,
};

export default OptionService;

