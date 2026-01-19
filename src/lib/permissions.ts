
export const getPermissions = (role: string): string[] => {
    if (role === 'Super Admin') {
        return ['all'];
    }
    // Add other role-based permission logic here if needed
    return ['Dashboard']; 
}
