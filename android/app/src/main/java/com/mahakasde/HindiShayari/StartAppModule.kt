package com.mahakasde.HindiShayari

import com.facebook.react.bridge.*
import com.startapp.sdk.adsbase.StartAppSDK
import com.startapp.sdk.adsbase.StartAppAd

class StartAppModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StartAppAds"

    @ReactMethod
    fun initialize(appId: String) {
        StartAppSDK.init(reactApplicationContext, appId, false)
    }

    @ReactMethod
    fun showInterstitial() {
        val activity = currentActivity
        if (activity != null) {
            val ad = StartAppAd(activity)
            ad.loadAd()
            ad.showAd()
        }
    }
}
