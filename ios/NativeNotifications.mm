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

- (NSArray<NSString *> *)notificationIdentifiersForId:(NSString *)notificationId
{
  NSMutableArray<NSString *> *identifiers =
      [NSMutableArray arrayWithObject:notificationId];

  [identifiers addObject:
      [NSString stringWithFormat:@"%@-recurring-daily", notificationId]];

  for (NSInteger day = 1; day <= 31; day++) {
    [identifiers addObject:
        [NSString stringWithFormat:@"%@-recurring-weekly-%ld",
                                   notificationId, (long)day]];

    [identifiers addObject:
        [NSString stringWithFormat:@"%@-recurring-monthly-%ld",
                                   notificationId, (long)day]];
  }

  return identifiers;
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

- (void)scheduleRecurringNotification:(NSString *)notificationId
                                title:(NSString *)title
                                 body:(NSString *)body
                            timestamp:(double)timestamp
                           recurrence:(NSString *)recurrence
                       recurrenceDays:(NSArray<NSNumber *> *)recurrenceDays
{
  if (![recurrence isEqualToString:@"daily"] &&
      ![recurrence isEqualToString:@"weekly"] &&
      ![recurrence isEqualToString:@"monthly"]) {
    NSLog(@"Unsupported notification recurrence: %@", recurrence);
    return;
  }

  if (timestamp <= [[NSDate date] timeIntervalSince1970] * 1000.0) {
    return;
  }

  if ([recurrence isEqualToString:@"weekly"]) {
    if (recurrenceDays.count == 0) return;

    for (NSNumber *day in recurrenceDays) {
      if (day.integerValue < 1 || day.integerValue > 7) return;
    }
  }

  if ([recurrence isEqualToString:@"monthly"]) {
    if (recurrenceDays.count == 0) return;

    for (NSNumber *day in recurrenceDays) {
      if (day.integerValue < 1 || day.integerValue > 31) return;
    }
  }

  UNUserNotificationCenter *center =
      [UNUserNotificationCenter currentNotificationCenter];

  [center removePendingNotificationRequestsWithIdentifiers:
      [self notificationIdentifiersForId:notificationId]];

  NSDate *date =
      [NSDate dateWithTimeIntervalSince1970:timestamp / 1000.0];

  NSCalendar *calendar = [NSCalendar currentCalendar];

  NSDateComponents *timeComponents =
      [calendar components:
          (NSCalendarUnitHour | NSCalendarUnitMinute)
                fromDate:date];

  UNMutableNotificationContent *content =
      [[UNMutableNotificationContent alloc] init];

  content.title = title;
  content.body = body;
  content.sound = [UNNotificationSound defaultSound];

  if ([recurrence isEqualToString:@"daily"]) {
    timeComponents.second = 0;

    UNCalendarNotificationTrigger *trigger =
        [UNCalendarNotificationTrigger
            triggerWithDateMatchingComponents:timeComponents
            repeats:YES];

    NSString *requestId =
        [NSString stringWithFormat:@"%@-recurring-daily", notificationId];

    UNNotificationRequest *request =
        [UNNotificationRequest
            requestWithIdentifier:requestId
            content:content
            trigger:trigger];

    [center addNotificationRequest:request
             withCompletionHandler:^(NSError * _Nullable error) {
      if (error) {
        NSLog(@"Failed to schedule daily reminder: %@", error);
      }
    }];

    return;
  }

  for (NSNumber *dayNumber in recurrenceDays) {
    NSInteger day = dayNumber.integerValue;
    NSDateComponents *components = [timeComponents copy];
    NSString *requestId;

    if ([recurrence isEqualToString:@"weekly"]) {
      // Cue: Monday = 1 ... Sunday = 7.
      // iOS Calendar: Sunday = 1 ... Saturday = 7.
      NSInteger calendarWeekday = day == 7 ? 1 : day + 1;

      components.weekday = calendarWeekday;

      requestId =
          [NSString stringWithFormat:@"%@-recurring-weekly-%ld",
                                     notificationId, (long)day];
    } else {
      components.day = day;

      requestId =
          [NSString stringWithFormat:@"%@-recurring-monthly-%ld",
                                     notificationId, (long)day];
    }

    components.second = 0;

    UNCalendarNotificationTrigger *trigger =
        [UNCalendarNotificationTrigger
            triggerWithDateMatchingComponents:components
            repeats:YES];

    UNNotificationRequest *request =
        [UNNotificationRequest
            requestWithIdentifier:requestId
            content:content
            trigger:trigger];

    [center addNotificationRequest:request
             withCompletionHandler:^(NSError * _Nullable error) {
      if (error) {
        NSLog(@"Failed to schedule recurring reminder: %@", error);
      }
    }];
  }
}

- (void)cancelNotification:(NSString *)notificationId
{
  [[UNUserNotificationCenter currentNotificationCenter]
      removePendingNotificationRequestsWithIdentifiers:
          [self notificationIdentifiersForId:notificationId]];
}

- (void)cancelAllNotifications
{
  [[UNUserNotificationCenter currentNotificationCenter]
      removeAllPendingNotificationRequests];
}

@end
