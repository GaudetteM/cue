package com.tamarack.cue

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = NativeNotificationsModule.NAME)
class NativeNotificationsModule(
        reactContext: ReactApplicationContext,
) : NativeNotificationsSpec(reactContext) {

    companion object {
        const val NAME = "NativeNotifications"

        const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001

        private var permissionPromise: Promise? = null

        fun onPermissionResult(
                grantResults: IntArray,
        ) {
            val promise = permissionPromise
            permissionPromise = null

            if (promise == null) {
                return
            }

            val granted =
                    grantResults.isNotEmpty() &&
                            grantResults[0] == PackageManager.PERMISSION_GRANTED

            promise.resolve(granted)
        }
    }

    private val notificationService = NotificationService(reactContext)

    override fun getName(): String {
        return NAME
    }

    override fun requestPermission(
            promise: Promise,
    ) {
        // Android 12 and below don't require runtime notification permission.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            promise.resolve(true)
            return
        }

        val activity = currentActivity

        if (activity == null) {
            promise.reject(
                    "NO_ACTIVITY",
                    "Unable to request notification permission without an active Activity.",
            )
            return
        }

        // Already granted.
        if (ContextCompat.checkSelfPermission(
                        activity,
                        Manifest.permission.POST_NOTIFICATIONS,
                ) == PackageManager.PERMISSION_GRANTED
        ) {
            promise.resolve(true)
            return
        }

        // Prevent multiple requests from being queued.
        if (permissionPromise != null) {
            promise.reject(
                    "PERMISSION_REQUEST_IN_PROGRESS",
                    "A notification permission request is already in progress.",
            )
            return
        }

        permissionPromise = promise

        ActivityCompat.requestPermissions(
                activity,
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                NOTIFICATION_PERMISSION_REQUEST_CODE,
        )
    }

    override fun scheduleNotification(
            id: String,
            title: String,
            body: String,
            timestamp: Double,
    ) {
        android.util.Log.d(
                "NativeNotifications",
                "Scheduling notification: id=$id timestamp=$timestamp",
        )

        notificationService.scheduleNotification(
                id = id,
                title = title,
                body = body,
                timestamp = timestamp.toLong(),
        )
    }

    override fun cancelNotification(
            id: String,
    ) {
        notificationService.cancelNotification(id)
    }

    override fun cancelAllNotifications() {
        notificationService.cancelAllNotifications()
    }
}
