package com.tamarackstudios.cue

import android.Manifest
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import java.util.Calendar

class NotificationReceiver : BroadcastReceiver() {

    companion object {
        const val EXTRA_ID = "notification_id"
        const val EXTRA_TITLE = "notification_title"
        const val EXTRA_BODY = "notification_body"
        const val EXTRA_TIMESTAMP = "notification_timestamp"
        const val EXTRA_RECURRENCE = "notification_recurrence"
        const val EXTRA_RECURRENCE_DAYS = "notification_recurrence_days"

        private const val CHANNEL_ID = "cue_reminders"
    }

    override fun onReceive(
            context: Context,
            intent: Intent,
    ) {
        android.util.Log.d(
                "NativeNotifications",
                "NotificationReceiver received alarm",
        )

        val id = intent.getStringExtra(EXTRA_ID)
        val title = intent.getStringExtra(EXTRA_TITLE)
        val body = intent.getStringExtra(EXTRA_BODY)

        android.util.Log.d(
                "NativeNotifications",
                "id=$id title=$title body=$body",
        )

        if (id == null || title == null || body == null) {
            android.util.Log.e(
                    "NativeNotifications",
                    "Missing notification extras",
            )
            return
        }

        val recurrence = intent.getStringExtra(EXTRA_RECURRENCE)
        val recurrenceDays = intent.getIntArrayExtra(EXTRA_RECURRENCE_DAYS)?.toList().orEmpty()
        val scheduledTimestamp = intent.getLongExtra(EXTRA_TIMESTAMP, -1L)

        // Schedule the next occurrence before attempting to display
        // this notification, so a missing permission doesn't stop recurrence.
        if (recurrence != null && scheduledTimestamp > 0L) {
            val nextTimestamp =
                    getNextOccurrenceTimestamp(
                            scheduledTimestamp = scheduledTimestamp,
                            now = System.currentTimeMillis(),
                            recurrence = recurrence,
                            recurrenceDays = recurrenceDays,
                    )

            if (nextTimestamp != null) {
                NotificationService(context)
                        .scheduleRecurringNotification(
                                id = id,
                                title = title,
                                body = body,
                                timestamp = nextTimestamp,
                                recurrence = recurrence,
                                recurrenceDays = recurrenceDays,
                        )
            }
        }

        val permissionGranted =
                Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
                        ContextCompat.checkSelfPermission(
                                context,
                                Manifest.permission.POST_NOTIFICATIONS,
                        ) == PackageManager.PERMISSION_GRANTED

        android.util.Log.d(
                "NativeNotifications",
                "Notification permission granted=$permissionGranted",
        )

        if (!permissionGranted) {
            android.util.Log.e(
                    "NativeNotifications",
                    "Notification permission is not granted",
            )
            return
        }

        val launchIntent =
                Intent(
                                context,
                                MainActivity::class.java,
                        )
                        .apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

                            putExtra(EXTRA_ID, id)
                        }

        val pendingIntent =
                PendingIntent.getActivity(
                        context,
                        id.hashCode(),
                        launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

        val notification =
                NotificationCompat.Builder(
                                context,
                                CHANNEL_ID,
                        )
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setContentIntent(pendingIntent)
                        .setAutoCancel(true)
                        .build()

        try {
            android.util.Log.d(
                    "NativeNotifications",
                    "Calling NotificationManager.notify()",
            )

            NotificationManagerCompat.from(context).notify(id.hashCode(), notification)

            android.util.Log.d(
                    "NativeNotifications",
                    "NotificationManager.notify() completed",
            )
        } catch (exception: Exception) {
            android.util.Log.e(
                    "NativeNotifications",
                    "Failed to show notification",
                    exception,
            )
        }
    }

    private fun getNextOccurrenceTimestamp(
            scheduledTimestamp: Long,
            now: Long,
            recurrence: String,
            recurrenceDays: List<Int>,
    ): Long? {
        if (recurrence !in setOf("daily", "weekly", "monthly")) {
            return null
        }

        if (recurrence == "weekly" &&
                        (recurrenceDays.isEmpty() || recurrenceDays.any { it !in 1..7 })
        ) {
            return null
        }

        if (recurrence == "monthly" &&
                        (recurrenceDays.isEmpty() || recurrenceDays.any { it !in 1..31 })
        ) {
            return null
        }

        val candidate = Calendar.getInstance().apply { timeInMillis = scheduledTimestamp }

        for (dayOffset in 1..366) {
            candidate.add(Calendar.DAY_OF_MONTH, 1)

            // Ignore occurrences that have already passed, including
            // while the device was asleep or the app was not running.
            if (candidate.timeInMillis <= now) {
                continue
            }

            val weekday =
                    when (candidate.get(Calendar.DAY_OF_WEEK)) {
                        Calendar.SUNDAY -> 7
                        else -> candidate.get(Calendar.DAY_OF_WEEK) - 1
                    }

            val dayOfMonth = candidate.get(Calendar.DAY_OF_MONTH)

            val matches =
                    when (recurrence) {
                        "daily" -> true
                        "weekly" -> weekday in recurrenceDays
                        "monthly" -> dayOfMonth in recurrenceDays
                        else -> false
                    }

            if (matches) {
                return candidate.timeInMillis
            }
        }

        return null
    }
}
