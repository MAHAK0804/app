package com.mahakasde.HindiShayari


import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.startapp.sdk.ads.banner.Banner

class StartAppBannerViewManager : SimpleViewManager<Banner>() {
    override fun getName() = "StartAppBanner"
    override fun createViewInstance(reactContext: ThemedReactContext): Banner {
        return Banner(reactContext)
    }
}
