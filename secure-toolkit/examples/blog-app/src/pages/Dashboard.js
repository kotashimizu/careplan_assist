import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { ProtectedRoute, useAuth, AuditLogViewer } from '@your-org/secure-toolkit';
import Editor from '../components/Editor';
import PostList from '../components/PostList';

function Dashboard() {
  const { user } = useAuth();

  // ロールチェック
  const canWrite = user?.role === 'author' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <ProtectedRoute role={['author', 'admin']}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* サイドバー */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-4">ダッシュボード</h3>
            <ul className="space-y-2">
              {canWrite && (
                <>
                  <li>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      記事一覧
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/new"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      新規作成
                    </Link>
                  </li>
                </>
              )}
              {isAdmin && (
                <>
                  <li className="pt-4 mt-4 border-t">
                    <Link
                      to="/dashboard/audit"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      監査ログ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/users"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      ユーザー管理
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* ステータス */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold text-gray-900 mb-3">統計</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">公開記事</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">下書き</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">総閲覧数</span>
                <span className="font-medium">1,234</span>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          <Routes>
            <Route index element={<PostList />} />
            <Route 
              path="new" 
              element={
                <div>
                  <h2 className="text-2xl font-bold mb-6">新規記事作成</h2>
                  <Editor
                    onSave={(data) => console.log('保存:', data)}
                    onPublish={(data) => console.log('公開:', data)}
                  />
                </div>
              } 
            />
            <Route 
              path="edit/:id" 
              element={
                <div>
                  <h2 className="text-2xl font-bold mb-6">記事編集</h2>
                  <Editor
                    post={{ id: '1', title: 'サンプル記事', content: '内容...' }}
                    onSave={(data) => console.log('更新:', data)}
                    onPublish={(data) => console.log('公開:', data)}
                  />
                </div>
              } 
            />
            {isAdmin && (
              <>
                <Route 
                  path="audit" 
                  element={
                    <div>
                      <h2 className="text-2xl font-bold mb-6">監査ログ</h2>
                      <AuditLogViewer />
                    </div>
                  } 
                />
                <Route 
                  path="users" 
                  element={
                    <div>
                      <h2 className="text-2xl font-bold mb-6">ユーザー管理</h2>
                      <p className="text-gray-600">ユーザー管理機能は開発中です。</p>
                    </div>
                  } 
                />
              </>
            )}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Dashboard;