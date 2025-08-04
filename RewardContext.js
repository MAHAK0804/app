import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const RewardAdContext = createContext();

const adUnitId = __DEV__ ? TestIds.REWARDED : "your-real-ad-unit-id";
const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export const RewardAdProvider = ({ children }) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const hasShownAd = useRef(false); // prevent showing same ad twice rapidly

  useEffect(() => {
    const loadAd = () => {
      if (!rewardedAd.loaded) {
        console.log("Loading rewarded ad...");
        rewardedAd.load();
      }
    };

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("✅ Rewarded Ad Loaded");
        setIsAdLoaded(true);
      }
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("🎉 Reward Earned:", reward);
      }
    );

    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const showRewardAd = async () => {
    if (isAdLoaded && !hasShownAd.current) {
      try {
        hasShownAd.current = true;
        await rewardedAd.show();
      } catch (e) {
        console.log("❌ Failed to show reward ad:", e);
        hasShownAd.current = false;
      }
    } else {
      console.log("⚠️ Ad not ready yet, loading again...");
      rewardedAd.load();
    }
  };

  return (
    <RewardAdContext.Provider value={{ showRewardAd }}>
      {children}
    </RewardAdContext.Provider>
  );
};

export const useRewardAd = () => useContext(RewardAdContext);
