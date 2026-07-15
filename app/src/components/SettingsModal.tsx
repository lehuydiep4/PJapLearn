import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { AppSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useAppStore();
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-xl w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-4">Cài đặt</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nhà cung cấp AI (AI Provider)</label>
          <select 
            name="aiProvider"
            className="w-full p-2 rounded bg-background border"
            value={formData.aiProvider}
            onChange={handleChange}
          >
            <option value="openrouter">OpenRouter</option>
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="claude">Anthropic Claude</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Khóa API (API Key)</label>
          <input 
            type="password" 
            name="apiKey"
            className="w-full p-2 rounded bg-background border"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Nhập khóa API của bạn"
          />
          <p className="text-xs text-muted-foreground mt-1">Khóa API chỉ lưu cục bộ trên máy bạn, không bao giờ bị đồng bộ hay lộ ra ngoài.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Mô hình (Model)</label>
          <input 
            type="text" 
            name="model"
            className="w-full p-2 rounded bg-background border"
            value={formData.model}
            onChange={handleChange}
            placeholder="Ví dụ: google/gemini-2.5-flash"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-secondary"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
