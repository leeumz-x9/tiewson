// AdminCMS.js (ฉบับสมบูรณ์ - รวมทุกฟีเจอร์)
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { Upload, Trash2, Image as ImageIcon, Video, Plus, X } from 'lucide-react';

// Import Dashboard และ Heatmap
import AdminDashboard from './AdminDashboard';
import AdminHeatmap from './AdminHeatmap';

const AdminCMS = () => {
    // Tab Management
    const [activeTab, setActiveTab] = useState('news');
    
    const [newsItems, setNewsItems] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [formData, setFormData] = useState({
        titleTh: '',
        titleEn: '',
        titleZh: '',
        titleKo: '',
        descriptionTh: '',
        descriptionEn: '',
        descriptionZh: '',
        descriptionKo: '',
        mediaType: 'image',
        mediaUrl: '',
        targetGender: 'all',
        targetAgeMin: '',
        targetAgeMax: ''
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const convertGoogleDriveUrl = (url) => {
        if (!url || !url.includes('drive.google.com')) return url;
        let fileId = '';
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
        if (fileId) {
            if (formData.mediaType === 'video') {
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
            return `https://drive.google.com/thumbnail?sz=w1000&id=${fileId}`;
        }
        return url;
    };

    useEffect(() => {
        if (activeTab === 'news') {
            fetchNewsItems();
        }
    }, [activeTab]);

    const fetchNewsItems = async () => {
        try {
            const newsRef = collection(db, 'news');
            const snapshot = await getDocs(newsRef);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNewsItems(items);
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            if (file.type.startsWith('video/')) {
                setFormData({ ...formData, mediaType: 'video' });
            } else {
                setFormData({ ...formData, mediaType: 'image' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.mediaUrl && !mediaFile) {
            alert('กรุณาใส่ URL Google Drive หรือเลือกไฟล์');
            return;
        }
        setUploading(true);
        try {
            let mediaUrl = formData.mediaUrl;
            if (mediaUrl) {
                mediaUrl = convertGoogleDriveUrl(mediaUrl);
            }
            if (mediaFile && !formData.mediaUrl) {
                const fileName = `news/${Date.now()}_${mediaFile.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, mediaFile);
                mediaUrl = await getDownloadURL(storageRef);
            }
            const newsData = {
                ...formData,
                mediaUrl,
                targetAgeMin: formData.targetAgeMin ? parseInt(formData.targetAgeMin) : null,
                targetAgeMax: formData.targetAgeMax ? parseInt(formData.targetAgeMax) : null,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, 'news'), newsData);
            setFormData({
                titleTh: '',
                titleEn: '',
                titleZh: '',
                titleKo: '',
                descriptionTh: '',
                descriptionEn: '',
                descriptionZh: '',
                descriptionKo: '',
                mediaType: 'image',
                mediaUrl: '',
                targetGender: 'all',
                targetAgeMin: '',
                targetAgeMax: ''
            });
            setMediaFile(null);
            setPreviewUrl(null);
            setIsFormOpen(false);
            fetchNewsItems();
            alert('เพิ่มข่าวสารสำเร็จ!');
        } catch (error) {
            console.error('Error adding news:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มข่าวสาร');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('ต้องการลบข่าวสารนี้หรือไม่?')) {
            try {
                await deleteDoc(doc(db, 'news', id));
                fetchNewsItems();
                alert('ลบข่าวสารสำเร็จ!');
            } catch (error) {
                console.error('Error deleting news:', error);
                alert('เกิดข้อผิดพลาดในการลบข่าวสาร');
            }
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'heatmap':
                return <AdminHeatmap />;
            case 'news':
            default:
                return renderNewsManagement();
        }
    };

    const renderNewsManagement = () => (
        <>
            {/* Guide Modal */}
            {showGuide && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">📁 คู่มือใช้ Google Drive</h2>
                                <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-5 rounded-lg">
                                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        สำหรับรูปภาพ
                                    </h3>
                                    <ol className="space-y-2 text-sm text-gray-700">
                                        <li><strong>1.</strong> อัปโหลดรูปไปที่ Google Drive</li>
                                        <li><strong>2.</strong> คลิกขวาที่ไฟล์ → เลือก <strong>"Share"</strong></li>
                                        <li><strong>3.</strong> คลิก <strong>"Change to anyone with the link"</strong></li>
                                        <li><strong>4.</strong> เลือก <strong>Viewer</strong> → คลิก <strong>"Copy link"</strong></li>
                                        <li><strong>5.</strong> นำ Link มาวางใน Admin (ระบบจะแปลงอัตโนมัติ)</li>
                                    </ol>
                                </div>
                                <button
                                    onClick={() => setShowGuide(false)}
                                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition"
                                >
                                    เข้าใจแล้ว
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add News Form Modal - ฟอร์มครบทุกฟิลด์ */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">เพิ่มข่าวสารใหม่</h2>
                                <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Instructions */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">📁</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                                🎯 วิธีใช้: อัปโหลดรูป/วิดีโอไปที่ Google Drive
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowGuide(true)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-1"
                                            >
                                                📖 ดูคู่มือละเอียด
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Media Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภทสื่อ *</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                value="image"
                                                checked={formData.mediaType === 'image'}
                                                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <ImageIcon className="w-5 h-5 text-gray-600" />
                                            <span className="text-sm text-gray-700">รูปภาพ</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                value="video"
                                                checked={formData.mediaType === 'video'}
                                                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Video className="w-5 h-5 text-gray-600" />
                                            <span className="text-sm text-gray-700">วิดีโอ</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Media URL */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Google Drive URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.mediaUrl}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            setFormData({ ...formData, mediaUrl: url });
                                            if (url) {
                                                const converted = convertGoogleDriveUrl(url);
                                                setPreviewUrl(converted);
                                            } else {
                                                setPreviewUrl(null);
                                            }
                                        }}
                                        placeholder="https://drive.google.com/file/d/1abc123xyz/view"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Preview */}
                                {previewUrl && (
                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">ตัวอย่าง:</p>
                                        {formData.mediaType === 'video' ? (
                                            <iframe
                                                src={previewUrl}
                                                className="w-full h-64 rounded"
                                                allow="autoplay"
                                                title="Video preview"
                                            ></iframe>
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-64 mx-auto rounded"
                                                referrerPolicy="no-referrer"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Titles - 4 ภาษา */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">หัวข้อ (ไทย) *</label>
                                        <input
                                            type="text"
                                            value={formData.titleTh}
                                            onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title (English)</label>
                                        <input
                                            type="text"
                                            value={formData.titleEn}
                                            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">标题 (中文)</label>
                                        <input
                                            type="text"
                                            value={formData.titleZh}
                                            onChange={(e) => setFormData({ ...formData, titleZh: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">제목 (한국어)</label>
                                        <input
                                            type="text"
                                            value={formData.titleKo}
                                            onChange={(e) => setFormData({ ...formData, titleKo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Descriptions - 2 ภาษา */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียด (ไทย)</label>
                                        <textarea
                                            value={formData.descriptionTh}
                                            onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description (English)</label>
                                        <textarea
                                            value={formData.descriptionEn}
                                            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">描述 (中文)</label>
                                        <textarea
                                            value={formData.descriptionZh}
                                            onChange={(e) => setFormData({ ...formData, descriptionZh: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">설명 (한국어)</label>
                                        <textarea
                                            value={formData.descriptionKo}
                                            onChange={(e) => setFormData({ ...formData, descriptionKo: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Target Audience */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">กลุ่มเป้าหมาย (เพศ)</label>
                                        <select
                                            value={formData.targetGender}
                                            onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">ทั้งหมด</option>
                                            <option value="male">ชาย</option>
                                            <option value="female">หญิง</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">อายุขั้นต่ำ</label>
                                        <input
                                            type="number"
                                            value={formData.targetAgeMin}
                                            onChange={(e) => setFormData({ ...formData, targetAgeMin: e.target.value })}
                                            placeholder="เช่น 15"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">อายุสูงสุด</label>
                                        <input
                                            type="number"
                                            value={formData.targetAgeMax}
                                            onChange={(e) => setFormData({ ...formData, targetAgeMax: e.target.value })}
                                            placeholder="เช่น 25"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                                    >
                                        {uploading ? 'กำลังอัปโหลด...' : 'บันทึก'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* News List */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">ข่าวสารทั้งหมด ({newsItems.length})</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowGuide(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            📖 คู่มือ
                        </button>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            เพิ่มข่าวสาร
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newsItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                            <div className="relative h-40 bg-gray-200">
                                {item.mediaType === 'video' ? (
                                    <video src={item.mediaUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={item.mediaUrl} alt={item.titleTh} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{item.titleTh}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.descriptionTh}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{item.targetGender === 'all' ? 'ทั้งหมด' : item.targetGender === 'male' ? 'ชาย' : 'หญิง'}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header with Tabs */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการ Admin</h1>
                            <p className="text-sm text-gray-600">วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-3 font-semibold transition-colors ${
                                activeTab === 'dashboard'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('heatmap')}
                            className={`px-6 py-3 font-semibold transition-colors ${
                                activeTab === 'heatmap'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            🗺️ Heatmap
                        </button>
                        <button
                            onClick={() => setActiveTab('news')}
                            className={`px-6 py-3 font-semibold transition-colors ${
                                activeTab === 'news'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            📰 จัดการข่าวสาร
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminCMS;