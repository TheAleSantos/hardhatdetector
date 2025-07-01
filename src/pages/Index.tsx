
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    
    const pdf = new jsPDF();
    
    // Título do relatório
    pdf.setFontSize(20);
    pdf.text('Relatório de Mídia', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
    pdf.text(`Total de arquivos: ${files.length}`, 20, 55);
    
    let yPosition = 70;
    
    // Lista de arquivos
    files.forEach((file, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(`${index + 1}. ${file.name}`, 20, yPosition);
      pdf.text(`   Tipo: ${file.type}`, 20, yPosition + 10);
      pdf.text(`   Tamanho: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 20, yPosition + 20);
      
      yPosition += 35;
    });
    
    // Salvar PDF
    pdf.save(`relatorio-midia-${new Date().toISOString().split('T')[0]}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerador de Relatórios
          </h1>
          <p className="text-gray-600">
            Faça upload de arquivos e gere um relatório em PDF
          </p>
        </div>

        {/* Upload */}
        <Card className="p-8 mb-6">
          <div className="text-center">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Clique para selecionar arquivos
                </p>
                <p className="text-sm text-gray-500">
                  Imagens e vídeos aceitos
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Lista de arquivos */}
        {files.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Arquivos Selecionados ({files.length})
            </h2>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Botão de gerar PDF */}
        {files.length > 0 && (
          <div className="text-center">
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório PDF
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
