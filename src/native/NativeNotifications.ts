import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  requestPermission(): Promise<boolean>;

  scheduleNotification(
    id: string,
    title: string,
    body: string,
    timestamp: number,
  ): void;

  cancelNotification(id: string): void;

  cancelAllNotifications(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeNotifications');
