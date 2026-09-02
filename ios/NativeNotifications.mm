#import <UserNotifications/UserNotifications.h>

#import <ReactCodegen/CueSpecs/CueSpecs.h>

@interface NativeNotifications : NSObject <NativeNotificationsSpec>
@end

@implementation NativeNotifications

RCT_EXPORT_MODULE(NativeNotifications)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeNotificationsSpecJSI>(params);
}

- (void)requestPermission:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  UNUserNotificationCenter *center =
      [UNUserNotificationCenter currentNotificationCenter];

  [center requestAuthorizationWithOptions:
              (UNAuthorizationOptionAlert |
               UNAuthorizationOptionSound |
               UNAuthorizationOptionBadge)
                       completionHandler:
      ^(BOOL granted, NSError * _Nullable error) {

        if (error) {
          reject(
              @"PERMISSION_ERROR",
              error.localizedDescription,
              error
          );
          return;
        }

        resolve(@(granted));
      }];
}

- (void)scheduleNotification:(NSString *)notificationId
                       title:(NSString *)title
                        body:(NSString *)body
                   timestamp:(double)timestamp
{
  UNMutableNotificationContent *content =
      [[UNMutableNotificationContent alloc] init];

  content.title = title;
  content.body = body;
  content.sound = [UNNotificationSound defaultSound];

  // JavaScript timestamps are milliseconds since Unix epoch.
  NSDate *date =
      [NSDate dateWithTimeIntervalSince1970:timestamp / 1000.0];

  NSCalendar *calendar = [NSCalendar currentCalendar];

  NSDateComponents *components =
      [calendar components:
          (NSCalendarUnitYear |
           NSCalendarUnitMonth |
           NSCalendarUnitDay |
           NSCalendarUnitHour |
           NSCalendarUnitMinute)
                fromDate:date];

  UNCalendarNotificationTrigger *trigger =
      [UNCalendarNotificationTrigger
          triggerWithDateMatchingComponents:components
          repeats:NO];

  UNNotificationRequest *request =
      [UNNotificationRequest
          requestWithIdentifier:notificationId
          content:content
          trigger:trigger];

  [[UNUserNotificationCenter currentNotificationCenter]
      addNotificationRequest:request
      withCompletionHandler:^(NSError * _Nullable error) {

        if (error) {
          NSLog(@"Failed to schedule notification: %@", error);
        }
      }];
}

- (void)cancelNotification:(NSString *)notificationId
{
  [[UNUserNotificationCenter currentNotificationCenter]
      removePendingNotificationRequestsWithIdentifiers:
          @[notificationId]];
}

- (void)cancelAllNotifications
{
  [[UNUserNotificationCenter currentNotificationCenter]
      removeAllPendingNotificationRequests];
}

@end
