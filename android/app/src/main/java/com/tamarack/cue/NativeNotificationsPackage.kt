package com.tamarack.cue

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NativeNotificationsPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext,
    ): NativeModule? {
        return when (name) {
            NativeNotificationsModule.NAME ->
                NativeNotificationsModule(reactContext)

            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                NativeNotificationsModule.NAME to ReactModuleInfo(
                    NativeNotificationsModule.NAME,
                    NativeNotificationsModule::class.java.name,
                    false,
                    false,
                    false,
                    true,
                )
            )
        }
    }
}