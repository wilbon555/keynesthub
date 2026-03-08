import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Save, X, MousePointer2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LatLng {
  lat: number;
  lng: number;
}

interface PolygonDrawingControlsProps {
  isDrawing: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onClearPolygon: () => void;
  polygonPoints: LatLng[];
  propertiesInPolygon: number;
}

export const PolygonDrawingControls: React.FC<PolygonDrawingControlsProps> = ({
  isDrawing,
  onStartDrawing,
  onStopDrawing,
  onClearPolygon,
  polygonPoints,
  propertiesInPolygon,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveSearch = useCallback(async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save your search.', variant: 'destructive' });
      return;
    }
    if (!searchName.trim()) {
      toast({ title: 'Name required', description: 'Please enter a name for your saved search.', variant: 'destructive' });
      return;
    }
    if (polygonPoints.length < 3) {
      toast({ title: 'Invalid polygon', description: 'Please draw a complete polygon with at least 3 points.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await (supabase.from('saved_searches' as any).insert({
        user_id: user.id,
        name: searchName.trim(),
        search_type: 'polygon',
        polygon_coordinates: polygonPoints,
        notifications_enabled: true,
      }) as any);

      if (error) throw error;

      toast({ title: 'Search saved!', description: 'You will be notified when new properties match your search area.' });
      setShowSaveDialog(false);
      setSearchName('');
    } catch (err) {
      console.error('Error saving search:', err);
      toast({ title: 'Error', description: 'Failed to save search. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [user, searchName, polygonPoints, toast]);

  return (
    <>
      <div className="flex flex-col gap-2">
        {!isDrawing ? (
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur-sm shadow-lg border-border/50" onClick={onStartDrawing}>
            <Pencil className="w-4 h-4 mr-2" />
            Draw Area
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="default" size="sm" className="shadow-lg" onClick={onStopDrawing}>
              <MousePointer2 className="w-4 h-4 mr-2" />
              Finish Drawing
            </Button>
            <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur-sm shadow-lg" onClick={onClearPolygon}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        )}

        {polygonPoints.length >= 3 && !isDrawing && (
          <div className="flex flex-col gap-2">
            <div className="bg-background/95 backdrop-blur-sm shadow-lg rounded-md px-3 py-2 text-sm">
              <span className="font-medium text-primary">{propertiesInPolygon}</span>
              <span className="text-muted-foreground"> properties found</span>
            </div>
            <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur-sm shadow-lg" onClick={() => setShowSaveDialog(true)}>
              <Save className="w-4 h-4 mr-2" />
              Save Search
            </Button>
            <Button variant="ghost" size="sm" className="bg-background/95 backdrop-blur-sm shadow-lg" onClick={onClearPolygon}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Search Name</label>
              <Input placeholder="e.g., Downtown Properties" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" />
            </div>
            <p className="text-sm text-muted-foreground">You'll receive notifications when new properties are listed in this area.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSearch} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Search'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
