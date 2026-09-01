import { lazy, Suspense, type ComponentType } from "react";
import { Box, CircularProgress } from "@mui/material";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import RootLayout from "./RootLayout";
import Private from "./Private";
import { PATH } from "./PATH";

function lazyRoute(loader: () => Promise<{ default: ComponentType<any> }>) {
  const Component = lazy(loader);
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <Box className="w-full flex items-center justify-center" sx={{ minHeight: "60vh" }}>
      <CircularProgress size={32} />
    </Box>
  );
}

const App = lazy(() => import("../App"));

const AuthRoot = lazy(() => import("../components/pages/auth"));
const AuthLayout = lazy(() => import("../components/pages/layout/AuthLayout"));
const SingleFormAuthLayout = lazy(() => import("../components/pages/layout/SingleFormAuthLayout"));
const NotFound = lazy(() => import("../components/pages/layout/NotFound"));

const CourseRoot = lazy(() => import("../components/pages/CourseManagement/course"));
const TestManagementRoot = lazy(() => import("../components/pages/TestManagement"));
const ExploreTestRoot = lazy(() => import("../components/pages/TestManagement/exploreTest"));
const PurchaseRoot = lazy(() => import("../components/pages/Purchase"));
const LiveClassRoot = lazy(() => import("../components/pages/CourseManagement/liveClasses"));
const NotesRoot = lazy(() => import("../components/pages/MediaManagement/notes"));
const VideosRoot = lazy(() => import("../components/pages/MediaManagement/videos"));
const EbookRoot = lazy(() => import("../components/pages/EbookManagement"));
const GorkhapatraRoot = lazy(() => import("../components/pages/Gorkhapatra"));
const NoticeRoot = lazy(() => import("../components/pages/NoticeBoard/index."));
const AudiosRoot = lazy(() => import("../components/pages/MediaManagement/audios"));
const SettingRoot = lazy(() => import("../components/pages/Settings"));
const DiscussionManagementRoot = lazy(() => import("../components/pages/DiscussionManagement"));
const TicketManagementRoot = lazy(() => import("../components/pages/TicketManagement"));

const wrap = (Element: ComponentType) => (
  <Suspense fallback={<RouteFallback />}>
    <Element />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: PATH.AUTH.CHOOSE_PLATFORM.ROOT,
    element: lazyRoute(() => import("../components/pages/auth/choosePlatform")),
  },
  {
    path: PATH.AUTH.CHOOSE_PREFERED_LANG.ROOT,
    element: lazyRoute(() => import("../components/pages/auth/selectPreferedLang")),
  },
  {
    path: PATH.AUTH.INTRO.ROOT,
    element: lazyRoute(() => import("../components/pages/auth/introScreens")),
  },
  {
    element: wrap(AuthRoot),
    children: [
      {
        path: PATH.AUTH.VERIFY_OTP.ROOT,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SingleFormAuthLayout>{lazyRoute(() => import("../components/pages/auth/verifyOtp"))}</SingleFormAuthLayout>
          </Suspense>
        ),
      },
      {
        path: PATH.AUTH.INTEREST.ROOT,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SingleFormAuthLayout>{lazyRoute(() => import("../components/pages/auth/interest"))}</SingleFormAuthLayout>
          </Suspense>
        ),
      },
      {
        path: PATH.AUTH.DEVICE_RESET.ROOT,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SingleFormAuthLayout>{lazyRoute(() => import("../components/pages/auth/deviceReset"))}</SingleFormAuthLayout>
          </Suspense>
        ),
      },
      {
        path: PATH.AUTH.DEVICE_RESET.SUCCESS.ROOT,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SingleFormAuthLayout>{lazyRoute(() => import("../components/pages/auth/deviceReset/success"))}</SingleFormAuthLayout>
          </Suspense>
        ),
      },
      {
        path: PATH.AUTH.FORGOT_PASSWORD.VERIFY.ROOT,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SingleFormAuthLayout>{lazyRoute(() => import("../components/pages/auth/forgotPassword/verify"))}</SingleFormAuthLayout>
          </Suspense>
        ),
      },
      {
        path: PATH.AUTH.FORGOT_PASSWORD.RESET.ROOT,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SingleFormAuthLayout>{lazyRoute(() => import("../components/pages/auth/forgotPassword/reset"))}</SingleFormAuthLayout>
          </Suspense>
        ),
      },
      {
        element: wrap(AuthLayout),
        children: [
          { path: PATH.AUTH.LOGIN.ROOT, element: lazyRoute(() => import("../components/pages/auth/login")) },
          { path: PATH.AUTH.REGISTER.ROOT, element: lazyRoute(() => import("../components/pages/auth/register")) },
          { path: PATH.AUTH.BRIDGE.ROOT, element: lazyRoute(() => import("../components/pages/auth/bridge")) },
          { path: PATH.AUTH.FORGOT_PASSWORD.ROOT, element: lazyRoute(() => import("../components/pages/auth/forgotPassword")) },
        ],
      },
    ],
  },
  {
    element: <Private />,
    children: [
      {
        path: PATH.AUTH.SET_PASSWORD.ROOT,
        element: lazyRoute(() => import("../components/pages/auth/setPassword")),
      },
      {
        element: <RootLayout />,
        children: [
          { index: true, path: "/", element: wrap(App) },
          { path: PATH.DASHBOARD.ROOT, element: wrap(App) },
          {
            element: wrap(CourseRoot),
            children: [
              { path: PATH.COURSE_MANAGEMENT.COURSES.ROOT, element: lazyRoute(() => import("../components/pages/CourseManagement/course/allCourse")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(), element: lazyRoute(() => import("../components/pages/CourseManagement/course/singleCourse")) },
              { path: PATH.MY_COURSE.VIEW_COURSE.ROOT(), element: lazyRoute(() => import("../components/pages/CourseManagement/course/singleCourse")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.VIEW_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/singleTest")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.VIEW_TEST.SUBJECTIVE_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/singleSubjectiveTest")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.VIEW_TEST.REVIEW_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/reviewTest")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.VIEW_TEST.REVIEW_TEST.REVIEW_SUBJECTIVE_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/reviewTest/subjective")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.SAVED_COURSES.ROOT, element: lazyRoute(() => import("../components/pages/CourseManagement/course/savedCourse")) },
            ],
          },
          { path: PATH.FREE_MATERIALS.ROOT, element: lazyRoute(() => import("../components/pages/FreeMaterials")) },
          { path: "/free-materials/:id", element: <Navigate to={PATH.FREE_MATERIALS.ROOT} replace /> },
          {
            element: wrap(TestManagementRoot),
            children: [
              { path: PATH.TEST.MY_TEST.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/allTest")) },
              { path: PATH.TEST.MY_INDIVIDUAl_TEST.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/myTests/MyIndividualTest")) },
              { path: PATH.TEST.MY_BUNDLES.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/myTests/MyBundles")) },
              { path: PATH.TEST.VIEW_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/singleTest")) },
              { path: PATH.TEST.VIEW_TEST.SUBJECTIVE_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/singleSubjectiveTest")) },
              { path: PATH.TEST.VIEW_TEST.REVIEW_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/reviewTest")) },
              { path: PATH.TEST.VIEW_TEST.REVIEW_TEST.REVIEW_SUBJECTIVE_TEST.ROOT({}), element: lazyRoute(() => import("../components/pages/TestManagement/reviewTest/subjective")) },
            ],
          },
          {
            element: wrap(ExploreTestRoot),
            children: [
              { path: PATH.TEST.EXPLORE_TEST.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/exploreTest/ExploreAllTest")) },
              { path: PATH.TEST.EXPLORE_TEST.INDIVIDUAl_TEST.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/exploreTest/ExploreIndividualTest")) },
              { path: PATH.TEST.EXPLORE_TEST.BUNDLE_TEST.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/exploreTest/bundles/ExploreBundle")) },
              { path: PATH.TEST.EXPLORE_TEST.OMR.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/exploreTest/ExploreOmr")) },
            ],
          },
          { path: PATH.TEST.EXPLORE_TEST.BUNDLE_TEST.VIEW_BUNDLE.ROOT(), element: lazyRoute(() => import("../components/pages/TestManagement/exploreTest/bundles/singleBundle")) },
          {
            element: wrap(PurchaseRoot),
            children: [
              { path: PATH.COURSE_MANAGEMENT.COURSES.PURCHASE.ROOT(), element: lazyRoute(() => import("../components/pages/Purchase/PurchaseLayout")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.PURCHASE.SUCCESS.ROOT(), element: lazyRoute(() => import("../components/pages/Purchase/success")) },
              { path: PATH.COURSE_MANAGEMENT.COURSES.PURCHASE.FAILURE.ROOT(), element: lazyRoute(() => import("../components/pages/Purchase/failure")) },
              { path: PATH.SUBSCRIPTION.PURCHASE.ROOT(), element: lazyRoute(() => import("../components/pages/Purchase/PurchaseLayout")) },
              { path: PATH.SUBSCRIPTION.PURCHASE.SUCCESS.ROOT(), element: lazyRoute(() => import("../components/pages/Purchase/success")) },
              { path: PATH.SUBSCRIPTION.PURCHASE.FAILURE.ROOT(), element: lazyRoute(() => import("../components/pages/Purchase/failure")) },
            ],
          },
          {
            path: PATH.MY_COURSE.ROOT,
            element: lazyRoute(() => import("../components/pages/CourseManagement/myCourse")),
          },
          {
            element: wrap(LiveClassRoot),
            children: [
              { path: PATH.LIVE_CLASSES.ROOT, element: lazyRoute(() => import("../components/pages/CourseManagement/liveClasses/allLiveClass")) },
            ],
          },
          {
            element: wrap(NotesRoot),
            children: [
              { path: PATH.NOTES.ROOT, element: lazyRoute(() => import("../components/pages/MediaManagement/notes/allNotes")) },
            ],
          },
          {
            element: wrap(TestManagementRoot),
            children: [
              { path: PATH.TEST.ROOT, element: lazyRoute(() => import("../components/pages/TestManagement/allTest")) },
            ],
          },
          {
            element: wrap(VideosRoot),
            children: [
              { path: PATH.VIDEOS.ROOT, element: lazyRoute(() => import("../components/pages/MediaManagement/videos/allPlaylist")) },
              { path: PATH.VIDEOS.VIEW_PLAYLIST.ROOT(), element: lazyRoute(() => import("../components/pages/MediaManagement/videos/allPlaylist/singlePlaylist")) },
            ],
          },
          {
            element: wrap(EbookRoot),
            children: [
              { path: PATH.EBOOK.ROOT, element: <Navigate to={PATH.EBOOK.EXPLORE_EBOOK.ROOT} replace /> },
              { path: PATH.EBOOK.EXPLORE_EBOOK.ROOT, element: lazyRoute(() => import("../components/pages/EbookManagement/exploreEbook")) },
              { path: PATH.EBOOK.EXPLORE_EBOOK.VIEW_EBOOK.ROOT(), element: lazyRoute(() => import("../components/pages/EbookManagement/exploreEbook/singleEbook")) },
              { path: PATH.EBOOK.MY_EBOOK.ROOT, element: lazyRoute(() => import("../components/pages/EbookManagement/myEbook")) },
              { path: PATH.EBOOK.MY_EBOOK.VIEW_EBOOK.ROOT(), element: lazyRoute(() => import("../components/pages/EbookManagement/myEbook/singleEbook")) },
            ],
          },
          {
            element: wrap(GorkhapatraRoot),
            children: [
              { path: PATH.GORKHAPATRA.ROOT, element: lazyRoute(() => import("../components/pages/Gorkhapatra/AllGorkhapatra")) },
              { path: PATH.GORKHAPATRA.VIEW_GORKHAPATRA.ROOT(), element: lazyRoute(() => import("../components/pages/Gorkhapatra/SingleGorkhapatra")) },
            ],
          },
          {
            element: wrap(NoticeRoot),
            children: [
              { path: PATH.NOTICE.ROOT, element: lazyRoute(() => import("../components/pages/NoticeBoard/allNotices")) },
              { path: PATH.NOTICE.VIEW_NOTICE.ROOT(), element: lazyRoute(() => import("../components/pages/NoticeBoard/singleNotice")) },
            ],
          },
          {
            element: wrap(AudiosRoot),
            children: [
              { path: PATH.AUDIOS.ROOT, element: lazyRoute(() => import("../components/pages/MediaManagement/audios/allAudios")) },
            ],
          },
          {
            element: wrap(SettingRoot),
            children: [
              { path: PATH.SETTINGS.PROFILE.ROOT, element: lazyRoute(() => import("../components/pages/Settings/ProfilePage")) },
              { path: PATH.SETTINGS.LINKED_DEVICES.ROOT, element: lazyRoute(() => import("../components/pages/Settings/LinkedDevices")) },
            ],
          },
          {
            path: PATH.SUPPORT.ROOT,
            element: lazyRoute(() => import("../components/pages/Support")),
          },
          {
            element: wrap(DiscussionManagementRoot),
            children: [
              { path: PATH.DISCUSSION.ROOT, element: lazyRoute(() => import("../components/pages/DiscussionManagement/allDiscussions")) },
              { path: PATH.DISCUSSION.CREATE.ROOT, element: lazyRoute(() => import("../components/pages/DiscussionManagement/DiscussionForm")) },
              { path: PATH.DISCUSSION.DETAIL.ROOT(), element: lazyRoute(() => import("../components/pages/DiscussionManagement/DiscussionDetail")) },
              { path: PATH.DISCUSSION.EDIT.ROOT(), element: lazyRoute(() => import("../components/pages/DiscussionManagement/DiscussionForm")) },
            ],
          },
          {
            element: wrap(TicketManagementRoot),
            children: [
              { path: PATH.TICKET.ALL_TICKETS.ROOT, element: lazyRoute(() => import("../components/pages/TicketManagement/allTickets")) },
              { path: PATH.TICKET.CHATS.ROOT, element: lazyRoute(() => import("../components/pages/TicketManagement/chats")) },
              { path: PATH.TICKET.CHATS.DETAIL.ROOT(), element: lazyRoute(() => import("../components/pages/TicketManagement/chats")) },
            ],
          },
          {
            path: PATH.ONGOING_LIVE_CLASSES.ROOT,
            element: lazyRoute(() => import("../components/pages/OngoingLiveClasses")),
          },
        ],
      },
      {
        element: wrap(CourseRoot),
        children: [
          { path: PATH.COURSE_MANAGEMENT.COURSES.JOIN_LIVE.ROOT(), element: lazyRoute(() => import("../components/pages/CourseManagement/course/singleLiveClass")) },
        ],
      },
    ],
  },
  {
    path: PATH.PRIVACY_POLICY.ROOT,
    element: lazyRoute(() => import("../components/pages/PrivacyPolicy")),
  },
  {
    path: "*",
    element: wrap(NotFound),
  },
]);

export default function GlobalRoutes() {
  return <RouterProvider router={router} />;
}
