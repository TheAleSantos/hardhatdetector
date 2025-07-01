
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
  file: File;
  url: string;
  type: 'image' | 'video';
}

interface FilePreviewProps {
  fileData: UploadedFile;
}

const FilePreview = ({ fileData }: FilePreviewProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {fileData.type === 'image' ? (
          <img
            src={fileData.url}
            alt={fileData.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={fileData.url}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        )}
        
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90">
            {fileData.type === 'image' ? 'IMG' : 'VID'}
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm truncate" title={fileData.file.name}>
          {fileData.file.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {formatFileSize(fileData.file.size)}
        </p>
      </div>
    </Card>
  );
};

export default FilePreview;
