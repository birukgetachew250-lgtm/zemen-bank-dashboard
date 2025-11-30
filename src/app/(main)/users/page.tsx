
import { db } from "@/lib/db";
import { Branch } from "../branches/page";
import { Department } from "../departments/page";
import { UserManagementClient } from "@/components/users/UserManagementClient";
import type { Role } from "@/app/(main)/roles/page";

export interface SystemUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  branch: string;
  department: string;
}

function getSystemUsers() {
  try {
    return db.prepare("SELECT id, employeeId, name, email, role, avatar_url, branch, department FROM users ORDER BY name ASC").all() as SystemUser[];
  } catch (e) {
    console.error("Failed to fetch users:", e);
    return [];
  }
}

function getBranches() {
  try {
    return db.prepare("SELECT * FROM branches ORDER BY name ASC").all() as Branch[];
  } catch (e) {
    console.error("Failed to fetch branches:", e);
    return [];
  }
}

function getDepartments() {
  try {
    return db.prepare("SELECT * FROM departments ORDER BY name ASC").all() as Department[];
  } catch (e) {
    console.error("Failed to fetch departments:", e);
    return [];
  }
}

function getRoles() {
  try {
    return db.prepare("SELECT * FROM roles ORDER BY name ASC").all() as Role[];
  } catch (e) {
    console.error("Failed to fetch roles:", e);
    return [];
  }
}

export default function UsersPage() {
  const users = getSystemUsers();
  const branches = getBranches();
  const departments = getDepartments();
  const roles = getRoles();

  return <UserManagementClient initialUsers={users} branches={branches} departments={departments} roles={roles} />;
}

    