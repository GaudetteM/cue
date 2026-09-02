package com.tamarack.cue

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

class NotificationReceiver : BroadcastReceiver() {

    companion object {
        const val EXTRA_ID = "notification_id"
        const val EXTRA_TITLE = "notification_title"
        const val EXTRA_BODY = "notification_body"

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

        android.util.Log.d(
                "NativeNotifications",
                "Building notification",
        )

        val launchIntent =
                Intent(
                                context,
                                MainActivity::class.java,
                        )
                        .apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

                            putExtra(
                                    EXTRA_ID,
                                    id,
                            )
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
}
