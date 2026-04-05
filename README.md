# HostelMess Mobile Client

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> A highly optimized native Android wrapper engineered to encapsulate a remote web application, bridging the gap between web-based functionality and native hardware capabilities for a frictionless user journey.

---

## 📥 Download Release

**[⬇️ Download the latest HostelMess.apk here](https://expo.dev/accounts/hiper_3d/projects/HotelMess/builds/c4ebffe3-ad7a-4bc4-bbff-8e6472db886c)**

---

## 🏗 Engineering Architecture Overview

The HostelMess application is explicitly architected to encapsulate a remote SPA [Single Page Application - a web application that loads a single webpage and dynamically updates new content without requiring full page reloads]. Engineered to deliver a seamless, high-performance native mobile experience, the core architecture leverages the React Native WebView ecosystem. This foundation is heavily augmented with injected JS [JavaScript - the programming language used to execute complex logic and interactivity on web pages] to continuously observe real-time web state changes and trigger corresponding native mobile hardware responses.

## ✨ Core Technical Features

* **Custom Native Splash Architecture:** Bypasses strict Android 12+ OS [Operating System - the core system software managing device hardware and software resources] limitations by layering a hardware-level white background with a precisely timed, animated React Native overlay. This staggered fade-in strategy completely masks the initialization sequence of the JS [JavaScript - the programming language used to execute complex logic and interactivity on web pages] engine, preventing the standard web "white flash" and delivering a premium, uninterrupted UX [User Experience - the overall feeling, intuitiveness, and fluidity a user encounters when interacting with the application].
* **Asynchronous Mutation Observing:** Injects a custom payload directly into the encapsulated WebView to passively monitor the remote DOM [Document Object Model - the hierarchical internal data structure of the webpage that scripts interact with to manipulate content] for text-based state changes. This creates a highly responsive, real-time data bridge without requiring a dedicated backend API [Application Programming Interface - a set of defined rules and protocols allowing different software applications to communicate with each other].
* **Deadline-Aware Notification Engine:** Natively tracks the user's local submission state. If a user inadvertently removes their meal preference after the critical 5:00 PM [Post Meridiem - indicating the time period from noon to midnight] cutoff deadline, the application instantly executes a high-priority native local push notification, alerting them to re-submit immediately to avoid missing the service.
* **Hardware Encapsulation:** Actively strips the default web-navigation routing and safely intercepts Android hardware back-button events. This ensures the user cannot accidentally navigate backward out of the web application context, keeping the session securely contained within a single-screen mobile paradigm.

## 🛠 Technical Stack & Tooling

* **Framework:** React Native
* **Toolchain:** Expo
* **Web Integration:** `react-native-webview`
* **Local Storage:** Native Device Storage via Expo
* **Build Pipeline:** EAS [Expo Application Services - a cloud-based build and compilation platform used to generate final application binaries]

## 🧩 Complex Challenges Resolved

* **Warm-Boot vs. Cold-Boot Collisions:** Identified and mitigated a critical UI [User Interface - the visual and interactive elements of an application that the user directly controls] rendering flaw where rapid cache-loading during a "warm boot" caused the native splash screen to unmount before the interface thread could paint the web view. Solved via a strict 100 ms [milliseconds - a unit of time equal to one thousandth of a second] rendering delay applied to the asynchronous hide method, ensuring perfect synchronization.
* **Viewport Meta Tag Duplication:** Implemented safe document traversal via injected JS [JavaScript - the programming language used to execute complex logic and interactivity on web pages] to programmatically verify the existence of HTML [HyperText Markup Language - the standard markup language used to structure documents displayed in a web browser] viewport meta tags prior to injection. This prevents conflicting scale rules that could otherwise compromise the responsive mobile layout.

## 🚀 Installation & Deployment

This application is currently distributed as a standalone, release-ready APK [Android Package Kit - the compiled, final installable file format for Android applications].

1. Download the latest `HostelMess.apk` release to your Android hardware using the link at the top of this document.
2. Tap the downloaded file to initiate the OS [Operating System - the core system software managing device hardware and software resources] installation sequence.
3. If prompted by system security protocols, navigate to **Settings** and enable **"Allow from this source"**.
4. If Google Play Protect flags the direct installation, select **"More details"** followed by **"Install anyway"**.
5. Launch the application and authenticate via the encapsulated web interface.

## 💻 Build Instructions (For Developers)

To generate a fresh APK [Android Package Kit - the compiled, final installable file format for Android applications] utilizing the EAS [Expo Application Services - a cloud-based build and compilation platform used to generate final application binaries] pipeline, execute the following command via your CLI [Command Line Interface - a text-based user interface used to run programs and manage computer files]. 

The `--clear-cache` flag ensures that stale native visual layers are purged from the compilation process, guaranteeing a clean build state.

```bash
npx eas-cli build -p android --profile preview --clear-cache

---



### 👨‍💻 Architecture & Engineering
**Priyanshu Patra**
*Specializing in Cloud Infrastructure*