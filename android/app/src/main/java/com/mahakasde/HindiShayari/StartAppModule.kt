package com.mahakasde.HindiShayari

import com.facebook.react.bridge.*
import com.startapp.sdk.adsbase.StartAppSDK
import com.startapp.sdk.adsbase.StartAppAd
import com.startapp.sdk.adsbase.Ad
import com.startapp.sdk.adsbase.adlisteners.AdEventListener
import com.startapp.sdk.adsbase.adlisteners.VideoListener

class StartAppModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var startAppAd: StartAppAd = StartAppAd(reactContext)

    override fun getName(): String {
        return "StartAppAds"
    }

    @ReactMethod
    fun initialize(appId: String) {
        StartAppSDK.init(reactApplicationContext, appId, true)
    }

    @ReactMethod
  fun showInterstitial() {
    val activity = currentActivity
    activity?.let {
      val ad = StartAppAd(it)
      ad.loadAd()  // Optional: preload
      ad.showAd()
    }
  }

 @ReactMethod
    fun showVideoAd() {
        startAppAd.loadAd(StartAppAd.AdMode.REWARDED_VIDEO)
        startAppAd.showAd()
    }


}
