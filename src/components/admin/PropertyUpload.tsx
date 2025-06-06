import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  MapPin, 
  Home, 
  DollarSign, 
  Square, 
  Camera, 
  Video,
  Star,
  Check,
  Plus
} from 'lucide-react';

interface PropertyForm {
  title: string;
  description: string;
  price: string;
  size: string;
  type: 'residential' | 'commercial' | 'industrial';
  category: string;
  province: string;
  city: string;
  district: string;
  neighborhood: string;
  status: 'available' | 'sold' | 'under-contract';
  featured: boolean;
  amenities: string[];
  images: File[];
  videos: File[];
}

const PropertyUpload: React.FC = () => {
  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    description: '',
    price: '',
    size: '',
    type: 'residential',
    category: '',
    province: '',
    city: '',
    district: '',
    neighborhood: '',
    status: 'available',
    featured: false,
    amenities: [],
    images: [],
    videos: []
  });

  const [dragActive, setDragActive] = useState(false);

  const provinces = [
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten',
    'Yogyakarta', 'Bali', 'Sumatera Utara', 'Sumatera Selatan', 'Kalimantan Timur'
  ];

  const propertyCategories = {
    residential: ['House', 'Apartment', 'Villa', 'Townhouse', 'Condominium'],
    commercial: ['Office', 'Retail', 'Restaurant', 'Hotel', 'Shopping Mall'],
    industrial: ['Warehouse', 'Factory', 'Manufacturing Plant', 'Distribution Center']
  };

  const amenitiesList = [
    'Swimming Pool', 'Gym/Fitness Center', 'Parking', 'Security 24/7', 'Garden',
    'Balcony', 'Air Conditioning', 'Furnished', 'Internet/WiFi', 'Elevator',
    'Playground', 'BBQ Area', 'Laundry', 'Storage', 'Pet Friendly'
  ];

  const handleInputChange = (field: keyof PropertyForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList, type: 'images' | 'videos') => {
    const newFiles = Array.from(files);
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...newFiles]
    }));
  };

  const removeFile = (index: number, type: 'images' | 'videos') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files, 'images');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Property data:', formData);
    // Handle form submission
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Add New Property</h2>
            <p className="text-sm text-neutral-600">Fill in the details to list a new property</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {propertyCategories[formData.type].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="under-contract">Under Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price (IDR) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Size (m²) *
                </label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter size"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property description"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Location Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Province *
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter district"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Neighborhood
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter neighborhood"
                />
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Media Upload
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-neutral-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-700 mb-2">
                Drag and drop images here
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'images')}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Images</span>
              </label>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index, 'images')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Amenities
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-neutral-300'
                  }`}>
                    {formData.amenities.includes(amenity) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{amenity}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Additional Options
            </h3>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleInputChange('featured', !formData.featured)}
                className={`flex items-center space-x-2 p-4 rounded-lg border transition-all duration-200 ${
                  formData.featured
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Star className={`w-5 h-5 ${formData.featured ? 'fill-current' : ''}`} />
                <span className="font-medium">Featured Listing</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Publish Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyUpload;