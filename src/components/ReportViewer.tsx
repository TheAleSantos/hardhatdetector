
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, FileText, Check } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisResult {
  fileName: string;
  fileType: string;
  fileSize: string;
  dimensions?: string;
  duration?: string;
  analysis: {
    description: string;
    details: string[];
    confidence: number;
  };
  timestamp: string;
}

interface ReportViewerProps {
  results: AnalysisResult[];
  onBack: () => void;
}

const ReportViewer = ({ results, onBack }: ReportViewerProps) => {
  const generatePDF = async () => {
    console.log('Iniciando geração do PDF...');
    
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Primeira página
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const timestamp = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-');
      pdf.save(`relatorio-midia-${timestamp}.pdf`);
      console.log('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const totalFiles = results.length;
  const avgConfidence = results.reduce((acc, result) => acc + result.analysis.confidence, 0) / totalFiles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
          <FileText className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
      </div>

      {/* Report Content */}
      <div id="report-content" className="bg-white">
        <Card className="p-8">
          {/* Report Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatório de Análise de Mídia
            </h1>
            <p className="text-gray-600">
              Relatório gerado em {new Date().toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Resumo Executivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalFiles}</div>
                <div className="text-sm text-gray-600">Arquivos Analisados</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {avgConfidence.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Confiança Média</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {results.filter(r => r.analysis.confidence > 90).length}
                </div>
                <div className="text-sm text-gray-600">Alta Confiança</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Análise Detalhada</h2>
            
            {results.map((result, index) => (
              <Card key={index} className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{result.fileName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{result.fileType}</Badge>
                      <Badge variant="outline">{result.fileSize}</Badge>
                      {result.dimensions && (
                        <Badge variant="outline">{result.dimensions}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {result.analysis.confidence.toFixed(1)}% confiança
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Descrição da Análise</h4>
                    <p className="text-gray-700">{result.analysis.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Detalhes Técnicos</h4>
                    <ul className="space-y-1">
                      {result.analysis.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-3">
                    Processado em: {result.timestamp}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>Relatório gerado automaticamente pelo Sistema de Análise de Mídia</p>
            <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportViewer;
