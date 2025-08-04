import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRewardAd } from "./RewardContext";

const AdController = () => {
    const appState = useRef(AppState.currentState);
    const { showRewardAd } = useRewardAd();

    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                console.log("🌟 App resumed — Showing Reward Ad");
                showRewardAd();
            }
            appState.current = nextAppState;
        });

        return () => sub.remove();
    }, [showRewardAd]);

    return null; // No UI
};

export default AdController;
