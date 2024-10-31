import UserHome from './components/UserHome.js'
import AdminHome from './components/AdminHome.js';
import UserLogin from './components/UserLogin.js';
import SignUp from './components/Signup.js';
import AllUsers from './components/AllUsers.js';
import AddUser from './components/AddUser.js';
import EditUser from './components/EditUser.js';
import AddSection from './components/AddSection.js';
import EditSection from './components/EditSection.js';
import AddBook from './components/AddBook.js';
import ViewSection from './components/ViewSection.js';
import EditBook from './components/EditBook.js';
import UserViewSection from './components/UserViewSection.js';
import AllRequests from './components/AllRequests.js';
import WriteFeedback from './components/WriteFeedback.js';
import SeeInfo from './components/SeeInfo.js';
import UserProfile from './components/UserProfile.js';
import AdminProfile from './components/AdminProfile.js';
import AddRequest from './components/AddRequest.js';
import EditRequest from './components/EditRequest.js';
import AdminSeeInfo from './components/AdminSeeInfo.js';
import SearchResults from './components/SearchResults.js';
import EditUserProfile from './components/EditUserProfile.js';
import EditAdminProfile from './components/EditAdminProfile.js';
import AdminStats from './components/AdminStats.js';
import UserStats from './components/UserStats.js';
import MyLibrary from './components/MyLibrary.js';


const routes = [
    {
        path: '/user',
        name: 'UserHome',
        component: UserHome
    },
    {
        path: '/admin',
        name: 'AdminHome',
        component: AdminHome
    },
    {
        path: '/user/profile',
        name: 'UserProfile',
        component: UserProfile
    },
    {
        path: '/admin/profile',
        name: 'AdminProfile',
        component: AdminProfile
    },
    {
        path: '/user/:user_id/edit_profile',
        name: 'EditUserProfile',
        component: EditUserProfile
    },

    {
        path: '/user/my_library',
        name: 'MyLibrary',
        component: MyLibrary,
        children: [
            {
              path: 'current_books',
              name: 'CurrentBooks',
            },
            {
              path: 'completed_books',
              name: 'CompletedBooks',
            },
            {
              path: 'overdue_books',
              name: 'OverdueBooks',
            }
          ]
    },

    {
        path: '/admin/:user_id/edit_profile',
        name: 'EditAdminProfile',
        component: EditAdminProfile
    },
    {
        path: '/admin/stats',
        name: 'AdminStats',
        component: AdminStats
    },
    {
        path: '/user/stats',
        name: 'UserStats',
        component: UserStats
    },
    {
        path: '/admin/add_section',
        name: 'AddSection',
        component: AddSection
    },
    {
        path: '/admin/:book_id/see_info',
        name: 'AdminSeeInfo',
        component: AdminSeeInfo
    },
    {
        path: '/user/search_results',
        name: 'SearchResults',
        component: SearchResults
    },
    {
        path: '/user/add_request',
        name: 'AddRequest',
        component: AddRequest
    },
    {
        path: '/user_login',
        name: 'UserLogin',
        component: UserLogin
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp
    },
    {
        path: '/admin/all_users',
        name: 'AllUsers',
        component: AllUsers
    },
    {
        path: '/admin/add_user',
        name: 'AddUser',
        component: AddUser
    },
    {
        path: '/admin/:request_id/edit_request',
        name: 'EditRequest',
        component: EditRequest
    },
    {
        path: '/admin/edit_user/:user',
        name: 'EditUser',
        component: EditUser
    },
    {
        path: '/admin/edit_section/:section',
        name: 'EditSection',
        component: EditSection
    },
    {
        path: '/admin/:section_id/add_book',
        name: 'AddBook',
        component: AddBook
    },
    {
        path: '/admin/:section_id/view_section',
        name: 'ViewSection',
        component: ViewSection
    },
    {
        path: '/admin/:section_id/edit_book/:book',
        name: 'EditBook',
        component: EditBook
    },
    {
        path: '/user/:section_id/view_section',
        name: 'UserViewSection',
        component: UserViewSection
    },
    {
        path: '/admin/all_requests',
        name: 'AllRequests',
        component: AllRequests
    },

    {
        path: '/user/my_library/:book/write_feedback',
        name: 'WriteFeedback',
        component: WriteFeedback
    },
    {
        path: '/user/:book_id/see_info',
        name: 'SeeInfo',
        component: SeeInfo
    }
];


const router = new VueRouter({
    routes
});

export default router;

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth_token') !== null;

    // If the route requires authentication and the user is not authenticated
    if (to.path !== '/user_login' && to.path !== '/signup' && !isAuthenticated) {
        // Redirect to login page
        next('/user_login');
    } else {
        // Allow the route
        next();
    }
});