
import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (files.length > 0) {
      console.log('Arquivos carregados via drag & drop:', files);
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (files.length > 0) {
      console.log('Arquivos selecionados:', files);
      onFileUpload(files);
    }
  }, [onFileUpload]);

  return (
    <Card 
      className={`border-2 border-dashed transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="block p-12 text-center cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 transition-colors ${
              isDragOver ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Suporta imagens (JPG, PNG, GIF) e vídeos (MP4, AVI, MOV)
            </p>
          </div>

          <div className="text-xs text-gray-400">
            Tamanho máximo: 50MB por arquivo
          </div>
        </div>
      </label>
    </Card>
  );
};

export default FileUpload;
