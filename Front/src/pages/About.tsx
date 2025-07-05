import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const About = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      setSelectedFile(file);
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} foi selecionado com sucesso.`,
      });
    } else {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Por favor, selecione um arquivo PDF ou imagem.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo foi selecionado.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    // Pega o nome do usuário do localStorage (ou define um padrão)
    const username = localStorage.getItem("username") || "Funcionário";
    formData.append("username", username);

    try {
      const response = await fetch(`${(window as any).urlBackEnd}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Erro ao enviar",
          description: errorData.message || "Ocorreu um erro durante o envio.",
          variant: "destructive",
        });
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "relatorio_epi.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();

        toast({
          title: "Upload bem-sucedido",
          description: "Relatório gerado e baixado com sucesso.",
        });
      } else if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        toast({
          title: "Resposta do servidor",
          description: errorData.message || "Nenhum objeto detectado.",
        });
      } else {
        toast({
          title: "Erro inesperado",
          description: "Resposta do servidor não reconhecida.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro inesperado durante o envio.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-[#007AFF] mb-8">
            Detecção de Uso de EPI com YOLOv8
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis orci vel lectus dictum ultricies et a lectus. Duis mattis vehicula fringilla. Ut faucibus ex sed risus lobortis venenatis. In augue dolor, facilisis sit amet placerat eu, sollicitudin ac ligula. Nunc a justo vel metus aliquam iaculis. Fusce maximus magna tellus, sed scelerisque arcu laoreet vel. Sed ligula augue, efficitur ut turpis eu, venenatis ornare lectus. Duis finibus lectus ut purus euismod pharetra. Donec commodo faucibus pellentesque. In eget elit congue, feugiat justo non, ullamcorper erat.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Envio de arquivo</h3>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-[#007AFF] bg-blue-50"
                  : selectedFile
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-white"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleFileInputChange}
              />

              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

              {selectedFile ? (
                <div>
                  <p className="text-green-600 font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Clique ou arraste o arquivo para esta área para fazer upload</p>
                  <p className="text-sm text-gray-400">Arquivos de imagem</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex-1 bg-[#007AFF] hover:bg-[#0056CC] text-white"
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;