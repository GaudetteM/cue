package com.tamarack.cue

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationManagerCompat

class NotificationService(
        private val context: Context,
) {

    companion object {
        private const val CHANNEL_ID = "cue_reminders"
        private const val CHANNEL_NAME = "Cue Reminders"
        private const val CHANNEL_DESCRIPTION = "Notifications for your Cue reminders"
    }

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

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
                        }

        val pendingIntent =
                PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

        android.util.Log.d(
                "NativeNotifications",
                "Setting alarm for timestamp=$timestamp",
        )

        alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                timestamp,
                pendingIntent,
        )
    }

    fun cancelNotification(
            id: String,
    ) {
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

        NotificationManagerCompat.from(context).cancel(id.hashCode())
    }

    fun cancelAllNotifications() {
        NotificationManagerCompat.from(context).cancelAll()
    }
}
