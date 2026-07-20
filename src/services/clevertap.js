/**
 * CleverTap service — mirrors the plain-HTML version exactly.
 *
 * The CleverTap snippet is only created and injected into the DOM inside
 * initCleverTap(), which is called from exactly one place: the login
 * handler, right after mock authentication succeeds. Nothing runs at
 * app boot. Every other helper checks `ctInitialized` first and no-ops
 * if called before login.
 */

// ---- CONFIGURE THESE ----
const CLEVERTAP_ACCOUNT_ID = "4W7-4R8-R65Z";
const CLEVERTAP_REGION = "eu1"; // e.g. "in", "sg1", "us1", "eu1"
// --------------------------

let ctInitialized = false;

export function isCleverTapInitialized() {
  return ctInitialized;
}

export function initCleverTap(user) {
  if (ctInitialized) return;

  if (!CLEVERTAP_ACCOUNT_ID || CLEVERTAP_ACCOUNT_ID === "YOUR_CLEVERTAP_ACCOUNT_ID") {
    console.warn("[CleverTap] Set CLEVERTAP_ACCOUNT_ID before going live.");
  }

  // Standard CleverTap Web SDK snippet — only executed here, post-login.
  window.clevertap = {
    event: [],
    profile: [],
    account: [],
    region: CLEVERTAP_REGION,
    onUserLogin: [],
    notifications: [],
    privacy: []
  };
  window.clevertap.account.push({ id: CLEVERTAP_ACCOUNT_ID });

  (function () {
    const wzrk = document.createElement("script");
    wzrk.type = "text/javascript";
    wzrk.async = true;
    wzrk.src =
      (document.location.protocol === "https:"
        ? "https://d2r1yp2w7bby2u.cloudfront.net"
        : "http://static.clevertap.com") + "/js/a.js";
    const s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(wzrk, s);
  })();

  window.clevertap.onUserLogin.push({
    Site: {
      Identity: user.email,
      Email: user.email,
      Name: user.name,
      "MSG-email": true,
      "MSG-push": true,
      "MSG-sms": false,
      "MSG-whatsapp": true
    }
  });

  ctInitialized = true;
  pushEvent("Logged in");
}

export function pushEvent(eventName, eventData) {
  if (!ctInitialized) {
    console.warn(`[CleverTap] Ignored event "${eventName}" — not initialized (not logged in).`);
    return false;
  }
  window.clevertap.event.push(eventName, eventData || {});
  return true;
}

export function pushProfile(profileData) {
  if (!ctInitialized) {
    console.warn("[CleverTap] Ignored profile update — not initialized.");
    return false;
  }
  window.clevertap.profile.push({ Site: profileData });
  return true;
}

export function pushChargedEvent(chargeDetails, items) {
  if (!ctInitialized) {
    console.warn("[CleverTap] Ignored Charged event — not initialized.");
    return false;
  }
  window.clevertap.event.push("Charged", Object.assign({}, chargeDetails, { Items: items }));
  return true;
}

export function requestPushPermission() {
  if (!ctInitialized) {
    console.warn("[CleverTap] Cannot request push permission — not initialized.");
    return false;
  }
  window.clevertap.notifications.push({
    titleText: "Would you like to receive updates?",
    bodyText: "We'll send you relevant alerts, never spam.",
    okButtonText: "Sign me up",
    rejectButtonText: "No thanks",
    okButtonColor: "#5a3ffb"
  });
  return true;
}

export function getCleverTapId(callback) {
  if (!ctInitialized || typeof window.clevertap.getCleverTapID !== "function") {
    console.warn("[CleverTap] Cannot fetch ID — not initialized yet.");
    callback(null);
    return;
  }
  window.clevertap.getCleverTapID(callback);
}

export function logoutCleverTap() {
  if (ctInitialized && window.clevertap) {
    try {
      window.clevertap.event.push("Logged out");
      if (typeof window.clevertap.logout === "function") window.clevertap.logout();
    } catch (e) {
      console.warn("[CleverTap] Error during logout cleanup", e);
    }
  }
  ctInitialized = false;
}
