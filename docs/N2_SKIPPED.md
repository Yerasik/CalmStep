# N2 skipped (Stage 11)

**Locked:** `enable_n2 = false`. CalmStep does not listen to the microphone.

## Why

1. Stage 11 is optional. The runbook says to skip it if time is tight. F1–F8 (roles, interview, profile, validated plan, Day Strip, Break, pictograms, offline cache) already ship. N2 is not on that list.
2. Ch 12: Simulator has no useful loudness meter. The demo phone story is already camera (QR) plus PIN fallback. A second permission popup (“CalmStep would like to access the microphone”) is a demo-day risk, the same class of failure we avoided by keeping PIN for linking.
3. Reduce motion is **on by default**. The Stage 11 prompt would skip metering when reduce motion is on (`skip_if_reduce_motion = true`) because live loudness can be stimulating. With that default, N2 would not run in the normal demo anyway.
4. Ch 1: no surprise audio or extra stimulation. Break (F6) is a deliberate tap. Offering Break from ambient noise would still need a confirm dialog, but the metering itself is always-on while Supported Day is focused, which uses power (Ch 12) and is easy to misunderstand as recording. We would never write wav/pcm, but we also do not want to explain a live mic on a 5-minute demo.
5. Location stays out of scope. We are not adding a second live sensor.

## What we still have for Ch 12

Camera QR linking (Stage 9) is the phone-feature / mobility story. Microphone usage string in `app.json` is a leftover placeholder and is not requested at runtime.

## If N2 is built later

Use `expo-av` metering (or equivalent), register on Supported Day focus and unregister on blur, debounce 10 seconds, never save audio, offer Break with a confirm (do not auto-navigate), skip when reduce motion is on. Threshold from a single constant unless the profile grows a noise field. Disable the path on Simulator with a calm message.
