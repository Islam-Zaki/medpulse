
import React, { useState, useEffect } from 'react';
import type { User, Role, Permission } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import InputGroup from './InputGroup';

interface UsersTabProps {
    usersList: User[];
}

// Helper to extract array from response
const getArray = (response: any): any[] => {
    if (!response) return [];
    
    // Handle nested array response [[...]] specific to some endpoints
    if (Array.isArray(response)) {
        if (response.length > 0 && Array.isArray(response[0])) {
            return response[0];
        }
        return response;
    }

    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.users && Array.isArray(response.users)) return response.users;
    if (response.roles && Array.isArray(response.roles)) return response.roles;
    if (response.permissions && Array.isArray(response.permissions)) return response.permissions;
    return [];
};

const UsersTab: React.FC<UsersTabProps> = ({ usersList }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    
    // UI State
    const [activeSection, setActiveSection] = useState<'users' | 'roles'>('users');
    const [loading, setLoading] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
    
    // Data State
    const [users, setUsers] = useState<User[]>(usersList);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    // User Form State
    const [showUserForm, setShowUserForm] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userData, setUserData] = useState({ name: '', email: '', password: '', role_id: '' });

    // Role Form State
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    // Permissions Modal State
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    // Initial Load
    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.getUsers();
            setUsers(getArray(res));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadRoles = async () => {
        try {
            const res = await api.getRoles();
            setRoles(getArray(res));
        } catch (e) { console.error(e); }
    };

    const loadPermissions = async () => {
        try {
            const res = await api.getPermissions();
            setPermissions(getArray(res));
        } catch (e) { console.error(e); }
    };

    // --- User Actions ---

    const handleEditUser = (user: User) => {
        setUserData({
            name: user.name,
            email: user.email,
            password: '', // Password is usually not retrieved for security, keep empty for no-change
            role_id: user.role_id ? user.role_id.toString() : (user.role?.id ? user.role.id.toString() : '')
        });
        setEditingUserId(user.id);
        setIsEditingUser(true);
        setShowUserForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetUserForm = () => {
        setUserData({ name: '', email: '', password: '', role_id: '' });
        setEditingUserId(null);
        setIsEditingUser(false);
        setShowUserForm(false);
    };

    const handleSaveUser = async () => {
        if (!userData.name || !userData.email || !userData.role_id) {
            showToast(t({ar: 'يرجى ملء الحقول المطلوبة', en: 'Please fill required fields'}), 'error');
            return;
        }
        
        // For creation, password is required
        if (!isEditingUser && !userData.password) {
             showToast(t({ar: 'كلمة المرور مطلوبة', en: 'Password is required'}), 'error');
             return;
        }

        setLoading(true);
        try {
            if (isEditingUser && editingUserId) {
                // For update, only send password if it's not empty
                const payload = { ...userData };
                if (!payload.password) delete (payload as any).password;
                
                await api.updateUser(editingUserId, payload);
                showToast(t({ar: 'تم تحديث المستخدم بنجاح', en: 'User updated successfully'}), 'success');
            } else {
                await api.createUser(userData);
                showToast(t({ar: 'تم إنشاء المستخدم بنجاح', en: 'User created successfully'}), 'success');
            }
            resetUserForm();
            loadUsers();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حفظ المستخدم', en: 'Failed to save user'}), 'error');
        } finally {
            setLoading(false);
        }
    };

    const executeDeleteUser = async (id: number) => {
        try {
            await api.deleteUser(id);
            showToast(t({ar: 'تم حذف المستخدم', en: 'User deleted'}), 'success');
            loadUsers();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل الحذف', en: 'Delete failed'}), 'error');
        } finally {
            setDeleteUserId(null);
        }
    };

    // --- Role Actions ---

    const handleCreateRole = async () => {
        if (!newRole.name) {
            showToast(t({ar: 'يرجى إدخال اسم الدور', en: 'Please enter role name'}), 'error');
            return;
        }
        setLoading(true);
        try {
            await api.createRole(newRole.name, newRole.description);
            showToast(t({ar: 'تم إنشاء الدور بنجاح', en: 'Role created successfully'}), 'success');
            setShowRoleForm(false);
            setNewRole({ name: '', description: '' });
            loadRoles();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل إنشاء الدور', en: 'Failed to create role'}), 'error');
        } finally {
            setLoading(false);
        }
    };

    const executeDeleteRole = async (id: number) => {
        try {
            await api.deleteRole(id);
            showToast(t({ar: 'تم حذف الدور', en: 'Role deleted'}), 'success');
            loadRoles();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل الحذف', en: 'Delete failed'}), 'error');
        } finally {
            setDeleteRoleId(null);
        }
    };

    const openPermissionsModal = (role: Role) => {
        setCurrentRoleId(role.id);
        const currentPerms = role.permissions?.map(p => p.id) || [];
        setSelectedPermissions(currentPerms);
        setShowPermissionModal(true);
    };

    const handleAttachPermissions = async () => {
        if (!currentRoleId) return;
        setLoading(true);
        try {
            await api.attachPermissionsToRole(currentRoleId, selectedPermissions);
            showToast(t({ar: 'تم تحديث الصلاحيات', en: 'Permissions updated'}), 'success');
            setShowPermissionModal(false);
            loadRoles(); 
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل تحديث الصلاحيات', en: 'Failed to update permissions'}), 'error');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Sub-Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button 
                    onClick={() => setActiveSection('users')} 
                    className={`px-6 py-3 font-medium transition-colors ${activeSection === 'users' ? 'border-b-2 border-med-tech-blue text-med-tech-blue' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t({ar: 'إدارة المستخدمين', en: 'Users Management'})}
                </button>
                <button 
                    onClick={() => setActiveSection('roles')} 
                    className={`px-6 py-3 font-medium transition-colors ${activeSection === 'roles' ? 'border-b-2 border-med-tech-blue text-med-tech-blue' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t({ar: 'الأدوار والصلاحيات', en: 'Roles & Permissions'})}
                </button>
            </div>

            {/* --- USERS SECTION --- */}
            {activeSection === 'users' && (
                <>
                    <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div>
                            <h3 className="text-xl font-bold text-med-blue">{t({ar: 'المستخدمون', en: 'Users'})}</h3>
                            <p className="text-gray-500 text-sm">{t({ar: 'إضافة وتعديل وحذف مستخدمي النظام', en: 'Manage system users'})}</p>
                        </div>
                        <button 
                            onClick={() => {
                                if (showUserForm) resetUserForm();
                                else setShowUserForm(true);
                            }}
                            className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showUserForm ? 'bg-gray-200 text-gray-800' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}
                        >
                            {showUserForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة مستخدم', en: '+ Add User'})}
                        </button>
                    </div>

                    {showUserForm && (
                        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                            <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditingUser ? t({ar: 'تعديل المستخدم', en: 'Edit User'}) : t({ar: 'بيانات المستخدم الجديد', en: 'New User Details'})}</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup label={t({ar: 'الاسم', en: 'Name'})}>
                                    <input className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
                                </InputGroup>
                                <InputGroup label={t({ar: 'البريد الإلكتروني', en: 'Email'})}>
                                    <input type="email" className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
                                </InputGroup>
                                <InputGroup label={isEditingUser ? t({ar: 'كلمة المرور (اتركها فارغة لعدم التغيير)', en: 'Password (leave empty to keep)'}) : t({ar: 'كلمة المرور', en: 'Password'})}>
                                    <input type="password" className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
                                </InputGroup>
                                <InputGroup label={t({ar: 'الدور', en: 'Role'})}>
                                    <select 
                                        className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900"
                                        value={userData.role_id}
                                        onChange={e => setUserData({...userData, role_id: e.target.value})}
                                    >
                                        <option value="">{t({ar: 'اختر الدور', en: 'Select Role'})}</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </InputGroup>
                            </div>
                            <button onClick={handleSaveUser} disabled={loading} className="mt-4 w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                                {loading ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : (isEditingUser ? t({ar: 'تحديث المستخدم', en: 'Update User'}) : t({ar: 'حفظ المستخدم', en: 'Save User'}))}
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-4 text-start">{t({ar: 'الاسم', en: 'Name'})}</th>
                                    <th className="p-4 text-start">{t({ar: 'البريد الإلكتروني', en: 'Email'})}</th>
                                    <th className="p-4 text-start">{t({ar: 'الدور', en: 'Role'})}</th>
                                    <th className="p-4 text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{u.name}</td>
                                        <td className="p-4 text-gray-600">{u.email}</td>
                                        <td className="p-4">
                                            {u.role ? (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{u.role.name}</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-end space-x-2">
                                            {deleteUserId === u.id ? (
                                                <div className="inline-flex items-center gap-2">
                                                    <span className="text-xs text-red-600 font-bold">{t({ar: 'تأكيد الحذف؟', en: 'Confirm Delete?'})}</span>
                                                    <button onClick={() => executeDeleteUser(u.id)} className="text-white bg-red-600 hover:bg-red-700 font-medium text-xs px-3 py-1 rounded transition-colors">{t({ar: 'نعم', en: 'Yes'})}</button>
                                                    <button onClick={() => setDeleteUserId(null)} className="text-gray-600 bg-gray-200 hover:bg-gray-300 font-medium text-xs px-3 py-1 rounded transition-colors">{t({ar: 'لا', en: 'No'})}</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                                    <button onClick={() => setDeleteUserId(u.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">{t({ar: 'حذف', en: 'Delete'})}</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t({ar: 'لا يوجد مستخدمين', en: 'No users found'})}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- ROLES SECTION --- */}
            {activeSection === 'roles' && (
                <>
                    <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div>
                            <h3 className="text-xl font-bold text-med-blue">{t({ar: 'الأدوار', en: 'Roles'})}</h3>
                            <p className="text-gray-500 text-sm">{t({ar: 'إدارة الأدوار وصلاحيات النظام', en: 'Manage roles and system permissions'})}</p>
                        </div>
                        <button 
                            onClick={() => setShowRoleForm(!showRoleForm)} 
                            className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showRoleForm ? 'bg-gray-200 text-gray-800' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}
                        >
                            {showRoleForm ? t({ar: 'إلغاء', en: 'Cancel'}) : t({ar: '+ إضافة دور', en: '+ Add Role'})}
                        </button>
                    </div>

                    {showRoleForm && (
                        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                            <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{t({ar: 'بيانات الدور الجديد', en: 'New Role Details'})}</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup label={t({ar: 'اسم الدور', en: 'Role Name'})}>
                                    <input className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900" value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} placeholder="e.g. Manager" />
                                </InputGroup>
                                <InputGroup label={t({ar: 'الوصف', en: 'Description'})}>
                                    <input className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900" value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} placeholder="Role description" />
                                </InputGroup>
                            </div>
                            <button onClick={handleCreateRole} disabled={loading} className="mt-4 w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                                {loading ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : t({ar: 'حفظ الدور', en: 'Save Role'})}
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-4 text-start">{t({ar: 'الدور', en: 'Role'})}</th>
                                    <th className="p-4 text-start">{t({ar: 'الوصف', en: 'Description'})}</th>
                                    <th className="p-4 text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {roles.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-bold text-med-tech-blue">{r.name}</td>
                                        <td className="p-4 text-gray-600">{r.description}</td>
                                        <td className="p-4 text-end space-x-2 rtl:space-x-reverse">
                                            <button onClick={() => openPermissionsModal(r)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                                                {t({ar: 'الصلاحيات', en: 'Permissions'})}
                                            </button>
                                            {deleteRoleId === r.id ? (
                                                <div className="inline-flex items-center gap-2 align-middle">
                                                    <span className="text-xs text-red-600 font-bold">{t({ar: 'تأكيد؟', en: 'Confirm?'})}</span>
                                                    <button onClick={() => executeDeleteRole(r.id)} className="text-white bg-red-600 hover:bg-red-700 font-medium text-xs px-2 py-1 rounded transition-colors">{t({ar: 'نعم', en: 'Yes'})}</button>
                                                    <button onClick={() => setDeleteRoleId(null)} className="text-gray-600 bg-gray-200 hover:bg-gray-300 font-medium text-xs px-2 py-1 rounded transition-colors">{t({ar: 'لا', en: 'No'})}</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteRoleId(r.id)} className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors">
                                                    {t({ar: 'حذف', en: 'Delete'})}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {roles.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-500">{t({ar: 'لا توجد أدوار', en: 'No roles found'})}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- PERMISSIONS MODAL --- */}
            {showPermissionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-down">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                            <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة الصلاحيات', en: 'Manage Permissions'})}</h3>
                            <button onClick={() => setShowPermissionModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {permissions.map(perm => (
                                    <label key={perm.id} className={`flex items-start p-3 rounded border cursor-pointer transition-colors ${selectedPermissions.includes(perm.id) ? 'bg-blue-50 border-med-tech-blue' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="mt-1 w-4 h-4 text-med-tech-blue rounded focus:ring-med-tech-blue"
                                            checked={selectedPermissions.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                        />
                                        <div className="ml-3 rtl:mr-3">
                                            <span className="block font-semibold text-sm text-gray-800">{perm.name}</span>
                                            {perm.description && <span className="block text-xs text-gray-500">{perm.description}</span>}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                            <button onClick={() => setShowPermissionModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">
                                {t({ar: 'إلغاء', en: 'Cancel'})}
                            </button>
                            <button onClick={handleAttachPermissions} disabled={loading} className="px-6 py-2 bg-med-vital-green text-white rounded font-bold hover:bg-green-700 transition-colors">
                                {loading ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : t({ar: 'حفظ الصلاحيات', en: 'Save Permissions'})}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTab;
