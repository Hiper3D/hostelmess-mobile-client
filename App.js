import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Animated,
  Text,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { AntDesign } from '@expo/vector-icons';

const WEB_URL = 'https://hostelmess.lovable.app/';
const MIN_SPLASH_MS = 1000;
const FAILSAFE_MS = 2200;
const DEADLINE_HOUR = 17;
const CHANNEL_ID = 'urgent-reminders';

const REMINDERS = [
  {
    title: 'HostelMess Reminder',
    body: "Check tomorrow's meal preference",
    hour: 10,
    minute: 0,
  },
  {
    title: 'HostelMess Reminder',
    body: 'Submit your meal preference for tomorrow',
    hour: 14,
    minute: 0,
  },
  {
    title: 'HostelMess Reminder',
    body: "Don't forget to submit your meal preference",
    hour: 17,
    minute: 0,
  },
];

void SplashScreen.preventAutoHideAsync().catch(() => {});
void SystemUI.setBackgroundColorAsync('#ffffff').catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function isOurReminderTitle(title = '') {
  return REMINDERS.some((item) => item.title === title);
}

async function clearOurReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ours = scheduled.filter((item) => isOurReminderTitle(item.content?.title));

  await Promise.all(
    ours.map((item) =>
      Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {})
    )
  );
}

async function scheduleReminders() {
  await clearOurReminders();

  for (const r of REMINDERS) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: r.title,
        body: r.body,
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        hour: r.hour,
        minute: r.minute,
        repeats: true,
      },
    });
  }
}

export default function App() {
  const [error, setError] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  const webviewRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const mountedRef = useRef(false);

  const loadStartRef = useRef(0);
  const revealTimerRef = useRef(null);
  const failsafeRef = useRef(null);
  const revealScheduledRef = useRef(false);
  const revealedRef = useRef(false);

  const webScale = useRef(new Animated.Value(0.985)).current;
  const webTranslateY = useRef(new Animated.Value(8)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  const splashTranslateY = useRef(new Animated.Value(0)).current;
  
  // Controls the smooth fade-in for the bottom text
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mountedRef.current = true;

    // 🔥 THE FINAL FIX: Give the UI 100ms to physically paint the white background
    // before dropping the native splash screen curtain.
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 100);

    // Smoothly fade in the bottom text over 800ms
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800, 
      useNativeDriver: true,
    }).start();

    async function setupNotifications() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: 'HostelMess Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500, 200, 500],
            lightColor: '#FF0000',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
        }

        await scheduleReminders();
      } catch (err) {
        console.log('Notification setup failed:', err);
      }
    }

    setupNotifications();

    return () => {
      mountedRef.current = false;
      clearTimeout(revealTimerRef.current);
      clearTimeout(failsafeRef.current);
    };
  }, []);

  const revealApp = async () => {
    if (!mountedRef.current || revealedRef.current) return;
    revealedRef.current = true;

    clearTimeout(revealTimerRef.current);
    clearTimeout(failsafeRef.current);

    Animated.parallel([
      Animated.spring(webScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.timing(webTranslateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(splashScale, {
        toValue: 0.965,
        useNativeDriver: true,
        tension: 42,
        friction: 7,
      }),
      Animated.timing(splashTranslateY, {
        toValue: -18,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && mountedRef.current) {
        setSplashGone(true);
      }
    });
  };

  const scheduleRevealIfNeeded = () => {
    if (revealScheduledRef.current) return;
    revealScheduledRef.current = true;

    const elapsed = Date.now() - loadStartRef.current;
    const remaining = Math.max(MIN_SPLASH_MS - elapsed, 0);

    clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(() => {
      void revealApp();
    }, remaining);
  };

  const handleLoadStart = () => {
    setError(false);
    loadStartRef.current = Date.now();
    revealedRef.current = false;
    revealScheduledRef.current = false;

    clearTimeout(revealTimerRef.current);
    clearTimeout(failsafeRef.current);

    failsafeRef.current = setTimeout(() => {
      void revealApp();
    }, FAILSAFE_MS);
  };

  const handleLoadEnd = () => {
    scheduleRevealIfNeeded();
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    if (nativeEvent?.progress === 1) {
      scheduleRevealIfNeeded();
    }
  };

  const handleError = async () => {
    setError(true);
    await revealApp();
  };

  const handleMessage = async (event) => {
    const msg = event?.nativeEvent?.data;
    const hour = new Date().getHours();

    try {
      if (msg === 'SUCCESS_SUBMITTED') {
        hasSubmittedRef.current = true;
        await clearOurReminders();
        return;
      }

      if (msg === 'SUBMISSION_REMOVED') {
        if (!hasSubmittedRef.current) return;

        hasSubmittedRef.current = false;

        if (hour >= DEADLINE_HOUR) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'HostelMess Alert',
              body: 'You removed your preference. Please submit again.',
              sound: true,
              ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
            },
            trigger: null,
          });
          return;
        }

        await scheduleReminders();
      }
    } catch (err) {
      console.log('Notification bridge error:', err);
    }
  };

  const injectedJS = `
    (function() {
      try {
        let meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = "viewport";
          document.head.appendChild(meta);
        }
        meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

        const post = (msg) => {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(msg);
          }
        };

        let submitted = false;

        const check = () => {
          const body = document.body;
          if (!body) return;

          const text = body.innerText.toLowerCase();

          const submittedState =
            text.includes('preference recorded') ||
            text.includes('change preference');

          const submitState = text.includes('submit preference');

          if (submittedState && !submitted) {
            submitted = true;
            post('SUCCESS_SUBMITTED');
          }

          if (submitState && submitted) {
            submitted = false;
            post('SUBMISSION_REMOVED');
          }
        };

        const target = document.documentElement || document.body;
        if (target) {
          new MutationObserver(check).observe(target, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }

        check();
      } catch (e) {}
    })();
    true;
  `;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

        <View style={styles.root}>
          <Animated.View
            style={[
              styles.webLayer,
              {
                transform: [
                  { scale: webScale },
                  { translateY: webTranslateY },
                ],
              },
            ]}
          >
            <WebView
              ref={webviewRef}
              source={{ uri: WEB_URL }}
              onLoadStart={handleLoadStart}
              onLoadProgress={handleLoadProgress}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              injectedJavaScript={injectedJS}
              onMessage={handleMessage}
              style={styles.webview}
              bounces={false}
              textZoom={100}
              scalesPageToFit={false}
              setBuiltInZoomControls={false}
              setDisplayZoomControls={false}
              javaScriptEnabled
              domStorageEnabled
              pullToRefreshEnabled
            />
          </Animated.View>

          {!splashGone && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.splash,
                {
                  transform: [
                    { scale: splashScale },
                    { translateY: splashTranslateY },
                  ],
                },
              ]}
            >
              <View style={styles.center}>
                <Image
                  source={require('./assets/splash-icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Animated.View style={[styles.bottom, { opacity: textOpacity }]}>
                <Text style={styles.bottomText}>Built with ❤️ </Text>
                <AntDesign name="github" size={16} color="#666" />
                <Text style={styles.bottomText}> Hiper3D</Text>
              </Animated.View>
            </Animated.View>
          )}

          {error && (
            <View style={styles.error}>
              <Text style={styles.errorText}>Connection Issue ⚠️</Text>
              <TouchableOpacity onPress={() => webviewRef.current?.reload()}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webLayer: {
    flex: 1,
    backgroundColor: '#ffffff',
    zIndex: 1,
    elevation: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 999,
    elevation: 999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
  bottom: {
    position: 'absolute',
    bottom: 40, 
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1000,
    elevation: 1000,
  },
  errorText: {
    marginBottom: 12,
    color: '#333',
  },
  retryText: {
    color: '#008080',
    fontWeight: '600',
  },
});