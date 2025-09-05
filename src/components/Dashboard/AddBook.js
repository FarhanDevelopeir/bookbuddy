'use client';
import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { BookPlus, Upload, Star, X, ImageIcon, Loader2, Check, RotateCw, AlertCircle } from 'lucide-react';
import getImageSrc from '@/utils/getImageSrc';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  const crop = makeAspectCrop(
    {
      unit: '%',
      width: 90,
    },
    aspect,
    mediaWidth,
    mediaHeight,
  );
  return centerCrop(crop, mediaWidth, mediaHeight);
}

const AddBook = ({
  bookForm,
  setBookForm,
  handleFormChange,
  handleFileUpload: originalHandleFileUpload,
  setThumbnail,
  removeImage,
  handleSubmitBook,
  uploadingImages
}) => {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(4 / 3);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
  setBookForm({
    title: '',
    price: '',
    description: '',
    year: '',
    condition: '',
    department: '',
    images: [],
    thumbnailIndex: 0,
  });
}, []);


  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!bookForm.title.trim()) newErrors.title = 'Book title is required';
    if (!bookForm.price || parseFloat(bookForm.price) <= 0) newErrors.price = 'Valid price is required';
    if (!bookForm.condition) newErrors.condition = 'Condition is required';
    if (!bookForm.year) newErrors.year = 'Year is required';
    if (!bookForm.department) newErrors.department = 'Department is required';
    if (!bookForm.description.trim()) newErrors.description = 'Description is required';
    if (bookForm.images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      await handleSubmitBook();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !uploadingImages) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    } else {
      console.log('File input blocked:', {
        noInput: !fileInputRef.current,
        uploading: uploadingImages
      });
    }
  };

  // Function to handle image load and set initial crop
  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const canvasPreview = (image, canvas, crop, scale = 1, rotate = 0) => {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = rotate * (Math.PI / 180);
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    ctx.restore();
  };

  const handleRotationChange = (newRotation) => {
    setRotation(newRotation);
    if (imgRef.current) {
      imgRef.current.style.transform = `rotate(${newRotation}deg)`;
    }
  };

  const handleFileSelect = (event) => {
    console.log('File selected:', event.target.files?.[0]?.name);
    
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file found');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result?.toString() || '');
      setCropModalOpen(true);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setRotation(0); 
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0); 
    
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 100);
    
    console.log('Crop modal cancelled - ready for next upload');
  };

  const applyCrop = async () => {
    if (imgRef.current && previewCanvasRef.current && completedCrop) {
      const blob = await new Promise((resolve) => {
        previewCanvasRef.current?.toBlob(resolve, 'image/jpeg', 0.9);
      });

      if (blob) {
        const croppedFile = new File([blob], `cropped-image-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        const customEvent = {
          target: {
            files: [croppedFile]
          }
        };

        originalHandleFileUpload(customEvent);
      }
    }

    setCropModalOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 100);
    
    console.log('Crop applied and modal closed - ready for next upload');
  };

  React.useEffect(() => {
    if (completedCrop && imgRef.current && previewCanvasRef.current) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        1,
        rotation 
      );
    }
  }, [completedCrop, rotation]); 

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 sm:p-4 lg:p-6">
        <div className="w-full max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookPlus className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl">List Your Book</CardTitle>
                  <CardDescription className="text-indigo-100 mt-1 sm:mt-2 text-sm sm:text-base">
                    Create an amazing listing that sells
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-8">

                {/* Title + Price */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-800 mb-2">
                      Book Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={bookForm.title}
                      onChange={(e) => {
                        handleFormChange('title', e.target.value);
                        if (errors.title) setErrors({...errors, title: ''});
                      }}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-base sm:text-lg ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="What's the title of your book?"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-800 mb-2">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base sm:text-lg font-medium">
                        $
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={bookForm.price}
                        onChange={(e) => {
                          handleFormChange('price', e.target.value);
                          if (errors.price) setErrors({...errors, price: ''});
                        }}
                        className={`w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-base sm:text-lg ${errors.price ? 'border-red-500' : 'border-gray-200'}`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Condition + Department */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="condition" className="text-sm font-semibold text-gray-800 mb-2">Condition <span className="text-red-500">*</span></Label>
                    <Select
                      value={bookForm.condition}
                      onValueChange={(value) => {
                        handleFormChange('condition', value);
                        if (errors.condition) setErrors({...errors, condition: ''});
                      }}
                    >
                      <SelectTrigger id="condition" className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-base sm:text-lg bg-white ${errors.condition ? 'border-red-500' : 'border-gray-200'}`}>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Like New">Like New</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.condition}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-sm font-semibold text-gray-800 mb-2">Year <span className="text-red-500">*</span></Label>
                    <Select
                      value={bookForm.year}
                      onValueChange={(value) => {
                        handleFormChange('year', value);
                        if (errors.year) setErrors({...errors, year: ''});
                      }}
                    >
                      <SelectTrigger id="year" className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-base sm:text-lg bg-white ${errors.year ? 'border-red-500' : 'border-gray-200'}`}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Year">First Year</SelectItem>
                        <SelectItem value="Second Year">Second Year</SelectItem>
                        <SelectItem value="Third Year">Third Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.year && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.year}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-sm font-semibold text-gray-800 mb-2">Department <span className="text-red-500">*</span></Label>
                    <Select
                      value={bookForm.department}
                      onValueChange={(value) => {
                        handleFormChange('department', value);
                        if (errors.department) setErrors({...errors, department: ''});
                      }}
                    >
                      <SelectTrigger id="department" className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-base sm:text-lg bg-white ${errors.department ? 'border-red-500' : 'border-gray-200'}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Mechanical">Mechanical</SelectItem>
                        <SelectItem value="Auto & Diesel">Auto & Diesel</SelectItem>
                        <SelectItem value="Quantity Survey">Quantity Survey</SelectItem>
                        <SelectItem value="Civil">Civil</SelectItem>
                        <SelectItem value="ICT">ICT</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-800 mb-2">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    rows="4"
                    value={bookForm.description}
                    onChange={(e) => {
                      handleFormChange('description', e.target.value);
                      if (errors.description) setErrors({...errors, description: ''});
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-base sm:text-lg resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="Tell buyers about your book's condition, edition, and what makes it special..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {errors.description}
                    </p>
                  )}
                </div>

                {/* Image Upload Section */}
                <div id="images">
                  <Label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                    Book Images (Up to 3) <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-1 sm:ml-2">- Choose your thumbnail</span>
                  </Label>

                  {errors.images && (
                    <p className="text-red-500 text-sm mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {errors.images}
                    </p>
                  )}

                  {uploadingImages && (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 animate-spin" />
                        <span className="text-blue-800 font-medium text-sm sm:text-base">
                          Uploading images...
                        </span>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadingImages}
                  />

                  {bookForm.images.length === 0 ? (
                    <div
                      className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${uploadingImages
                        ? 'border-blue-300 bg-blue-50/50 cursor-not-allowed'
                        : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                      onClick={() => !uploadingImages && triggerFileInput()}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        {uploadingImages ? (
                          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 mx-auto animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-indigo-300 mx-auto group-hover:text-indigo-500 transition-all" />
                            <p className="font-semibold text-gray-700 text-sm sm:text-lg">Drop your images here</p>
                            <p className="text-gray-500 text-xs sm:text-sm">PNG, JPG up to 10MB each</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {[0, 1, 2].map((index) => (
                          <div key={index} className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-700 text-sm sm:text-base">
                                {index === 0 ? 'Thumbnail' : `Image ${index + 1}`}
                              </h4>
                              {bookForm.images[index] && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setThumbnail(index)}
                                  className={`flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-all ${bookForm.thumbnailIndex === index
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                                    }`}
                                >
                                  <Star className={`h-3 w-3 ${bookForm.thumbnailIndex === index ? 'fill-current' : ''}`} />
                                  <span>{bookForm.thumbnailIndex === index ? 'Thumbnail' : 'Set as thumbnail'}</span>
                                </Button>
                              )}
                            </div>

                            {bookForm.images[index] ? (
                              <div className="relative group">
                                <img
                                  src={getImageSrc(bookForm.images[index])}
                                  alt={`Upload ${index + 1}`}
                                  className={`w-full h-40 sm:h-48 object-cover rounded-xl border-2 transition-all ${bookForm.thumbnailIndex === index
                                    ? 'border-yellow-400 shadow-lg'
                                    : 'border-gray-200 group-hover:border-gray-300'
                                    }`}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-0 -right-0 sm:-top-0 sm:-right-0 rounded-full p-1.5 w-6 h-6 hover:bg-red-600 shadow-lg"
                                >
                                  <X className="h-1 w-1 sm:h-1 sm:w-1" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className={`h-40 sm:h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer ${uploadingImages
                                  ? 'border-blue-300 text-blue-400 bg-blue-50/30 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500'
                                  }`}
                                onClick={() => !uploadingImages && triggerFileInput()}
                              >
                                {uploadingImages ? (
                                  <>
                                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 mb-1 animate-spin" />
                                    <span className="text-xs sm:text-sm">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
                                    <span className="text-xs sm:text-sm">Add Image</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {bookForm.images.length < 3 && (
                        <Button
                          variant="outline"
                          onClick={() => triggerFileInput()}
                          className="w-full py-2 sm:py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-sm sm:text-base"
                        >
                          + Add More Images ({bookForm.images.length}/3)
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t border-gray-200">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <BookPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Publish Book</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Crop Modal */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[50vh] mx-auto"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ maxWidth: '100%', maxHeight: '50vh' }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}

            {/* Simplified aspect ratio buttons - only 4:3 and Free Form */}
            <div className="flex gap-2 justify-center">
              <Button
                variant={aspect === 4 / 3 ? "default" : "outline"}
                onClick={() => setAspect(4 / 3)}
              >
                4:3 (Landscape)
              </Button>
            </div>

            {/* Rotation Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rotation" className="text-sm font-medium text-gray-700">Rotation</Label>
                <span className="text-sm text-gray-500">{rotation}°</span>
              </div>
              <Slider
                id="rotation"
                min={0}
                max={360}
                value={[rotation]}
                onValueChange={([value]) => handleRotationChange(value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelCrop}
              >
                Cancel
              </Button>
              <Button
                onClick={applyCrop}
                disabled={!completedCrop}
                className="flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Apply Crop</span>
              </Button>
            </div>
          </div>

          {/* Hidden canvas for preview */}
          {completedCrop && (
            <div className="hidden">
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: 'none',
                  objectFit: 'contain',
                  width: completedCrop.width,
                  height: completedCrop.height,
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddBook;