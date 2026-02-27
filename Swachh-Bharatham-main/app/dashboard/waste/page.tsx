'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface WasteCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function WasteDisposalPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    weight_kg: '',
    notes: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('waste_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.category_id || !formData.weight_kg) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = '';

      // Upload image if provided
      if (image) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from('waste-images')
          .upload(fileName, image);

        if (error) throw error;
        imageUrl = data.path;
      }

      // Create waste log
      const { error: logError } = await supabase.from('waste_logs').insert([
        {
          user_id: user.id,
          waste_category_id: formData.category_id,
          weight_kg: parseFloat(formData.weight_kg),
          image_url: imageUrl,
          notes: formData.notes,
          status: 'verified',
        },
      ]);

      if (logError) throw logError;

      // Update user profile stats
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_waste_kg, total_points')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newWasteKg = profile.total_waste_kg + parseFloat(formData.weight_kg);
        const newPoints = profile.total_points + Math.round(parseFloat(formData.weight_kg) * 10);

        await supabase
          .from('user_profiles')
          .update({
            total_waste_kg: newWasteKg,
            total_points: newPoints,
          })
          .eq('id', user.id);
      }

      toast.success(`Logged ${formData.weight_kg}kg of waste! +${Math.round(parseFloat(formData.weight_kg) * 10)} XP`);

      // Reset form
      setFormData({ category_id: '', weight_kg: '', notes: '' });
      setImage(null);
      setImagePreview('');
    } catch (error) {
      toast.error('Failed to log waste');
      console.error('[v0] Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Trash2 className="w-8 h-8 text-green-600" />
          Log Waste Disposal
        </h1>
        <p className="text-gray-600 mt-2">Record your waste disposal and earn points</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>New Waste Disposal Record</CardTitle>
          <CardDescription>Fill in the details of your waste disposal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700 font-medium">
                Waste Category *
              </Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger id="category" disabled={loading}>
                  <SelectValue placeholder="Select a waste category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-gray-700 font-medium">
                Weight (kg) *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="0.5"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                disabled={submitting}
                className="border-gray-300"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-700 font-medium">
                Upload Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={submitting}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="text-center">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setImage(null);
                        setImagePreview('');
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={submitting}
                className="border-gray-300"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Recording...' : 'Record Disposal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
