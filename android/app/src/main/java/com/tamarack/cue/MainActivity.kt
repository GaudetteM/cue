package com.tamarack.cue

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "Cue"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
          DefaultReactActivityDelegate(
                  this,
                  mainComponentName,
                  fabricEnabled,
          )

  override fun onRequestPermissionsResult(
          requestCode: Int,
          permissions: Array<out String>,
          grantResults: IntArray,
  ) {
    super.onRequestPermissionsResult(
            requestCode,
            permissions,
            grantResults,
    )

    if (requestCode == NativeNotificationsModule.NOTIFICATION_PERMISSION_REQUEST_CODE) {
      NativeNotificationsModule.onPermissionResult(
              grantResults,
      )
    }
  }
}
