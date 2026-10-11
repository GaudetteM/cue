package com.tamarack.cue

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import androidx.core.app.NotificationManagerCompat

class NotificationService(
        private val context: Context,
) {
    companion object {
        private const val CHANNEL_ID = "cue_reminders"
        private const val CHANNEL_NAME = "Cue Reminders"
        private const val CHANNEL_DESCRIPTION = "Notifications for your Cue reminders"
        private const val PREFS_NAME = "cue_scheduled_notifications"
        private const val KEY_NOTIFICATION_IDS = "notification_ids"
    }

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    private val preferences: SharedPreferences =
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val channel =
                NotificationChannel(
                                CHANNEL_ID,
                                CHANNEL_NAME,
                                NotificationManager.IMPORTANCE_DEFAULT,
                        )
                        .apply { description = CHANNEL_DESCRIPTION }

        val manager =
                context.getSystemService(
                        Context.NOTIFICATION_SERVICE,
                ) as
                        NotificationManager

        manager.createNotificationChannel(channel)
    }

    fun scheduleNotification(
            id: String,
            title: String,
            body: String,
            timestamp: Long,
    ) {
        val intent =
                Intent(
                                context,
                                NotificationReceiver::class.java,
                        )
                        .apply {
                            putExtra(NotificationReceiver.EXTRA_ID, id)
                            putExtra(NotificationReceiver.EXTRA_TITLE, title)
                            putExtra(NotificationReceiver.EXTRA_BODY, body)
                            putExtra(NotificationReceiver.EXTRA_TIMESTAMP, timestamp)
                        }

        val pendingIntent =
                PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

        alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                timestamp,
                pendingIntent,
        )

        trackNotification(id)
    }

    fun scheduleRecurringNotification(
            id: String,
            title: String,
            body: String,
            timestamp: Long,
            recurrence: String,
            recurrenceDays: List<Int>,
    ) {
        if (recurrence !in setOf("daily", "weekly", "monthly")) {
            return
        }

        if (recurrence == "weekly" &&
                        (recurrenceDays.isEmpty() || recurrenceDays.any { it !in 1..7 })
        ) {
            return
        }

        if (recurrence == "monthly" &&
                        (recurrenceDays.isEmpty() || recurrenceDays.any { it !in 1..31 })
        ) {
            return
        }

        if (timestamp <= System.currentTimeMillis()) {
            return
        }

        val intent =
                Intent(
                                context,
                                NotificationReceiver::class.java,
                        )
                        .apply {
                            putExtra(NotificationReceiver.EXTRA_ID, id)
                            putExtra(NotificationReceiver.EXTRA_TITLE, title)
                            putExtra(NotificationReceiver.EXTRA_BODY, body)
                            putExtra(NotificationReceiver.EXTRA_TIMESTAMP, timestamp)
                            putExtra(NotificationReceiver.EXTRA_RECURRENCE, recurrence)
                            putExtra(
                                    NotificationReceiver.EXTRA_RECURRENCE_DAYS,
                                    recurrenceDays.toIntArray(),
                            )
                        }

        val pendingIntent =
                PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

        alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                timestamp,
                pendingIntent,
        )

        trackNotification(id)
    }

    private fun trackNotification(id: String) {
        val ids =
                preferences
                        .getStringSet(
                                KEY_NOTIFICATION_IDS,
                                emptySet(),
                        )
                        .orEmpty()
                        .toMutableSet()

        ids.add(id)

        preferences.edit().putStringSet(KEY_NOTIFICATION_IDS, ids).apply()
    }

    fun cancelNotification(id: String) {
        val intent =
                Intent(
                        context,
                        NotificationReceiver::class.java,
                )

        val pendingIntent =
                PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

        alarmManager.cancel(pendingIntent)
        pendingIntent.cancel()

        NotificationManagerCompat.from(context).cancel(id.hashCode())

        val ids =
                preferences
                        .getStringSet(
                                KEY_NOTIFICATION_IDS,
                                emptySet(),
                        )
                        .orEmpty()
                        .toMutableSet()

        ids.remove(id)

        preferences.edit().putStringSet(KEY_NOTIFICATION_IDS, ids).apply()
    }

    fun cancelAllNotifications() {
        val ids =
                preferences
                        .getStringSet(
                                KEY_NOTIFICATION_IDS,
                                emptySet(),
                        )
                        .orEmpty()
                        .toList()

        ids.forEach(::cancelNotification)

        NotificationManagerCompat.from(context).cancelAll()
    }
}
