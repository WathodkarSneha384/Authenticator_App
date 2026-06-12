import { create } from 'zustand';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info' | 'confirm';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  variant: AlertVariant;
  buttons: AlertButton[];
};

type AlertActions = {
  showAlert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    variant?: AlertVariant,
  ) => void;
  hideAlert: () => void;
};

const DEFAULT_BUTTONS: AlertButton[] = [{ text: 'OK' }];

export const useAlertStore = create<AlertState & AlertActions>((set, get) => ({
  visible: false,
  title: '',
  message: '',
  variant: 'info',
  buttons: DEFAULT_BUTTONS,

  showAlert: (title, message = '', buttons, variant = 'info') => {
    set({
      visible: true,
      title,
      message,
      variant,
      buttons: buttons ?? DEFAULT_BUTTONS,
    });
  },

  hideAlert: () => set({ visible: false }),
}));

/** Drop-in replacement for Alert.alert with branded styling. */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  variant?: AlertVariant,
) {
  const inferred = variant ?? inferVariant(title);
  useAlertStore.getState().showAlert(title, message ?? '', buttons, inferred);
}

function inferVariant(title: string): AlertVariant {
  const t = title.toLowerCase();
  if (t.includes('error') || t.includes('invalid') || t.includes('expired')) return 'error';
  if (t.includes('submitted') || t.includes('success') || t.includes('registered')) return 'success';
  if (t.includes('reset') || t.includes('logout') || t.includes('clear')) return 'confirm';
  if (t.includes('pending') || t.includes('alert')) return 'warning';
  return 'info';
}

export function appAlertError(title: string, message: string) {
  appAlert(title, message, undefined, 'error');
}

export function appAlertSuccess(title: string, message: string, onOk?: () => void) {
  appAlert(
    title,
    message,
    [{ text: 'OK', onPress: onOk }],
    'success',
  );
}

export function appAlertConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Confirm',
  destructive = false,
) {
  appAlert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ],
    'confirm',
  );
}
