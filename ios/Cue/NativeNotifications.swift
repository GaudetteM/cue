import Foundation
import UserNotifications

@objc(NativeNotificationsService)
class NativeNotificationsService: NSObject {

    @objc
    func requestPermission(
        _ resolve: @escaping (Any?) -> Void,
        reject: @escaping (String, String?, Error?) -> Void
    ) {
        let center = UNUserNotificationCenter.current()

        center.requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, error in

            if let error = error {
                reject(
                    "PERMISSION_ERROR",
                    error.localizedDescription,
                    error
                )
                return
            }

            resolve(granted)
        }
    }

    @objc
    func scheduleNotification(
        _ id: String,
        title: String,
        body: String,
        timestamp: Double
    ) {
        let content = UNMutableNotificationContent()

        content.title = title
        content.body = body
        content.sound = .default

        // JavaScript timestamps are milliseconds since Unix epoch.
        let date = Date(timeIntervalSince1970: timestamp / 1000.0)

        let calendar = Calendar.current

        let components = calendar.dateComponents(
            [
                .year,
                .month,
                .day,
                .hour,
                .minute
            ],
            from: date
        )

        let trigger = UNCalendarNotificationTrigger(
            dateMatching: components,
            repeats: false
        )

        let request = UNNotificationRequest(
            identifier: id,
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule notification: \(error)")
            }
        }
    }

    @objc
    func cancelNotification(_ id: String) {
        UNUserNotificationCenter.current()
            .removePendingNotificationRequests(
                withIdentifiers: [id]
            )
    }

    @objc
    func cancelAllNotifications() {
        UNUserNotificationCenter.current()
            .removeAllPendingNotificationRequests()
    }
}
