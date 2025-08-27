LiveGame.tsx:382 ReferenceError: Cannot access 'getPlayerHandicapStrokes' before initialization
    at HoleEntry.tsx?t=1756322242772:124:31
    at Array.map (<anonymous>)
    at initializeScores (HoleEntry.tsx?t=1756322242772:120:40)
    at HoleEntry.tsx?t=1756322242772:59:5
    at Object.react_stack_bottom_frame (react-dom_client.js?v=df2eb136:17486:20)
    at runWithFiberInDEV (react-dom_client.js?v=df2eb136:1485:72)
    at commitHookEffectListMount (react-dom_client.js?v=df2eb136:8460:122)
    at commitHookPassiveMountEffects (react-dom_client.js?v=df2eb136:8518:60)
    at commitPassiveMountOnFiber (react-dom_client.js?v=df2eb136:9887:29)
    at recursivelyTraversePassiveMountEffects (react-dom_client.js?v=df2eb136:9868:13)

The above error occurred in the <HoleEntry> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.

defaultOnCaughtError @ react-dom_client.js?v=df2eb136:6264
logCaughtError @ react-dom_client.js?v=df2eb136:6296
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
inst.componentDidCatch.update.callback @ react-dom_client.js?v=df2eb136:6341
callCallback @ react-dom_client.js?v=df2eb136:4097
commitCallbacks @ react-dom_client.js?v=df2eb136:4109
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
commitClassCallbacks @ react-dom_client.js?v=df2eb136:8543
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9011
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9096
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9016
flushLayoutEffects @ react-dom_client.js?v=df2eb136:11174
commitRoot @ react-dom_client.js?v=df2eb136:11080
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=df2eb136:11558
(anonymous) @ react-dom_client.js?v=df2eb136:11649
<HoleEntry>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
LiveGame @ LiveGame.tsx:382
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
renderWithHooksAgain @ react-dom_client.js?v=df2eb136:4281
renderWithHooks @ react-dom_client.js?v=df2eb136:4217
updateFunctionComponent @ react-dom_client.js?v=df2eb136:6619
beginWork @ react-dom_client.js?v=df2eb136:7654
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=df2eb136:11558
(anonymous) @ react-dom_client.js?v=df2eb136:11649
<LiveGame>
exports.createElement @ chunk-P3W3P7Z4.js?v=df2eb136:776
(anonymous) @ chunk-RGVKOHRH.js?v=df2eb136:2467
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
beginWork @ react-dom_client.js?v=df2eb136:7904
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
flushSpawnedWork @ react-dom_client.js?v=df2eb136:11254
commitRoot @ react-dom_client.js?v=df2eb136:11081
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<Router.Consumer>
exports.createElement @ chunk-P3W3P7Z4.js?v=df2eb136:776
render @ chunk-RGVKOHRH.js?v=df2eb136:2453
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17434
updateClassComponent @ react-dom_client.js?v=df2eb136:6948
beginWork @ react-dom_client.js?v=df2eb136:7665
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
flushSpawnedWork @ react-dom_client.js?v=df2eb136:11254
commitRoot @ react-dom_client.js?v=df2eb136:11081
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<Route2>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
AppWithTabs @ App.tsx:75
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
renderWithHooksAgain @ react-dom_client.js?v=df2eb136:4281
renderWithHooks @ react-dom_client.js?v=df2eb136:4217
updateFunctionComponent @ react-dom_client.js?v=df2eb136:6619
beginWork @ react-dom_client.js?v=df2eb136:7654
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<AppWithTabs>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
App @ App.tsx:156
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
renderWithHooksAgain @ react-dom_client.js?v=df2eb136:4281
renderWithHooks @ react-dom_client.js?v=df2eb136:4217
updateFunctionComponent @ react-dom_client.js?v=df2eb136:6619
beginWork @ react-dom_client.js?v=df2eb136:7654
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
(anonymous) @ main.tsx:28
ErrorBoundary.tsx:40 Error caught by boundary: ReferenceError: Cannot access 'getPlayerHandicapStrokes' before initialization
    at HoleEntry.tsx?t=1756322242772:124:31
    at Array.map (<anonymous>)
    at initializeScores (HoleEntry.tsx?t=1756322242772:120:40)
    at HoleEntry.tsx?t=1756322242772:59:5
    at Object.react_stack_bottom_frame (react-dom_client.js?v=df2eb136:17486:20)
    at runWithFiberInDEV (react-dom_client.js?v=df2eb136:1485:72)
    at commitHookEffectListMount (react-dom_client.js?v=df2eb136:8460:122)
    at commitHookPassiveMountEffects (react-dom_client.js?v=df2eb136:8518:60)
    at commitPassiveMountOnFiber (react-dom_client.js?v=df2eb136:9887:29)
    at recursivelyTraversePassiveMountEffects (react-dom_client.js?v=df2eb136:9868:13) {componentStack: '\n    at HoleEntry (http://localhost:5173/src/featu…lhost:5173/src/components/ErrorBoundary.tsx:17:1)'}
componentDidCatch @ ErrorBoundary.tsx:40
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17462
inst.componentDidCatch.update.callback @ react-dom_client.js?v=df2eb136:6349
callCallback @ react-dom_client.js?v=df2eb136:4097
commitCallbacks @ react-dom_client.js?v=df2eb136:4109
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
commitClassCallbacks @ react-dom_client.js?v=df2eb136:8543
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9011
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9096
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9016
flushLayoutEffects @ react-dom_client.js?v=df2eb136:11174
commitRoot @ react-dom_client.js?v=df2eb136:11080
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=df2eb136:11558
(anonymous) @ react-dom_client.js?v=df2eb136:11649
<ErrorBoundary>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
(anonymous) @ main.tsx:27
LiveGame.tsx:382 ReferenceError: Cannot access 'getPlayerHandicapStrokes' before initialization
    at HoleEntry.tsx?t=1756322242772:124:31
    at Array.map (<anonymous>)
    at initializeScores (HoleEntry.tsx?t=1756322242772:120:40)
    at HoleEntry.tsx?t=1756322242772:59:5
    at Object.react_stack_bottom_frame (react-dom_client.js?v=df2eb136:17486:20)
    at runWithFiberInDEV (react-dom_client.js?v=df2eb136:1485:72)
    at commitHookEffectListMount (react-dom_client.js?v=df2eb136:8460:122)
    at commitHookPassiveMountEffects (react-dom_client.js?v=df2eb136:8518:60)
    at reconnectPassiveEffects (react-dom_client.js?v=df2eb136:10016:13)
    at doubleInvokeEffectsOnFiber (react-dom_client.js?v=df2eb136:11461:207)

The above error occurred in the <HoleEntry> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.

defaultOnCaughtError @ react-dom_client.js?v=df2eb136:6264
logCaughtError @ react-dom_client.js?v=df2eb136:6296
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
inst.componentDidCatch.update.callback @ react-dom_client.js?v=df2eb136:6341
callCallback @ react-dom_client.js?v=df2eb136:4097
commitCallbacks @ react-dom_client.js?v=df2eb136:4109
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
commitClassCallbacks @ react-dom_client.js?v=df2eb136:8543
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9011
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9096
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9016
flushLayoutEffects @ react-dom_client.js?v=df2eb136:11174
commitRoot @ react-dom_client.js?v=df2eb136:11080
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=df2eb136:11558
(anonymous) @ react-dom_client.js?v=df2eb136:11649
<HoleEntry>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
LiveGame @ LiveGame.tsx:382
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
renderWithHooksAgain @ react-dom_client.js?v=df2eb136:4281
renderWithHooks @ react-dom_client.js?v=df2eb136:4217
updateFunctionComponent @ react-dom_client.js?v=df2eb136:6619
beginWork @ react-dom_client.js?v=df2eb136:7654
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=df2eb136:11558
(anonymous) @ react-dom_client.js?v=df2eb136:11649
<LiveGame>
exports.createElement @ chunk-P3W3P7Z4.js?v=df2eb136:776
(anonymous) @ chunk-RGVKOHRH.js?v=df2eb136:2467
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
beginWork @ react-dom_client.js?v=df2eb136:7904
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
flushSpawnedWork @ react-dom_client.js?v=df2eb136:11254
commitRoot @ react-dom_client.js?v=df2eb136:11081
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<Router.Consumer>
exports.createElement @ chunk-P3W3P7Z4.js?v=df2eb136:776
render @ chunk-RGVKOHRH.js?v=df2eb136:2453
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17434
updateClassComponent @ react-dom_client.js?v=df2eb136:6948
beginWork @ react-dom_client.js?v=df2eb136:7665
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
flushSpawnedWork @ react-dom_client.js?v=df2eb136:11254
commitRoot @ react-dom_client.js?v=df2eb136:11081
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<Route2>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
AppWithTabs @ App.tsx:75
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
renderWithHooksAgain @ react-dom_client.js?v=df2eb136:4281
renderWithHooks @ react-dom_client.js?v=df2eb136:4217
updateFunctionComponent @ react-dom_client.js?v=df2eb136:6619
beginWork @ react-dom_client.js?v=df2eb136:7654
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<AppWithTabs>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
App @ App.tsx:156
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17424
renderWithHooksAgain @ react-dom_client.js?v=df2eb136:4281
renderWithHooks @ react-dom_client.js?v=df2eb136:4217
updateFunctionComponent @ react-dom_client.js?v=df2eb136:6619
beginWork @ react-dom_client.js?v=df2eb136:7654
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
performUnitOfWork @ react-dom_client.js?v=df2eb136:10868
workLoopSync @ react-dom_client.js?v=df2eb136:10728
renderRootSync @ react-dom_client.js?v=df2eb136:10711
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=df2eb136:11623
performWorkUntilDeadline @ react-dom_client.js?v=df2eb136:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
(anonymous) @ main.tsx:28
ErrorBoundary.tsx:40 Error caught by boundary: ReferenceError: Cannot access 'getPlayerHandicapStrokes' before initialization
    at HoleEntry.tsx?t=1756322242772:124:31
    at Array.map (<anonymous>)
    at initializeScores (HoleEntry.tsx?t=1756322242772:120:40)
    at HoleEntry.tsx?t=1756322242772:59:5
    at Object.react_stack_bottom_frame (react-dom_client.js?v=df2eb136:17486:20)
    at runWithFiberInDEV (react-dom_client.js?v=df2eb136:1485:72)
    at commitHookEffectListMount (react-dom_client.js?v=df2eb136:8460:122)
    at commitHookPassiveMountEffects (react-dom_client.js?v=df2eb136:8518:60)
    at reconnectPassiveEffects (react-dom_client.js?v=df2eb136:10016:13)
    at doubleInvokeEffectsOnFiber (react-dom_client.js?v=df2eb136:11461:207) {componentStack: '\n    at HoleEntry (http://localhost:5173/src/featu…lhost:5173/src/components/ErrorBoundary.tsx:17:1)'}componentStack: "\n    at HoleEntry (http://localhost:5173/src/features/normal-game/components/HoleEntry.tsx?t=1756322242772:42:3)\n    at div (<anonymous>)\n    at ion-content (<anonymous>)\n    at ReactComponent (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:25629:7)\n    at IonContent (<anonymous>)\n    at div (<anonymous>)\n    at PageManager (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26035:5)\n    at IonPageInternal (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26087:5)\n    at IonPage (<anonymous>)\n    at LiveGame (http://localhost:5173/src/features/normal-game/components/LiveGame.tsx?t=1756322242772:59:22)\n    at Route2 (http://localhost:5173/node_modules/.vite/deps/chunk-RGVKOHRH.js?v=df2eb136:2448:29)\n    at ViewLifeCycleManager (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26940:5)\n    at ion-router-outlet (<anonymous>)\n    at ReactComponent (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:25629:7)\n    at IonRouterOutlet (<anonymous>)\n    at StackManager (http://localhost:5173/node_modules/.vite/deps/@ionic_react-router.js?v=df2eb136:238:5)\n    at IonRouterOutletContainer (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26206:5)\n    at IonRouterOutlet (<anonymous>)\n    at ion-tabs (<anonymous>)\n    at ReactComponent (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:25629:7)\n    at IonTabs (<anonymous>)\n    at div (<anonymous>)\n    at PageManager (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26035:5)\n    at IonTabs (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26234:5)\n    at AppWithTabs (http://localhost:5173/src/App.tsx?t=1756322242772:64:20)\n    at NavManager (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:27107:5)\n    at IonRouterInner (http://localhost:5173/node_modules/.vite/deps/@ionic_react-router.js?v=df2eb136:492:5)\n    at C2 (http://localhost:5173/node_modules/.vite/deps/chunk-RGVKOHRH.js?v=df2eb136:2628:37)\n    at Router2 (http://localhost:5173/node_modules/.vite/deps/chunk-RGVKOHRH.js?v=df2eb136:2171:30)\n    at IonReactRouter (http://localhost:5173/node_modules/.vite/deps/@ionic_react-router.js?v=df2eb136:708:5)\n    at ion-app (<anonymous>)\n    at ReactComponent (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:25629:7)\n    at IonApp (<anonymous>)\n    at IonApp (http://localhost:5173/node_modules/.vite/deps/chunk-CULV5IEL.js?v=df2eb136:26006:5)\n    at App (http://localhost:5173/src/App.tsx?t=1756322242772:265:22)\n    at ErrorBoundary (http://localhost:5173/src/components/ErrorBoundary.tsx:17:1)"[[Prototype]]: Object
componentDidCatch @ ErrorBoundary.tsx:40
react_stack_bottom_frame @ react-dom_client.js?v=df2eb136:17462
inst.componentDidCatch.update.callback @ react-dom_client.js?v=df2eb136:6349
callCallback @ react-dom_client.js?v=df2eb136:4097
commitCallbacks @ react-dom_client.js?v=df2eb136:4109
runWithFiberInDEV @ react-dom_client.js?v=df2eb136:1485
commitClassCallbacks @ react-dom_client.js?v=df2eb136:8543
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9011
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9096
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=df2eb136:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=df2eb136:9016
flushLayoutEffects @ react-dom_client.js?v=df2eb136:11174
commitRoot @ react-dom_client.js?v=df2eb136:11080
commitRootWhenReady @ react-dom_client.js?v=df2eb136:10512
performWorkOnRoot @ react-dom_client.js?v=df2eb136:10457
performSyncWorkOnRoot @ react-dom_client.js?v=df2eb136:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=df2eb136:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=df2eb136:11558
(anonymous) @ react-dom_client.js?v=df2eb136:11649
<ErrorBoundary>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=df2eb136:250
(anonymous) @ main.tsx:27
HoleEntry.tsx?t=1756322242772:88 Using fallback distance from first available tee box
HoleEntry.tsx?t=1756322242772:88 Using fallback distance from first available tee box
client:815  GET http://localhost:5173/src/features/normal-game/components/HoleEntry.tsx?t=1756322297417 net::ERR_ABORTED 500 (Internal Server Error)
importUpdatedModule @ client:815
fetchUpdate @ client:210
queueUpdate @ client:189
(anonymous) @ client:839
handleMessage @ client:838
await in handleMessage
(anonymous) @ client:459
dequeue @ client:481
(anonymous) @ client:473
enqueue @ client:467
(anonymous) @ client:459
onMessage @ client:306
(anonymous) @ client:414
client:809 [vite] Failed to reload /src/features/normal-game/components/HoleEntry.tsx. This could be due to syntax errors or importing non-existent modules. (see errors above)
error @ client:809
warnFailedUpdate @ client:181
fetchUpdate @ client:212
await in fetchUpdate
queueUpdate @ client:189
(anonymous) @ client:839
handleMessage @ client:838
await in handleMessage
(anonymous) @ client:459
dequeue @ client:481
(anonymous) @ client:473
enqueue @ client:467
(anonymous) @ client:459
onMessage @ client:306
(anonymous) @ client:414
