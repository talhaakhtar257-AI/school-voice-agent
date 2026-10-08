# Quickstart: check the privacy policy by clicking (012)

Run `npm run dev` and open http://localhost:3000. On Vercel, use the preview link for branch `012-privacy-policy`.

## 1. The page itself (User Story 1)
1. Scroll to the bottom of the home page and tap **Privacy policy** in the footer. The policy opens at `/privacy`.
2. Check that the office phone `021-000-000-000` is visible at the top without scrolling. Tapping it starts a phone call on a mobile.
3. Check that the yellow **Draft — awaiting the school's approval** notice and the **Last updated** date are shown.
4. Read the headings. There are 11 sections, starting "Who we are" and ending "Changes to this policy".
5. Tap **اردو** in the header. The whole policy switches to Urdu, right to left, in the Nastaliq typeface. No letters are cut off at the top or bottom.
6. Tap **English** to switch back.
7. Phone width: in Chrome, press F12, then Ctrl+Shift+M, and choose a 360 px wide device. There is no sideways scrolling, in English or in Urdu.
8. Tap **Back to admissions**. You are on the home page again.

## 2. The call flow (User Story 2)
1. On the home page, read the notices under the green agent card. They agree with each other, and there is a **Privacy policy** link.
2. Tap **Start voice call**. Type a name and the test mobile `03000000000` (the zeros number). **Do not continue the call.**
3. Next to the consent tick, tap **Privacy policy**. The policy opens in a **new tab**.
4. Close that tab. Back in the call window, your typed name and number are still there.
5. Read the microphone explanation. It no longer says "Nothing is used for anything else", and it agrees with the recording notice.
6. Close the call window without starting a call.

## 3. Error state
To see that the policy still loads when the school content can't, stop the internet connection to the database. This is a developer step that can be skipped. The policy text and phone still show, and the footer shows "not available" for hours.

## 4. Owner checks outside the code
- **Retell dashboard**: on the agent, confirm that **"Opt out of data storage"** is **off**. The policy says Retell keeps the recording; if it is on, tell Claude and the sentence will be changed.
- **The school**: reads the English and Urdu text and confirms the retention sentence ("kept for the current admission session"). When it is approved, set `PRIVACY_POLICY_APPROVED` to `true` in `lib/strings/privacy.ts` to remove the draft notice.

## 5. ID-number hiding (Urdu digits)
A developer check that can be skipped. In a test call, say a made-up 13-digit number in the CNIC shape. In the dashboard lead page, the transcript shows it as `*****-*******-*`, whether it was written in English or Urdu digits.
