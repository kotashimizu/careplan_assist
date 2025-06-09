import React, { useState, useEffect } from 'react';
import { useEncryption, useAuditLog, useTenantConfig } from '@your-org/secure-toolkit';

function Editor({ post, onSave, onPublish }) {
  const { encrypt, decrypt } = useEncryption();
  const { logAction } = useAuditLog();
  const { isFeatureEnabled } = useTenantConfig();
  
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState(post?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 自動保存（下書き）
  useEffect(() => {
    const autoSave = async () => {
      if (!title && !content) return;
      
      setIsSaving(true);
      try {
        // 下書きを暗号化
        const draft = { title, content, tags, timestamp: Date.now() };
        const encrypted = await encrypt(JSON.stringify(draft));
        
        // ローカルストレージに保存
        const draftKey = `draft-${post?.id || 'new'}`;
        localStorage.setItem(draftKey, encrypted);
        
        setLastSaved(new Date());
        console.log('下書きを暗号化して保存しました');
      } catch (error) {
        console.error('自動保存エラー:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(autoSave, 3000); // 3秒後に自動保存
    return () => clearTimeout(timer);
  }, [title, content, tags, encrypt, post?.id]);

  // 下書きの読み込み
  useEffect(() => {
    const loadDraft = async () => {
      const draftKey = `draft-${post?.id || 'new'}`;
      const encrypted = localStorage.getItem(draftKey);
      
      if (encrypted && !post) {
        try {
          const decrypted = await decrypt(encrypted);
          const draft = JSON.parse(decrypted);
          
          setTitle(draft.title);
          setContent(draft.content);
          setTags(draft.tags || []);
          console.log('下書きを読み込みました');
        } catch (error) {
          console.error('下書き読み込みエラー:', error);
        }
      }
    };

    loadDraft();
  }, [decrypt, post]);

  const handleSave = async () => {
    const postData = { title, content, tags };
    
    // 保存アクションをログに記録
    await logAction({
      action: post ? 'UPDATE_POST' : 'CREATE_POST',
      target: post?.id || 'new',
      details: { title }
    });
    
    onSave(postData);
    
    // 下書きをクリア
    const draftKey = `draft-${post?.id || 'new'}`;
    localStorage.removeItem(draftKey);
  };

  const handlePublish = async () => {
    const postData = { title, content, tags, published: true };
    
    // 公開アクションをログに記録
    await logAction({
      action: 'PUBLISH_POST',
      target: post?.id || 'new',
      details: { title },
      metadata: { visibility: 'public' }
    });
    
    onPublish(postData);
    
    // 下書きをクリア
    const draftKey = `draft-${post?.id || 'new'}`;
    localStorage.removeItem(draftKey);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事タイトル"
          className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none pb-2"
        />
      </div>

      <div className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="記事の内容を入力..."
          className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {isFeatureEnabled('tags') && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="タグ（カンマ区切り）"
            value={tags.join(', ')}
            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isSaving && <span>保存中...</span>}
          {lastSaved && !isSaving && (
            <span>最終保存: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        <div className="space-x-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            下書き保存
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            公開
          </button>
        </div>
      </div>
    </div>
  );
}

export default Editor;