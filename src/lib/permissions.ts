
// A simple map to get the required permission for a given path
const routePermissionMap: Record<string, string | undefined> = {
    '/dashboard': 'view-dashboard',
    '/corporates': 'manage-corporates',
    '/corporates/transactions': 'manage-corporates',
    '/customers/create': 'create-customer',
    '/customers': 'view-customers',
    '/customers/block': 'block-customer',
    '/customers/unblock': 'unblock-customer',
    '/mini-apps': 'manage-mini-apps',
    '/mini-apps/create': 'manage-mini-apps',
    '/customers/approve-new': 'approve-new-customer',
    '/customers/approve-updated': 'approve-updated-customer',
    '/customers/approve-accounts': 'approve-customer-account',
    '/customers/approve-unblocked': 'approve-unblock',
    '/customers/approve-pin-reset': 'approve-pin-reset',
    '/customers/approve-security': 'approve-security-reset',
    '/reports/system/registered': 'view-reports',
    '/reports/system/active': 'view-reports',
    '/reports/system/inactive': 'view-reports',
    '/reports/system/incomplete': 'view-reports',
    '/reports/system/failed': 'view-reports',
    '/reports/system/dormant': 'view-reports',
    '/customers/audit': 'view-audit-trails',
    '/users/audit': 'view-audit-trails',
    '/users': 'manage-users',
    '/users/create': 'manage-users',
    '/otp': 'view-otp',
    '/limits': 'manage-limits',
    '/charges': 'manage-limits',
    '/limits/types': 'manage-limits',
    '/limits/categories': 'manage-limits',
    '/limits/intervals': 'manage-limits',
    '/roles': 'manage-roles',
    '/branches': 'manage-branches',
    '/departments': 'manage-departments',
    '/settings': 'manage-settings',
};


export function getPermissionForPath(path: string): string | undefined {
    // Exact match
    if (routePermissionMap[path]) {
        return routePermissionMap[path];
    }
    // Dynamic match for customer details page
    if (path.startsWith('/customers/')) {
        return 'view-customers';
    }
    return undefined;
}
